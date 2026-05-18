export type GlobalInventory = {
  total: number
  sold: number
  available: number
  arrivals: number
  departures: number
  occupancy: number
  adr: number
  revenue: number
}

export type CategoryInventory = {
  total: number
  available: number
  sold: number
}

export type ShiftInventoryResult = {
  global: GlobalInventory
  categories: Record<string, CategoryInventory>
  detectedFiles: {
    gaSummaryFileName: string
    roomsAvailabilityFileName: string
  }
}

type CsvRow = Record<string, string>

const ROOM_TYPE_TOTALS: Record<string, number> = {
  VIQN: 12,
  QNQN: 48,
  KING: 40,
  VIKG: 0,
  SUIT: 10,
}

const ROOM_TYPE_ALIASES: Record<string, string> = {
  VIQN: "VIQN",
  "V-IQN": "VIQN",
  VIKG: "VIKG",
  "VIEW KING": "VIKG",
  "1 KING": "KING",
  KING: "KING",
  KINGS: "KING",
  "ADA KING": "KING",
  "2 QUEEN": "QNQN",
  QNQN: "QNQN",
  QUEEN: "QNQN",
  QUEENS: "QNQN",
  "ADA QUEEN": "QNQN",
  SUITE: "SUIT",
  SUITES: "SUIT",
  SUIT: "SUIT",
}

function normalizeHeader(value: string): string {
  return value.trim().replace(/\uFEFF/g, "")
}

function normalizeRoomType(value: string): string {
  const cleaned = value.trim().toUpperCase()
  return ROOM_TYPE_ALIASES[cleaned] ?? cleaned.replace(/\s+/g, "_")
}

function toNumber(value: string | undefined): number {
  if (!value) return 0
  const cleaned = value.replace(/[$,%\s,]/g, "")
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

function splitCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

function parseCsv(csvText: string): CsvRow[] {
  const lines = csvText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0)

  if (!lines.length) return []

  const headers = splitCsvLine(lines[0]).map(normalizeHeader)

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line)
    const row: CsvRow = {}
    headers.forEach((header, i) => {
      row[header] = (cells[i] ?? "").trim()
    })
    return row
  })
}

function findFirstExistingKey(row: CsvRow, keys: string[]): string | undefined {
  return keys.find((k) => k in row)
}

function looksLikeGASummary(rows: CsvRow[]): boolean {
  if (!rows.length) return false
  const row = rows[0]
  return ["ROOM_TOTAL", "COMMITTED", "Availability"].every((k) => k in row)
}

function looksLikeRoomsAvailability(rows: CsvRow[]): boolean {
  if (!rows.length) return false
  const row = rows[0]
  const hasType =
    "ROOM_TYPE" in row ||
    "Room Type" in row ||
    "ROOM TYPE" in row ||
    "CATEGORY" in row ||
    "Category" in row ||
    "TYPE" in row ||
    "Type" in row

  const hasAvail =
    "AVAILABLE" in row ||
    "Available" in row ||
    "Availability" in row ||
    "AVL" in row

  return hasType && hasAvail
}

function parseGASummary(rows: CsvRow[]): GlobalInventory {
  if (!rows.length) throw new Error("GA Summary file is empty.")

  const row = rows[0]

  const totalKey = findFirstExistingKey(row, ["ROOM_TOTAL", "Room Total", "TOTAL_ROOMS"])
  const soldKey = findFirstExistingKey(row, ["COMMITTED", "Committed", "ROOMS_SOLD", "Sold"])
  const availableKey = findFirstExistingKey(row, ["Availability", "AVAILABLE", "Available"])
  const arrivalsKey = findFirstExistingKey(row, ["ARRIVALS", "Arrivals"])
  const departuresKey = findFirstExistingKey(row, ["DEPARTURES", "Departures"])
  const occupancyKey = findFirstExistingKey(row, ["OCCUPANCY", "Occupancy"])
  const adrKey = findFirstExistingKey(row, ["ADR"])
  const revenueKey = findFirstExistingKey(row, ["REVENUE", "Revenue"])

  if (!totalKey || !soldKey || !availableKey) {
    throw new Error("GA Summary missing ROOM_TOTAL / COMMITTED / Availability.")
  }

  return {
    total: toNumber(row[totalKey]),
    sold: toNumber(row[soldKey]),
    available: toNumber(row[availableKey]),
    arrivals: toNumber(arrivalsKey ? row[arrivalsKey] : "0"),
    departures: toNumber(departuresKey ? row[departuresKey] : "0"),
    occupancy: toNumber(occupancyKey ? row[occupancyKey] : "0"),
    adr: toNumber(adrKey ? row[adrKey] : "0"),
    revenue: toNumber(revenueKey ? row[revenueKey] : "0"),
  }
}

function parseRoomsAvailability(
  rows: CsvRow[],
  roomTypeTotals: Record<string, number>,
): Record<string, CategoryInventory> {
  if (!rows.length) throw new Error("Rooms Availability file is empty.")

  const firstRow = rows[0]

  const roomTypeKey = findFirstExistingKey(firstRow, [
    "ROOM_TYPE",
    "Room Type",
    "ROOM TYPE",
    "CATEGORY",
    "Category",
    "TYPE",
    "Type",
  ])

  const availableKey = findFirstExistingKey(firstRow, [
    "AVAILABLE",
    "Available",
    "Availability",
    "AVL",
  ])

  if (!roomTypeKey || !availableKey) {
    throw new Error("Rooms Availability missing room type and available columns.")
  }

  const result: Record<string, CategoryInventory> = {}

  for (const row of rows) {
    const rawType = row[roomTypeKey]
    if (!rawType) continue

    const roomType = normalizeRoomType(rawType)
    const available = toNumber(row[availableKey])
    const total = roomTypeTotals[roomType] ?? 0
    const sold = Math.max(total - available, 0)

    result[roomType] = {
      total,
      available,
      sold,
    }
  }

  for (const [roomType, total] of Object.entries(roomTypeTotals)) {
    if (!result[roomType]) {
      result[roomType] = {
        total,
        available: 0,
        sold: total,
      }
    }
  }

  return result
}

export async function autoPopulateShiftInventoryFromUploads(
  files: File[],
  roomTypeTotals: Record<string, number> = ROOM_TYPE_TOTALS,
): Promise<ShiftInventoryResult> {
  if (!files || files.length < 2) {
    throw new Error("Upload 2 reports: GA Summary and Rooms Availability.")
  }

  const parsed = await Promise.all(
    files.map(async (file) => {
      const text = await file.text()
      const rows = parseCsv(text)
      return { file, rows }
    }),
  )

  const gaSummaryMatch = parsed.find(
    ({ file, rows }) =>
      file.name.toUpperCase().includes("GA_SUMMARY") || looksLikeGASummary(rows),
  )

  const roomsAvailabilityMatch = parsed.find(
    ({ file, rows }) =>
      file.name.toLowerCase().includes("roomavailability") || looksLikeRoomsAvailability(rows),
  )

  if (!gaSummaryMatch) {
    throw new Error("Could not detect GA Summary file.")
  }

  if (!roomsAvailabilityMatch) {
    throw new Error("Could not detect Rooms Availability file.")
  }

  const global = parseGASummary(gaSummaryMatch.rows)
  const categories = parseRoomsAvailability(roomsAvailabilityMatch.rows, roomTypeTotals)

  return {
    global,
    categories,
    detectedFiles: {
      gaSummaryFileName: gaSummaryMatch.file.name,
      roomsAvailabilityFileName: roomsAvailabilityMatch.file.name,
    },
  }
}

