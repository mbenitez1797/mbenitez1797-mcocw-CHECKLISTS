import { FORECAST_ROOM_GROUPS, type ForecastRoomGroup } from "@/lib/month-housekeeping-forecast"

export type RoomAvailabilityDay = {
  dateISO: string
  groups: Record<ForecastRoomGroup, number>
  totalAvailable: number
  rows: Array<{ roomCode: string; group: ForecastRoomGroup; values: Record<string, number> }>
}

export type RoomAvailabilityParseResult = {
  days: RoomAvailabilityDay[]
  sourceText: string
}

const ROOM_CODE_GROUPS: Record<string, ForecastRoomGroup | "IGNORE"> = {
  // KING group (39 rooms: 30+8+1)
  RM1K0006: "KING",
  RM1KA0008: "KING",
  RM1KA008: "KING",  // Short alias
  RM1KA0009: "KING",
  RM1KA009: "KING",  // Short alias
  // QNQN group (16 rooms)
  RM2Q0001: "QNQN",
  // VIQN group (49 rooms: 41+3+4+1)
  RM2Q0002: "VIQN",
  RM2QA0003: "VIQN",
  RM2QA003: "VIQN",  // Short alias
  RM2QA0004: "VIQN",
  RM2QA004: "VIQN",  // Short alias
  RM2QA0005: "VIQN",
  RM2QA005: "VIQN",  // Short alias
  // VIKG group (3 rooms)
  RM1K0007: "VIKG",
  // SUIT group (4 rooms: 3+1)
  SU1B0010: "SUIT",
  SU1BA0011: "SUIT",
  SU1BA011: "SUIT",  // Short alias
  ROH: "IGNORE",
}

const ROOM_CODE_PATTERN = new RegExp(`\\b(${Object.keys(ROOM_CODE_GROUPS).join("|")})\\b`, "i")

const normalize = (value: string) => value.replace(/\s+/g, " ").trim()

const normalizeRoomCode = (value: string) =>
  value
    .toUpperCase()
    .replace("RM1KA008", "RM1KA0008")
    .replace("RM1KA009", "RM1KA0009")
    .replace("RM2QA003", "RM2QA0003")
    .replace("RM2QA004", "RM2QA0004")
    .replace("RM2QA005", "RM2QA0005")
    .replace("SU1BA011", "SU1BA0011")

const parseNumber = (value: string | undefined) => {
  const parsed = Number.parseFloat(String(value || "").replace(/[,%\s]/g, ""))
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0
}

const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

const parseSlashDate = (value: string, fallbackYear: number) => {
  const match = value.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/)
  if (!match) return null
  const month = parseNumber(match[1])
  const day = parseNumber(match[2])
  const yearValue = match[3] ? parseNumber(match[3]) : fallbackYear
  const year = yearValue < 100 ? 2000 + yearValue : yearValue
  const parsed = new Date(year, month - 1, day)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const detectAvailabilityDates = (text: string) => {
  const fullDates = Array.from(text.matchAll(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g))
    .map(match => parseSlashDate(match[0], new Date().getFullYear()))
    .filter(Boolean) as Date[]

  const fallbackYear = fullDates[0]?.getFullYear() || new Date().getFullYear()
  const compactDates = Array.from(text.matchAll(/\b\d{1,2}\/\d{1,2}\b/g))
    .map(match => parseSlashDate(match[0], fallbackYear))
    .filter(Boolean) as Date[]

  const unique = Array.from(new Map([...fullDates, ...compactDates].map(date => [isoDate(date), date])).values())
    .sort((a, b) => a.getTime() - b.getTime())

  if (fullDates.length >= 2) {
    const start = fullDates[0]
    const end = fullDates[1]
    const days = Math.max(1, Math.min(31, Math.round((end.getTime() - start.getTime()) / 86400000) + 1))
    return Array.from({ length: days }, (_item, index) => addDays(start, index))
  }

  return unique.slice(0, 31)
}

const emptyGroups = () =>
  FORECAST_ROOM_GROUPS.reduce<Record<ForecastRoomGroup, number>>((acc, group) => {
    acc[group] = 0
    return acc
  }, {} as Record<ForecastRoomGroup, number>)

export function parseRoomAvailabilityText(rawText: string): RoomAvailabilityParseResult {
  const text = rawText.replace(/\r/g, "\n")
  if (/housekeeping forecasting|stay\s*overs|arriving guests|departing guests/i.test(text)) {
    throw new Error("That file is the Month Housekeeping Forecast. Please upload the StayPMS Room Availability report.")
  }

  if (!/room types total|bedded rooms total|room types available|bedded rooms available/i.test(text)) {
    throw new Error("Unable to parse Room Availability. Please upload the StayPMS Room Availability report.")
  }

  const dates = detectAvailabilityDates(text)
  if (!dates.length) throw new Error("Unable to parse Room Availability dates.")

  const days = new Map<string, RoomAvailabilityDay>()
  dates.forEach(date => {
    days.set(isoDate(date), {
      dateISO: isoDate(date),
      groups: emptyGroups(),
      totalAvailable: 0,
      rows: [],
    })
  })

  const lines = text.split(/\n/).map(normalize).filter(Boolean)
  let matchedRows = 0

  lines.forEach(line => {
    const codeMatch = line.match(ROOM_CODE_PATTERN)
    if (!codeMatch) return

    const roomCode = normalizeRoomCode(codeMatch[1])
    const group = ROOM_CODE_GROUPS[roomCode] || ROOM_CODE_GROUPS[codeMatch[1].toUpperCase()]
    if (!group || group === "IGNORE") return

    const afterCode = line.slice((codeMatch.index || 0) + codeMatch[0].length)
    const values = (afterCode.match(/-?\d+(?:\.\d+)?/g) || []).map(parseNumber)
    if (values.length < dates.length) return

    const dayValues = values.length > dates.length ? values.slice(values.length - dates.length) : values
    const rowValues: Record<string, number> = {}
    matchedRows += 1

    dates.forEach((date, index) => {
      const dateISO = isoDate(date)
      const value = dayValues[index] ?? 0
      const day = days.get(dateISO)
      if (!day) return
      day.groups[group] += value
      rowValues[dateISO] = value
    })

    dates.forEach(date => {
      const day = days.get(isoDate(date))
      if (day) day.rows.push({ roomCode, group, values: rowValues })
    })
  })

  if (!matchedRows) throw new Error("Unable to parse Room Availability room-code rows.")

  return {
    days: Array.from(days.values()).map(day => ({
      ...day,
      totalAvailable: FORECAST_ROOM_GROUPS.reduce((sum, group) => sum + day.groups[group], 0),
    })),
    sourceText: rawText,
  }
}
