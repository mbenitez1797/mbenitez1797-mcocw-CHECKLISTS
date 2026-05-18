export const FIXED_ROOM_TOTALS = {
  KING: 39,
  QNQN: 16,
  VIQN: 49,
  VIKG: 3,
  SUIT: 4,
} as const

export const TOTAL_PROPERTY_INVENTORY = 111
export const FORECAST_PARSE_ERROR_MESSAGE =
  "This upload parsed incorrectly. The report appears to have read summary totals as room-type activity. Please re-upload or check parser."
const REASONABLE_OVERSELL_BUFFER = 10

export const FIXED_ROOM_CODES = {
  KING: { RM1K0006: 30, RM1KA0008: 8, RM1KA0009: 1 },
  QNQN: { RM2Q0001: 16 },
  VIQN: { RM2Q0002: 41, RM2QA0003: 3, RM2QA0004: 4, RM2QA0005: 1 },
  VIKG: { RM1K0007: 3 },
  SUIT: { SU1B0010: 3, SU1BA0011: 1 },
} as const

export type ForecastRoomGroup = keyof typeof FIXED_ROOM_TOTALS

export type ForecastDay = {
  date: string
  label: string
  arrivals: number
  departures: number
  stayovers: number
  occupancy: number
  guests: number
  rooms: Record<ForecastRoomGroup, {
    arrivals: number
    stayovers: number
    occupied: number
    available: number
  }>
  occupied: number
  available: number
  oversold: boolean
}

export type ParsedForecast = {
  sourceName: string
  parsedAt: string
  days: ForecastDay[]
  warnings: string[]
}

export type SmartBalancerSuggestion = {
  id: string
  moveCount: number
  losNights: number
  from: ForecastRoomGroup
  to: ForecastRoomGroup
  datesHelped: string[]
  targetOpenCount: number
  remainingUnresolvedShortages: number
}

const GROUPS = Object.keys(FIXED_ROOM_TOTALS) as ForecastRoomGroup[]

const UPGRADE_TARGETS: Record<ForecastRoomGroup, ForecastRoomGroup[]> = {
  KING: ["VIKG", "SUIT"],
  QNQN: ["VIQN", "SUIT"],
  VIQN: ["SUIT"],
  VIKG: ["SUIT"],
  SUIT: [],
}

function numberValue(value: string | undefined) {
  const parsed = Number(String(value ?? "").replace(/[$,%,"\s]/g, ""))
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeDate(value: string) {
  const match = value.match(/(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/)
  if (!match) return ""

  const year = match[3]
    ? Number(match[3].length === 2 ? `20${match[3]}` : match[3])
    : new Date().getFullYear()
  const month = Number(match[1])
  const day = Number(match[2])
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function emptyRooms(): ForecastDay["rooms"] {
  return GROUPS.reduce((acc, group) => {
    acc[group] = {
      arrivals: 0,
      stayovers: 0,
      occupied: 0,
      available: FIXED_ROOM_TOTALS[group],
    }
    return acc
  }, {} as ForecastDay["rooms"])
}

function isImpossibleRoomActivity(arrivals: number, departures: number, stayovers: number) {
  return (
    arrivals > TOTAL_PROPERTY_INVENTORY ||
    departures > TOTAL_PROPERTY_INVENTORY ||
    stayovers > TOTAL_PROPERTY_INVENTORY ||
    arrivals + stayovers > TOTAL_PROPERTY_INVENTORY
  )
}

function finalizeDay(partial: Partial<ForecastDay> & { rooms?: ForecastDay["rooms"] }, warnings: string[]): ForecastDay | null {
  if (!partial.date && !partial.label) return null

  const rooms = partial.rooms || emptyRooms()
  const arrivals = partial.arrivals ?? GROUPS.reduce((sum, group) => sum + rooms[group].arrivals, 0)
  const stayovers = partial.stayovers ?? GROUPS.reduce((sum, group) => sum + rooms[group].stayovers, 0)

  for (const group of GROUPS) {
    const room = rooms[group]
    room.occupied = room.arrivals + room.stayovers
    room.available = FIXED_ROOM_TOTALS[group] - room.occupied
  }

  const occupied = arrivals + stayovers
  const available = TOTAL_PROPERTY_INVENTORY - occupied
  const oversold = available < 0 || GROUPS.some((group) => rooms[group].available < 0)

  if (!partial.date) {
    warnings.push(`Could not normalize date label "${partial.label}".`)
  }

  return {
    date: partial.date || partial.label || "Unknown date",
    label: partial.label || partial.date || "Unknown date",
    arrivals,
    departures: partial.departures ?? 0,
    stayovers,
    occupancy: partial.occupancy ?? 0,
    guests: partial.guests ?? 0,
    rooms,
    occupied,
    available,
    oversold,
  }
}

function recalculateForecastDay(day: ForecastDay): ForecastDay {
  const rooms = emptyRooms()

  for (const group of GROUPS) {
    const existing = day.rooms?.[group]
    const arrivals = Number(existing?.arrivals ?? 0)
    const stayovers = Number(existing?.stayovers ?? 0)
    const occupied = arrivals + stayovers

    rooms[group] = {
      arrivals,
      stayovers,
      occupied,
      available: FIXED_ROOM_TOTALS[group] - occupied,
    }
  }

  const arrivals = Number(day.arrivals ?? 0)
  const stayovers = Number(day.stayovers ?? 0)
  const occupied = arrivals + stayovers
  const available = TOTAL_PROPERTY_INVENTORY - occupied

  return {
    ...day,
    arrivals,
    departures: Number(day.departures ?? 0),
    stayovers,
    rooms,
    occupied,
    available,
    oversold: available < 0 || GROUPS.some((group) => rooms[group].available < 0),
  }
}

export function recalculateParsedForecast(forecast: ParsedForecast): ParsedForecast {
  return {
    ...forecast,
    days: Array.isArray(forecast.days) ? forecast.days.map(recalculateForecastDay) : [],
  }
}

export function validateParsedForecast(forecast: ParsedForecast): string[] {
  const errors: string[] = []

  for (const day of forecast.days || []) {
    if (day.arrivals > TOTAL_PROPERTY_INVENTORY) {
      errors.push(`${day.label}: arrivals exceed property inventory.`)
    }

    if (day.departures > TOTAL_PROPERTY_INVENTORY) {
      errors.push(`${day.label}: departures exceed property inventory.`)
    }

    if (day.stayovers > TOTAL_PROPERTY_INVENTORY) {
      errors.push(`${day.label}: stayovers exceed property inventory.`)
    }

    if (day.occupied > TOTAL_PROPERTY_INVENTORY + REASONABLE_OVERSELL_BUFFER) {
      errors.push(`${day.label}: occupied total exceeds the allowed oversell buffer.`)
    }

    const groupOccupied = GROUPS.map((group) => day.rooms[group].occupied)
    const maxGroupOccupied = Math.max(0, ...groupOccupied)

    for (const group of GROUPS) {
      const room = day.rooms[group]
      if (room.arrivals > TOTAL_PROPERTY_INVENTORY || room.stayovers > TOTAL_PROPERTY_INVENTORY) {
        errors.push(`${day.label}: ${group} activity exceeds property inventory.`)
      }

      if (room.occupied > TOTAL_PROPERTY_INVENTORY) {
        errors.push(`${day.label}: ${group} occupied exceeds property inventory.`)
      }
    }

    if (day.occupied > TOTAL_PROPERTY_INVENTORY && maxGroupOccupied >= day.occupied * 0.9) {
      errors.push(`${day.label}: nearly all activity was assigned to one room group.`)
    }
  }

  return errors
}

export function assertValidParsedForecast(forecast: ParsedForecast): ParsedForecast {
  const recalculated = recalculateParsedForecast(forecast)
  const errors = validateParsedForecast(recalculated)

  if (!recalculated.days.length || errors.length) {
    throw new Error(FORECAST_PARSE_ERROR_MESSAGE)
  }

  return recalculated
}

export function parseMonthForecastText(text: string, sourceName = "Month Housekeeping Forecast"): ParsedForecast {
  const warnings: string[] = []
  const clean = text.replace(/\u0000/g, " ").replace(/\s+/g, " ")
  const lines = text.replace(/\u0000/g, " ").split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const days: ForecastDay[] = []
  let rejectedImpossibleDay = false

  for (const line of lines) {
    const date = normalizeDate(line)
    if (!date) continue

    const day: Partial<ForecastDay> & { rooms: ForecastDay["rooms"] } = {
      date,
      label: line.match(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)?\s*\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?/i)?.[0]?.trim() || date,
      rooms: emptyRooms(),
    }

    const metricPatterns: Array<[keyof ForecastDay, RegExp]> = [
      ["arrivals", /\barrivals?\b\D*(-?\d+)/i],
      ["departures", /\bdepartures?\b\D*(-?\d+)/i],
      ["stayovers", /\bstayovers?\b\D*(-?\d+)/i],
      ["occupancy", /\b(?:occ|occupancy)\b\D*(-?\d+(?:\.\d+)?)%?/i],
      ["guests", /\bguests?\b\D*(-?\d+)/i],
    ]

    for (const [key, pattern] of metricPatterns) {
      const match = line.match(pattern)
      if (match) {
        ;(day as Record<string, number>)[key] = numberValue(match[1])
      }
    }

    for (const group of GROUPS) {
      const groupMatch = line.match(new RegExp(`\\b${group}\\b[^\\n]*?(?:arr(?:ivals?)?)?\\D*(-?\\d+)[^\\n]*?(?:stay(?:overs?)?)?\\D*(-?\\d+)`, "i"))
      if (groupMatch) {
        const arrivals = numberValue(groupMatch[1])
        const stayovers = numberValue(groupMatch[2])

        if (isImpossibleRoomActivity(arrivals, 0, stayovers)) {
          warnings.push(`${day.label}: ignored impossible ${group} activity row.`)
          continue
        }

        day.rooms[group].arrivals = arrivals
        day.rooms[group].stayovers = stayovers
      }
    }

    const finalized = finalizeDay(day, warnings)
    if (finalized) {
      const validationErrors = validateParsedForecast({
        sourceName,
        parsedAt: new Date().toISOString(),
        days: [finalized],
        warnings,
      })

      if (validationErrors.length) {
        rejectedImpossibleDay = true
        warnings.push(`${finalized.label}: rejected impossible forecast day.`)
      } else {
        days.push(finalized)
      }
    }
  }

  if (!days.length && !rejectedImpossibleDay) {
    const dateMatches = Array.from(clean.matchAll(/\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g)).slice(0, 31)
    for (const match of dateMatches) {
      const finalized = finalizeDay({ date: normalizeDate(match[0]), label: match[0], rooms: emptyRooms() }, warnings)
      if (finalized) days.push(finalized)
    }
  }

  if (!days.length) {
    warnings.push("No usable forecast rows were found in the PDF text layer.")
  }

  return {
    sourceName,
    parsedAt: new Date().toISOString(),
    days,
    warnings,
  }
}

export function loadSavedForecast(): ParsedForecast | null {
  if (typeof window === "undefined") return null

  try {
    const raw = localStorage.getItem("month-housekeeping-forecast")
    if (!raw) return null
    const parsed = JSON.parse(raw) as ParsedForecast
    return Array.isArray(parsed.days) ? assertValidParsedForecast(parsed) : null
  } catch {
    localStorage.removeItem("month-housekeeping-forecast")
    return null
  }
}

export function saveForecast(forecast: ParsedForecast) {
  if (typeof window === "undefined") return
  localStorage.setItem("month-housekeeping-forecast", JSON.stringify(assertValidParsedForecast(forecast)))
}

export function clearSavedForecast() {
  if (typeof window === "undefined") return
  localStorage.removeItem("month-housekeeping-forecast")
}

export function buildSmartBalancerSuggestions(days: ForecastDay[], selectedDate: string): SmartBalancerSuggestion[] {
  const startIndex = Math.max(0, days.findIndex((day) => day.date === selectedDate))
  const window = days.slice(startIndex, startIndex + 3)
  if (!window.length) return []

  const suggestions: SmartBalancerSuggestion[] = []

  for (const from of GROUPS) {
    const shortages = window.map((day) => Math.max(0, -day.rooms[from].available))
    const maxShortage = Math.max(...shortages)
    if (maxShortage <= 0) continue

    for (const to of UPGRADE_TARGETS[from]) {
      const targetOpenCount = Math.min(...window.map((day) => Math.max(0, day.rooms[to].available)))
      if (targetOpenCount <= 0) continue

      const moveCount = Math.min(maxShortage, targetOpenCount)
      suggestions.push({
        id: `${from}-${to}-${selectedDate}`,
        moveCount,
        losNights: window.length,
        from,
        to,
        datesHelped: window.filter((day) => day.rooms[from].available < 0).map((day) => day.label),
        targetOpenCount,
        remainingUnresolvedShortages: Math.max(0, maxShortage - moveCount),
      })
      break
    }
  }

  return suggestions
}
