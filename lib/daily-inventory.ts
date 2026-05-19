export const ROOM_TOTAL = 111

export type RoomBucket = {
  KING: number
  VIKG: number
  QUEEN: number
  VIQN: number
  SUITES: number
}

export type DailyInventorySnapshot = {
  dateLabel: string
  roomTotal: number
  available: number
  committed: number
  arrivals: number
  departures: number
  stayovers: number
  occupancy: string
  oooOtm: string
  groupsRemaining: number
  guests: string
  rooms: RoomBucket
  recommendations: string[]
  updatedAt: string
}

export const DAILY_INVENTORY_STORAGE_KEY = "daily-inventory-snapshot"

export const ROOM_TYPE_MAP: Record<keyof RoomBucket, string[]> = {
  KING: ["RM1K0006", "RM1KA008", "RM1KA009"],
  VIKG: ["RM1K0007"],
  QUEEN: ["RM2Q0001"],
  VIQN: ["RM2Q0002", "RM2QA003", "RM2QA004", "RM2QA005"],
  SUITES: ["SU1B0010", "SU1BA011"],
}

export const emptyRooms = (): RoomBucket => ({
  KING: 0,
  VIKG: 0,
  QUEEN: 0,
  VIQN: 0,
  SUITES: 0,
})

export function totalAvailableRooms(rooms: RoomBucket) {
  return rooms.KING + rooms.VIKG + rooms.QUEEN + rooms.VIQN + rooms.SUITES
}

export function calculateStayovers(departures: number) {
  return Math.max(0, ROOM_TOTAL - departures)
}

export function calculateOccupancy(available: number) {
  return `${(((ROOM_TOTAL - available) / ROOM_TOTAL) * 100).toFixed(1)}%`
}

export function saveDailyInventory(snapshot: DailyInventorySnapshot) {
  if (typeof window === "undefined") return
  localStorage.setItem(DAILY_INVENTORY_STORAGE_KEY, JSON.stringify(snapshot))
  localStorage.setItem("shuffle-recommendations", JSON.stringify(snapshot.recommendations))
  window.dispatchEvent(new CustomEvent("daily-inventory-updated", { detail: snapshot }))
}

export function loadDailyInventory(): DailyInventorySnapshot | null {
  if (typeof window === "undefined") return null
  try {
    return JSON.parse(localStorage.getItem(DAILY_INVENTORY_STORAGE_KEY) || "null")
  } catch {
    return null
  }
}

export function normalizeCode(label: string) {
  return String(label || "").split(" - ")[0].trim()
}

export function todayColumn(headers: string[]) {
  const now = new Date()
  const wanted = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "2-digit",
    day: "2-digit",
  }).replace(",", "")
  const idx = headers.findIndex((h) => h.includes(wanted.slice(0, 3)) && h.includes(wanted.slice(4)))
  return idx >= 0 ? idx : Math.min(2, Math.max(0, headers.length - 1))
}

export function numberValue(v: unknown) {
  const n = Number(String(v ?? "0").replace(/[$,%,"\s]/g, ""))
  return Number.isFinite(n) ? n : 0
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]
    if (ch === '"' && quoted && next === '"') {
      cell += '"'
      i++
    } else if (ch === '"') {
      quoted = !quoted
    } else if (ch === "," && !quoted) {
      row.push(cell.replace(/^\uFEFF/, "").trim())
      cell = ""
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (cell.length || row.length) {
        row.push(cell.replace(/^\uFEFF/, "").trim())
        rows.push(row)
        row = []
        cell = ""
      }
      if (ch === "\r" && next === "\n") i++
    } else {
      cell += ch
    }
  }

  if (cell.length || row.length) {
    row.push(cell.replace(/^\uFEFF/, "").trim())
    rows.push(row)
  }

  return rows
}

function metricValue(rows: string[][], column: number, names: string[]) {
  const normalizedNames = names.map((name) => name.trim().toUpperCase())
  const row = rows.find((r) => normalizedNames.includes(String(r[0] || "").trim().toUpperCase()))
  return row ? row[column] : 0
}

export function buildDailySnapshot(gaCsv: string, roomCsv: string): DailyInventorySnapshot {
  const gaRows = parseCsv(gaCsv)
  const roomRows = parseCsv(roomCsv)
  const gaHeaders = gaRows[0] || []
  const roomHeaders = roomRows[0] || []
  const gaCol = todayColumn(gaHeaders)
  const roomCol = todayColumn(roomHeaders)

  const available = numberValue(metricValue(gaRows, gaCol, ["Availability", "AVAILABLE"]))
  const committed = numberValue(metricValue(gaRows, gaCol, ["COMMITTED"]))
  const arrivals = numberValue(metricValue(gaRows, gaCol, ["ARRIVALS"]))
  const departures = numberValue(metricValue(gaRows, gaCol, ["DEPARTURES"]))
  const oooOtm = String(metricValue(gaRows, gaCol, ["OOO/OTM"]) || "0/0").trim()
  const groupsRemaining = numberValue(metricValue(gaRows, gaCol, ["Groups Bedded Rooms Remaining", "Groups Bedded Rooms Remaining "]))
  const adults = numberValue(metricValue(gaRows, gaCol, ["Adults"]))
  const guests = numberValue(metricValue(gaRows, gaCol, ["Guest Numbers"]))
  const children = Math.max(0, guests - adults)
  const rooms = emptyRooms()

  for (const row of roomRows.slice(1)) {
    const code = normalizeCode(row[0])
    const val = numberValue(row[roomCol])
    for (const bucket of Object.keys(ROOM_TYPE_MAP) as (keyof RoomBucket)[]) {
      if (ROOM_TYPE_MAP[bucket].includes(code)) rooms[bucket] += val
    }
  }

  const effectiveAvailable = available || totalAvailableRooms(rooms)
  const recommendations: string[] = []
  if (rooms.KING < 0) recommendations.push(`Oversold KING by ${Math.abs(rooms.KING)}. Use VIKG or SUITES upgrades before assigning standard king arrivals.`)
  if (rooms.QUEEN < 0 && rooms.VIQN > 0) recommendations.push(`Oversold QUEEN by ${Math.abs(rooms.QUEEN)}. Use VIQN as queen overflow.`)
  if (rooms.VIKG < 1 && arrivals > 0) recommendations.push("VIKG is tight or sold out. Hold RM1K0007 for true view king needs.")
  if (rooms.SUITES > 0) recommendations.push(`Suites available: ${rooms.SUITES}. Use for recovery, elite upgrade, or inventory balancing.`)
  if (!recommendations.length) recommendations.push("No shuffle needed based on uploaded inventory.")

  return {
    dateLabel: gaHeaders[gaCol] || roomHeaders[roomCol] || "Today",
    roomTotal: ROOM_TOTAL,
    available: effectiveAvailable,
    committed,
    arrivals,
    departures,
    stayovers: calculateStayovers(departures),
    occupancy: calculateOccupancy(effectiveAvailable),
    oooOtm,
    groupsRemaining,
    guests: `${adults} adults, ${children} children`,
    rooms,
    recommendations,
    updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }
}

