export type ForecastRoomGroup = "KING" | "QNQN" | "VIQN" | "VIKG" | "SUIT"

export interface ForecastRoomActivity {
  roomCode: string
  roomLabel: string
  group: ForecastRoomGroup
  arrivals: number
  departures: number
  stayovers: number
  arrivingGuests: number
  departingGuests: number
}

export interface ForecastGroupSummary {
  group: ForecastRoomGroup
  inventoryTotal: number
  arrivals: number
  departures: number
  stayovers: number
  arrivingGuests: number
  departingGuests: number
  occupied: number
  available: number
  rows: ForecastRoomActivity[]
}

export interface ForecastDay {
  dateISO: string
  dateLabel: string
  dayLabel: string
  groups: Record<ForecastRoomGroup, ForecastGroupSummary>
  arrivals: number
  departures: number
  stayovers: number
  arrivingGuests: number
  departingGuests: number
  totalOccupied: number
  totalAvailable: number
  occupancy: string
  oversold: boolean
}

export interface ForecastParseResult {
  days: ForecastDay[]
  sourceText: string
}

export interface ForecastAiActivityRow {
  dateISO: string
  group: ForecastRoomGroup
  roomLabel?: string
  arrivals: number
  departures: number
  stayovers: number
  arrivingGuests?: number
  departingGuests?: number
}

export const FORECAST_ROOM_TOTAL = 111

export const FORECAST_ROOM_TOTALS: Record<ForecastRoomGroup, number> = {
  KING: 39,
  QNQN: 16,
  VIQN: 49,
  VIKG: 3,
  SUIT: 4,
}

export const FORECAST_ROOM_GROUPS: ForecastRoomGroup[] = ["KING", "QNQN", "VIQN", "VIKG", "SUIT"]

export const FORECAST_ROOM_CODES: Record<ForecastRoomGroup, string[]> = {
  KING: ["RM1K0006", "RM1KA008", "RM1KA009"],
  QNQN: ["RM2Q0001"],
  VIQN: ["RM2Q0002", "RM2QA003", "RM2QA004", "RM2QA005"],
  VIKG: ["RM1K0007"],
  SUIT: ["SU1B0010", "SU1BA011"],
}

export const FORECAST_ROOM_CODE_TOTALS: Record<string, number> = {
  RM1K0006: 30,
  RM1KA008: 8,
  RM1KA009: 1,
  RM2Q0001: 16,
  RM2Q0002: 41,
  RM2QA003: 3,
  RM2QA004: 4,
  RM2QA005: 1,
  RM1K0007: 3,
  SU1B0010: 3,
  SU1BA011: 1,
}

export const FORECAST_ROOM_TYPE_MAPPINGS: Array<Pick<ForecastRoomActivity, "group" | "roomCode" | "roomLabel">> = [
  {
    group: "VIQN",
    roomCode: "RM2Q0002",
    roomLabel: "Deluxe Room, 2 Queen Beds, Water View",
  },
  {
    group: "KING",
    roomCode: "RM1K0006",
    roomLabel: "Deluxe Room, 1 King Bed, Sofa bed",
  },
  {
    group: "KING",
    roomCode: "RM1KA008",
    roomLabel: "Deluxe Room, 1 King Bed, Sofa bed, Hearing Accessible",
  },
  {
    group: "VIQN",
    roomCode: "RM2QA003",
    roomLabel: "Deluxe Room, 2 Queen Beds, Water View, Hearing Accessible",
  },
  {
    group: "VIQN",
    roomCode: "RM2QA004",
    roomLabel: "Deluxe Room, 2 Queen Beds, Water View, Mobility Accessible with Bathtub",
  },
  {
    group: "VIKG",
    roomCode: "RM1K0007",
    roomLabel: "Deluxe Room, 1 King Bed, Water View, Sofa bed",
  },
  {
    group: "QNQN",
    roomCode: "RM2Q0001",
    roomLabel: "Deluxe Room, 2 Queen Beds",
  },
  {
    group: "KING",
    roomCode: "RM1KA009",
    roomLabel: "Deluxe Room, 1 King Bed, Sofa bed, Mobility Accessible with Roll-In Shower",
  },
  {
    group: "SUIT",
    roomCode: "SU1B0010",
    roomLabel: "1 Bedroom Suite, 1 King Bed, Sitting Area, Sofa bed",
  },
  {
    group: "VIQN",
    roomCode: "RM2QA005",
    roomLabel: "Deluxe Room, 2 Queen Beds, Water View, Mobility Accessible with Roll-In Shower",
  },
  {
    group: "SUIT",
    roomCode: "SU1BA011",
    roomLabel: "1 Bedroom Suite, 1 King Bed, Sitting Area, Sofa bed, Hearing Accessible, Mobility Accessible",
  },
]

const FORECAST_ROOM_LABEL_BY_CODE = new Map(FORECAST_ROOM_TYPE_MAPPINGS.map(room => [room.roomCode, room.roomLabel]))

const ROOM_CODE_ALIASES: Record<string, ForecastRoomGroup> = {
  RM1K0006: "KING",
  RM1KA008: "KING",
  RM1KA009: "KING",
  RM1KA008: "KING",
  RM1KA009: "KING",
  RM2Q0001: "QNQN",
  RM2Q0002: "VIQN",
  RM2QA003: "VIQN",
  RM2QA004: "VIQN",
  RM2QA005: "VIQN",
  RM2QA003: "VIQN",
  RM2QA004: "VIQN",
  RM2QA005: "VIQN",
  RM1K0007: "VIKG",
  SU1B0010: "SUIT",
  SU1BA011: "SUIT",
  SU1BA011: "SUIT",
}

const ROOM_CODE_PATTERN = new RegExp(Object.keys(ROOM_CODE_ALIASES).sort((a, b) => b.length - a.length).join("|"), "i")

const normalize = (value: string) => value.replace(/\s+/g, " ").trim()

const normalizeForecastRoomDescription = (value: string) =>
  normalize(
    value
      .toLowerCase()
      .replace(/[,\u2010-\u2015-]/g, " ")
      .replace(/\bwater\s+\d{1,2}\s+view\b/g, "water view")
      .replace(/\bwater\s+(?:20\d{2}\s+)?i?ew\b/g, "water view")
      .replace(/\bsofa\s*bed\b/g, "sofabed")
      .replace(/\broll\s*in\b/g, "roll in"),
  )

const tryMapForecastRoomType = (description: string): ForecastRoomGroup | null => {
  const text = normalizeForecastRoomDescription(description)
  if (/\b(?:1 bedroom suite|suite)\b/.test(text)) return "SUIT"

  const isKing = /\b(?:1\s*king|king)\s*bed\b/.test(text)
  const isQueen = /\b2\s*queen\b/.test(text) || /\b2queen\b/.test(text) || /\bqueen\s*beds?\b/.test(text)
  const isWaterView = text.includes("water view") || (/\bwater\b/.test(text) && /\b(?:view|iew)\b/.test(text))
  const hasSofaBed = text.includes("sofabed")

  if (isKing && isWaterView) return "VIKG"
  if (isKing) return "KING"
  if (isQueen && isWaterView) return "VIQN"
  if (isQueen) return "QNQN"
  if (isWaterView && /\bbeds?\b/.test(text) && !hasSofaBed) return "VIQN"
  if (hasSofaBed && isWaterView) return "VIKG"
  if (hasSofaBed) return "KING"
  if (/\b(?:deluxe|dee|dewxe|douxe|doxe|dowxe|soluxe)\s+room\b/.test(text) && !isWaterView) return "QNQN"

  return null
}

export function mapForecastRoomType(description: string): ForecastRoomGroup {
  const group = tryMapForecastRoomType(description)
  if (!group) throw new Error(`Unmapped room type: ${description}`)
  return group
}

const normalizeRoomCodeToken = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "")

const canonicalRoomCodeForGroup = (group: ForecastRoomGroup, value?: string) => {
  const codes = FORECAST_ROOM_CODES[group]
  const normalized = normalizeRoomCodeToken(value || "")
  if (!normalized) return codes[0]

  const alias = normalized
    .replace("RM1KA008", "RM1KA008")
    .replace("RM1KA009", "RM1KA009")
    .replace("RM2QA003", "RM2QA003")
    .replace("RM2QA004", "RM2QA004")
    .replace("RM2QA005", "RM2QA005")

  const exact = codes.find(code => code === alias)
  if (exact) return exact

  const paddedAlias = codes.find(code => code.replace(/^(.+?)0(\d{2})$/, "$1$2") === alias)
  if (paddedAlias) return paddedAlias

  if (ROOM_CODE_ALIASES[normalized] === group || ROOM_CODE_ALIASES[alias] === group) {
    return codes[0]
  }

  return codes[0]
}

const roomCodeForDescription = (group: ForecastRoomGroup, description: string) => {
  const text = normalizeForecastRoomDescription(description)

  if (group === "KING") {
    if (text.includes("mobility accessible") || text.includes("roll in")) return "RM1KA009"
    if (text.includes("hearing accessible")) return "RM1KA008"
    return "RM1K0006"
  }

  if (group === "VIQN") {
    if (text.includes("roll in")) return "RM2QA005"
    if (text.includes("bathtub")) return "RM2QA004"
    if (text.includes("hearing accessible")) return "RM2QA003"
    return "RM2Q0002"
  }

  if (group === "SUIT") {
    if (text.includes("hearing accessible") || text.includes("mobility accessible")) return "SU1BA011"
    return "SU1B0010"
  }

  return FORECAST_ROOM_CODES[group][0]
}

const normalizeForecastRoomRows = (
  group: ForecastRoomGroup,
  rows: ForecastRoomActivity[],
): ForecastRoomActivity[] => {
  const byCode = new Map<string, ForecastRoomActivity>()

  FORECAST_ROOM_CODES[group].forEach(roomCode => {
    byCode.set(roomCode, {
      roomCode,
      roomLabel: FORECAST_ROOM_LABEL_BY_CODE.get(roomCode) ?? roomCode,
      group,
      arrivals: 0,
      departures: 0,
      stayovers: 0,
      arrivingGuests: 0,
      departingGuests: 0,
    })
  })

  rows.forEach(row => {
    const roomCode = canonicalRoomCodeForGroup(group, row.roomCode || roomCodeForDescription(group, row.roomLabel))
    const target = byCode.get(roomCode)
    if (!target) return

    target.arrivals += row.arrivals
    target.departures += row.departures
    target.stayovers += row.stayovers
    target.arrivingGuests += row.arrivingGuests
    target.departingGuests += row.departingGuests
    target.roomLabel = FORECAST_ROOM_LABEL_BY_CODE.get(roomCode) ?? row.roomLabel ?? roomCode
  })

  return FORECAST_ROOM_CODES[group].map(roomCode => byCode.get(roomCode)!).filter(Boolean)
}

export const normalizeForecastDayRoomRows = (day: ForecastDay): ForecastDay => {
  const groups = { ...day.groups } as Record<ForecastRoomGroup, ForecastGroupSummary>

  FORECAST_ROOM_GROUPS.forEach(groupKey => {
    const group = groups[groupKey]
    const rows = normalizeForecastRoomRows(groupKey, group.rows || [])
    const hasRowActivity = rows.some(row => row.arrivals > 0 || row.departures > 0 || row.stayovers > 0)

    if (!hasRowActivity && (group.arrivals > 0 || group.departures > 0 || group.stayovers > 0)) {
      rows[0] = {
        ...rows[0],
        arrivals: group.arrivals,
        departures: group.departures,
        stayovers: group.stayovers,
        arrivingGuests: group.arrivingGuests,
        departingGuests: group.departingGuests,
      }
    }

    groups[groupKey] = {
      ...group,
      rows,
    }
  })

  return {
    ...day,
    groups,
  }
}

const parseNumber = (value: string | undefined) => {
  const parsed = Number.parseFloat(String(value || "").replace(/[$,%\s,]/g, ""))
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0
}

const isoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const MONTH_DATE_PATTERN = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}(?:,?\s*\d{4})?\b/i

const parseDateFromText = (value: string) => {
  const text = normalize(value)
  const monthDate = text.match(MONTH_DATE_PATTERN)
  const slashDate = text.match(/\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/)
  const token = monthDate?.[0] || slashDate?.[0]
  if (!token) return null

  const needsYear = !/[/-]\d{2,4}$/.test(token) && !/\d{4}/.test(token)
  const parsed = new Date(needsYear ? `${token}, ${new Date().getFullYear()}` : token)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

const ROOM_LABEL_PATTERNS: Array<{ group: ForecastRoomGroup; label: string; pattern: RegExp }> = [
  { group: "VIQN", label: "VIQN", pattern: /\b(?:VIQN|VIEW\s+QUEENS?|VIEW\s+QUEEN|VIEW\s+QNQN|2\s*QUEEN\s+BEDS?.{0,40}WATER\s+VIEW|RM2QA?0*0*(?:02|03|04|05))\b/i },
  { group: "VIKG", label: "VIKG", pattern: /\b(?:VIKG|VIEW\s+KINGS?|VIEW\s+KING|1\s*KING\s+BED.{0,40}WATER\s+VIEW|RM1K0*0*07)\b/i },
  { group: "QNQN", label: "QNQN", pattern: /\b(?:QNQN|QUEENS?|QUEEN\s+QUEEN|TWO\s+QUEENS?|2\s*QUEENS?|RM2Q0*0*01)\b/i },
  { group: "KING", label: "KING", pattern: /\b(?:KING|KINGS?|RM1KA?0*0*(?:06|08|09))\b/i },
  { group: "SUIT", label: "SUIT", pattern: /\b(?:SUIT|SUITE|SUITES|SU1BA?0*0*(?:10|11))\b/i },
]

const ROOM_BREAK_PATTERN =
  /\b(VIEW\s+QUEENS?|VIEW\s+QNQN|VIEW\s+KINGS?|VIQN|VIKG|QNQN|KING|KINGS?|QUEENS?|SUIT|SUITE|SUITES|RM1K0*0*0?6|RM1KA0*0*0?8|RM1KA0*0*0?9|RM1K0*0*0?7|RM2Q0*0*0?1|RM2Q0*0*0?2|RM2QA0*0*0?3|RM2QA0*0*0?4|RM2QA0*0*0?5|SU1B0*0*10|SU1BA0*0*11)\b/gi

const DATE_BREAK_PATTERNS = [
  /\b(?:Sun(?:day)?|Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?),?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}(?:,?\s*\d{4})?\b/gi,
  /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}(?:,?\s*\d{4})?\b/gi,
  /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g,
]

const prepareForecastText = (rawText: string) => {
  let text = rawText.replace(/\r/g, "\n")
  DATE_BREAK_PATTERNS.forEach(pattern => {
    text = text.replace(pattern, match => `\n${match}\n`)
  })
  text = text.replace(ROOM_BREAK_PATTERN, match => `\n${match}`)
  return text
}

const findRoomToken = (line: string) => {
  const codeMatch = line.match(ROOM_CODE_PATTERN)
  if (codeMatch) {
    const matchedCode = codeMatch[0].toUpperCase()
    const group = ROOM_CODE_ALIASES[matchedCode]
    const roomCode = group ? canonicalRoomCodeForGroup(group, matchedCode) : matchedCode
    if (group) {
      return {
        group,
        roomCode,
        roomLabel: roomCode,
        index: codeMatch.index || 0,
        length: codeMatch[0].length,
      }
    }
  }

  for (const item of ROOM_LABEL_PATTERNS) {
    const match = line.match(item.pattern)
    if (match) {
      return {
        group: item.group,
        roomCode: item.label,
        roomLabel: item.label,
        index: match.index || 0,
        length: match[0].length,
      }
    }
  }

  return null
}

const lineNumbers = (line: string) => (line.match(/-?\d+(?:\.\d+)?/g) || []).map(parseNumber)

const parseOcrMetricLine = (line: string) => {
  if (/https?:|tenant|property|AM|PM|ARRIVING|DEPARTING|ROOMTYPE|STAY ROOMS|start date|end date|room types|RM\d|TOTAL/i.test(line)) return null

  const metricText = line
    .replace(/^\s*(?:[A-Za-z]+\s+)?\d{1,2}\s*,/, "")
    .replace(/\b(?:1\s*Bedroom|1\s*King|2\s*Queen|2Queen)\b/gi, match => match.replace(/\d+/g, ""))
    .replace(/(^|\s)1["']/g, (_match, prefix: string) => `${prefix}11`)
    .replace(/\b0o+\b|\boo+\b|\bo\b/gi, "0")

  const numbers = lineNumbers(metricText)
  if (numbers.length < 5) return null

  const values = [...numbers]
  if (values.length > 9) values.splice(0, values.length - 9)
  if (values.length < 5) return null
  if ((values[0] ?? 0) > FORECAST_ROOM_TOTAL || (values[2] ?? 0) > FORECAST_ROOM_TOTAL || (values[4] ?? 0) > FORECAST_ROOM_TOTAL) {
    return null
  }

  return {
    arrivals: values[0] ?? 0,
    arrivingGuests: values[1] ?? 0,
    departures: values[2] ?? 0,
    departingGuests: values[3] ?? 0,
    stayovers: values[4] ?? 0,
    stayoverGuests: values[5] ?? 0,
  }
}

const monthIndex = (value: string) => {
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
  const found = months.findIndex(month => value.toLowerCase().startsWith(month))
  return found >= 0 ? found : null
}

const inferDateForOcrRow = (lines: string[], index: number) => {
  const windowStart = Math.max(0, index - 5)
  const windowEnd = Math.min(lines.length, index + 5)
  const windowLines = lines.slice(windowStart, windowEnd)

  let month: number | null = null
  let day: number | null = null
  let year = new Date().getFullYear()

  for (const line of windowLines) {
    const monthMatch = line.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\b/i)
    if (monthMatch) month = monthIndex(monthMatch[1])

    const yearMatch = line.match(/\b(20\d{2})\b/)
    if (yearMatch) year = parseNumber(yearMatch[1])
  }

  const daySearchOrder = [lines[index], lines[index + 1], lines[index - 1], lines[index + 2], lines[index - 2]].filter(Boolean) as string[]
  for (const candidate of daySearchOrder) {
    const dayMatch = candidate.match(/^\s*(?:[A-Za-z]+\s+)?(\d{1,2})\s*,/)
    if (dayMatch) {
      day = parseNumber(dayMatch[1])
      break
    }
  }

  if (month === null || !day) return null
  return new Date(year, month, day)
}

const extractForecastDateRange = (rawText: string) => {
  const startMatch = rawText.match(/start date\s+([A-Za-z]+\s+\d{1,2},?\s*\d{4})/i)
  const endMatch = rawText.match(/end date\s+([A-Za-z]+\s+\d{1,2},?\s*\d{4})/i)
  const start = startMatch ? parseDateFromText(startMatch[1]) : null
  const end = endMatch ? parseDateFromText(endMatch[1]) : null
  return { start, end }
}

const withinForecastRange = (day: ForecastDay, range: { start: Date | null; end: Date | null }) => {
  if (!range.start && !range.end) return true
  const value = new Date(`${day.dateISO}T00:00:00`)
  if (range.start && value < new Date(`${isoDate(range.start)}T00:00:00`)) return false
  if (range.end && value > new Date(`${isoDate(range.end)}T00:00:00`)) return false
  return true
}

const OCR_ROW_START_PATTERN =
  /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\b.*\b(?:deluxe room|1 bedroom suite)\b/i

const OCR_NOISE_PATTERN = /https?:|tenant|property|housekeeping forecasting|room type|arrivals|departures|stay overs|start date|end date|printed/i

const OCR_ROOM_START_FRAGMENT = /\b(?:deluxe|dee|dewxe|douxe|doxe|dowxe|soluxe)\s+room\b|\b1\s*bedroom\b|\bsuite\b/i

const OCR_MONTH_ONLY_PATTERN =
  /^(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?$/i

const stripOcrMetrics = (line: string) => {
  const metricText = line.replace(/\b0o+\b|\boo+\b|\bo\b/gi, "0")
  const matches = Array.from(metricText.matchAll(/-?\d+(?:\.\d+)?/g))
  if (matches.length < 5) return line
  const metricStart = matches[Math.max(0, matches.length - 9)]?.index
  return metricStart === undefined ? line : line.slice(0, metricStart)
}

const findLastLineIndex = (lines: string[], predicate: (line: string) => boolean) => {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (predicate(lines[index])) return index
  }
  return -1
}

const extractOcrRoomDescription = (lines: string[], index: number) => {
  const currentLine = stripOcrMetrics(lines[index])
  const previous: string[] = []
  for (let cursor = index - 1; cursor >= 0 && cursor >= index - 6; cursor -= 1) {
    const current = lines[cursor]
    if (parseOcrMetricLine(current) || OCR_NOISE_PATTERN.test(current)) break
    previous.unshift(current)
    if (OCR_ROW_START_PATTERN.test(current)) break
  }

  const roomStartIndex = findLastLineIndex(previous, line => OCR_ROOM_START_FRAGMENT.test(line))
  const monthStartIndex = findLastLineIndex(previous, line => OCR_MONTH_ONLY_PATTERN.test(line))
  const trimmedPrevious = OCR_ROOM_START_FRAGMENT.test(currentLine)
    ? []
    : previous.slice(Math.max(roomStartIndex, monthStartIndex, 0))

  const next: string[] = []
  for (let cursor = index + 1; cursor < lines.length && cursor <= index + 5; cursor += 1) {
    const current = lines[cursor]
    if (OCR_NOISE_PATTERN.test(current)) continue
    if (parseOcrMetricLine(current)) break
    if (OCR_ROOM_START_FRAGMENT.test(current)) break
    if (OCR_ROW_START_PATTERN.test(current)) break
    next.push(current)
  }

  return normalize(
    [...trimmedPrevious, currentLine, ...next]
      .join(" ")
      .replace(/\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\b/gi, " ")
      .replace(/\b20\d{2}\b/g, " ")
      .replace(/^\s*\d{1,2}\s*,?\s*/, " "),
  )
}

const parseOcrForecastRows = (rawText: string) => {
  const range = extractForecastDateRange(rawText)
  const lines = rawText
    .replace(/\r/g, "\n")
    .split(/\n/)
    .map(normalize)
    .filter(Boolean)

  const daysByISO = new Map<string, { date: Date; groups: Record<ForecastRoomGroup, ForecastGroupSummary> }>()
  const unmappedRoomTypes = new Set<string>()
  let lastDate: Date | null = null

  lines.forEach((line, index) => {
    const metrics = parseOcrMetricLine(line)
    if (!metrics) return

    const date = inferDateForOcrRow(lines, index) || lastDate
    if (!date) return
    lastDate = date

    const key = isoDate(date)
    const roomDescription = extractOcrRoomDescription(lines, index)
    if (/\bTOTAL\b/i.test(roomDescription)) return

    const group = tryMapForecastRoomType(roomDescription)
    if (!group) {
      if (/\b(?:1 bedroom suite|king bed|queen beds?|2\s*queen|1\s*king)\b/i.test(roomDescription)) {
        unmappedRoomTypes.add(roomDescription)
      }
      return
    }

    if (!daysByISO.has(key)) {
      daysByISO.set(key, { date, groups: createEmptyForecastGroups() })
    }

    const day = daysByISO.get(key)
    if (!day) return
    const roomCode = roomCodeForDescription(group, roomDescription)

    day.groups[group].rows.push({
      roomCode,
      roomLabel: roomDescription,
      group,
      arrivals: metrics.arrivals,
      departures: metrics.departures,
      stayovers: metrics.stayovers,
      arrivingGuests: metrics.arrivingGuests,
      departingGuests: metrics.departingGuests,
    })
  })

  if (unmappedRoomTypes.size) {
    throw new Error(`Unmapped room type: ${Array.from(unmappedRoomTypes).slice(0, 5).join("; ")}`)
  }

  return Array.from(daysByISO.values())
    .map(({ date, groups }) => summarizeForecastDay(date, groups))
    .filter(day => day.arrivals > 0 || day.departures > 0 || day.stayovers > 0)
    .filter(day => withinForecastRange(day, range))
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
}

const makeEmptyGroup = (group: ForecastRoomGroup): ForecastGroupSummary => ({
  group,
  inventoryTotal: FORECAST_ROOM_TOTALS[group],
  arrivals: 0,
  departures: 0,
  stayovers: 0,
  arrivingGuests: 0,
  departingGuests: 0,
  occupied: 0,
  available: FORECAST_ROOM_TOTALS[group],
  rows: [],
})

export const createEmptyForecastGroups = () =>
  FORECAST_ROOM_GROUPS.reduce<Record<ForecastRoomGroup, ForecastGroupSummary>>((acc, group) => {
    acc[group] = makeEmptyGroup(group)
    return acc
  }, {} as Record<ForecastRoomGroup, ForecastGroupSummary>)

export const assertForecastInventoryTotals = () => {
  const total = FORECAST_ROOM_GROUPS.reduce((sum, group) => sum + FORECAST_ROOM_TOTALS[group], 0)
  if (total !== FORECAST_ROOM_TOTAL) {
    throw new Error(`Consolidated room inventory must equal ${FORECAST_ROOM_TOTAL}. Current total: ${total}.`)
  }
}

export const summarizeForecastDay = (date: Date, groups: Record<ForecastRoomGroup, ForecastGroupSummary>): ForecastDay => {
  let arrivals = 0
  let departures = 0
  let stayovers = 0
  let arrivingGuests = 0
  let departingGuests = 0
  let totalOccupied = 0
  let totalAvailable = 0

  FORECAST_ROOM_GROUPS.forEach((groupKey) => {
    const group = groups[groupKey]

    group.inventoryTotal = FORECAST_ROOM_TOTALS[groupKey]
    group.rows = normalizeForecastRoomRows(groupKey, group.rows)

    group.arrivals = group.rows.reduce((sum, row) => sum + Math.max(0, Number(row.arrivals ?? 0)), 0)
    group.departures = group.rows.reduce((sum, row) => sum + Math.max(0, Number(row.departures ?? 0)), 0)
    group.stayovers = group.rows.reduce((sum, row) => sum + Math.max(0, Number(row.stayovers ?? 0)), 0)
    group.arrivingGuests = group.rows.reduce((sum, row) => sum + Math.max(0, Number(row.arrivingGuests ?? 0)), 0)
    group.departingGuests = group.rows.reduce((sum, row) => sum + Math.max(0, Number(row.departingGuests ?? 0)), 0)

    group.occupied = group.arrivals + group.stayovers
    group.available = group.rows.reduce(
      (sum, row) =>
        sum +
        ((FORECAST_ROOM_CODE_TOTALS as Record<string, number>)[row.roomCode] ?? 0) -
        row.arrivals -
        row.stayovers,
      0
    )

    arrivals += group.arrivals
    departures += group.departures
    stayovers += group.stayovers
    arrivingGuests += group.arrivingGuests
    departingGuests += group.departingGuests
    totalOccupied += group.occupied
    totalAvailable += group.available
  })

  return {
    dateISO: isoDate(date),
    dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    dayLabel: date.toLocaleDateString("en-US", { weekday: "short" }),
    groups,
    arrivals,
    departures,
    stayovers,
    arrivingGuests,
    departingGuests,
    totalOccupied,
    totalAvailable,
    occupancy: `${((totalOccupied / FORECAST_ROOM_TOTAL) * 100).toFixed(1)}%`,
    oversold:
      totalAvailable < 0 ||
      FORECAST_ROOM_GROUPS.some((group) => groups[group].available < 0),
  }
}
export const buildForecastDaysFromActivityRows = (rows: ForecastAiActivityRow[]) => {
  assertForecastInventoryTotals()

  const daysByISO = new Map<string, { date: Date; groups: Record<ForecastRoomGroup, ForecastGroupSummary> }>()

  rows.forEach(row => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.dateISO)) return
    if (!FORECAST_ROOM_GROUPS.includes(row.group)) return

    const date = new Date(`${row.dateISO}T00:00:00`)
    if (Number.isNaN(date.getTime())) return

    if (!daysByISO.has(row.dateISO)) {
      daysByISO.set(row.dateISO, { date, groups: createEmptyForecastGroups() })
    }

    const day = daysByISO.get(row.dateISO)
    if (!day) return

    day.groups[row.group].rows.push({
      roomCode: row.group,
      roomLabel: row.roomLabel || row.group,
      group: row.group,
      arrivals: Math.max(0, parseNumber(String(row.arrivals))),
      departures: Math.max(0, parseNumber(String(row.departures))),
      stayovers: Math.max(0, parseNumber(String(row.stayovers))),
      arrivingGuests: Math.max(0, parseNumber(String(row.arrivingGuests || 0))),
      departingGuests: Math.max(0, parseNumber(String(row.departingGuests || 0))),
    })
  })

  return Array.from(daysByISO.values())
    .map(({ date, groups }) => summarizeForecastDay(date, groups))
    .filter(day => day.arrivals > 0 || day.departures > 0 || day.stayovers > 0)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
}

const detectColumnOrder = (line: string) => {
  const lower = line.toLowerCase()
  if (!/(arr|arv|arrival|depart|dpt|dep|stay)/.test(lower)) return null

  const labels: Array<{ label: keyof ForecastRoomActivity; index: number }> = [
    { label: "arrivals" as keyof ForecastRoomActivity, index: Math.min(...["arrivals", "arrival", "arv", "arr"].map(token => lower.indexOf(token)).filter(index => index >= 0)) },
    { label: "departures" as keyof ForecastRoomActivity, index: Math.min(...["departures", "departure", "dpt", "dept", "dep"].map(token => lower.indexOf(token)).filter(index => index >= 0)) },
    { label: "stayovers" as keyof ForecastRoomActivity, index: Math.min(...["stayovers", "stayover", "stay"].map(token => lower.indexOf(token)).filter(index => index >= 0)) },
    { label: "arrivingGuests" as keyof ForecastRoomActivity, index: Math.min(...["arriving guests", "arr guests", "arr pax"].map(token => lower.indexOf(token)).filter(index => index >= 0)) },
    { label: "departingGuests" as keyof ForecastRoomActivity, index: Math.min(...["departing guests", "dep guests", "dpt guests", "dep pax"].map(token => lower.indexOf(token)).filter(index => index >= 0)) },
  ].filter(item => Number.isFinite(item.index))

  const order = labels.sort((a, b) => a.index - b.index).map(item => item.label)
  return order.length >= 3 ? order : null
}

const activityFromLine = (line: string, order: Array<keyof ForecastRoomActivity>) => {
  const roomToken = findRoomToken(line)
  if (!roomToken) return null

  const valueText = line.slice(roomToken.index + roomToken.length)
  const values = (valueText.match(/-?\d+(?:\.\d+)?/g) || []).map(parseNumber)
  if (values[0] === FORECAST_ROOM_TOTALS[roomToken.group] && values.length > order.length) {
    values.shift()
  }
  if (values.length < 3) return null

  const row: ForecastRoomActivity = {
    roomCode: roomToken.roomCode,
    roomLabel: roomToken.roomLabel,
    group: roomToken.group,
    arrivals: 0,
    departures: 0,
    stayovers: 0,
    arrivingGuests: 0,
    departingGuests: 0,
  }

  order.forEach((key, index) => {
    if (key in row) {
      ;(row[key] as number) = values[index] ?? 0
    }
  })

  return row
}


const FORECAST_METRIC_LINE_NOISE_PATTERN = /https?:|tenant|property|housekeeping forecasting|room\\s*types?|roomtype|arrivals|departures|stay\\s+over|start date|end date|printed|room types available|bedded rooms available/i
const FORECAST_MONTH_WORD_PATTERN = /\\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\.?\\b/i
const FORECAST_ROW_ROOM_START_PATTERN = /\\b(?:deluxe|dee|dewxe|douxe|doxe|dowxe|soluxe)\\s+room\\b|\\b1\\s*bedroom\\b|\\bsuite\\b/i

const cleanForecastOcrLine = (line: string) =>
  normalize(
    String(line || "")
      .replace(/[\\\\|]/g, " ")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/\\b0o+\\b|\\boo+\\b|\\bOo\\b|\\bO\\b/g, "0")
      .replace(/[)]/g, " 0 ")
      .replace(/[(]/g, " ")
  )

const protectForecastRoomCounts = (line: string) =>
  line
    .replace(/\\b1\\s*Bedroom\\b/gi, "ONE_BEDROOM")
    .replace(/\\b1\\s*King\\b/gi, "ONE_KING")
    .replace(/\\b2\\s*Queen\\b/gi, "TWO_QUEEN")
    .replace(/\\b2Queen\\b/gi, "TWO_QUEEN")

const unprotectForecastRoomCounts = (line: string) =>
  line
    .replace(/ONE_BEDROOM/g, "1 Bedroom")
    .replace(/ONE_KING/g, "1 King")
    .replace(/TWO_QUEEN/g, "2 Queen")

const removeForecastDatePrefix = (line: string) =>
  line.replace(/^\\s*(?:[A-Za-z]+\\s+)?\\d{1,2}[A-Za-z]?\\s*,?\\s*/, " ")

const metricValuesFromForecastLine = (line: string) => {
  const raw = cleanForecastOcrLine(line)
  if (FORECAST_METRIC_LINE_NOISE_PATTERN.test(raw)) return null

  let metricText = protectForecastRoomCounts(raw)
  metricText = removeForecastDatePrefix(metricText)
  metricText = metricText
    .replace(FORECAST_MONTH_WORD_PATTERN, " ")
    .replace(/\\b20\\d{2}\\b/g, " ")

  const numbers = (metricText.match(/-?\\d+(?:\\.\\d+)?/g) || []).map(parseNumber)
  if (numbers.length < 5) return null

  const values = numbers.length > 9 ? numbers.slice(numbers.length - 9) : numbers

  if (
    (values[0] ?? 0) > FORECAST_ROOM_TOTAL ||
    (values[2] ?? 0) > FORECAST_ROOM_TOTAL ||
    (values[4] ?? 0) > FORECAST_ROOM_TOTAL
  ) {
    return null
  }

  return {
    arrivals: values[0] ?? 0,
    arrivingGuests: values[1] ?? 0,
    departures: values[2] ?? 0,
    departingGuests: values[3] ?? 0,
    stayovers: values[4] ?? 0,
    stayoverGuests: values[5] ?? 0,
  }
}

const cleanForecastDescriptionLine = (line: string) => {
  let value = cleanForecastOcrLine(line)
  if (FORECAST_METRIC_LINE_NOISE_PATTERN.test(value)) return ""

  value = protectForecastRoomCounts(value)
  value = removeForecastDatePrefix(value)
  value = value
    .replace(FORECAST_MONTH_WORD_PATTERN, " ")
    .replace(/\\b20\\d{2}\\b/g, " ")

  const metricRun = value.search(/(?:^|\\s)-?\\d+(?:\\.\\d+)?(?:\\s+-?\\d+(?:\\.\\d+)?){4,}/)
  if (metricRun >= 0) value = value.slice(0, metricRun)

  value = unprotectForecastRoomCounts(value)

  return normalize(
    value
      .replace(/[~=_]+/g, " ")
      .replace(/[^A-Za-z0-9,\\s-]/g, " ")
  )
}

const findLastForecastIndex = (values: string[], predicate: (line: string) => boolean) => {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (predicate(values[index])) return index
  }
  return -1
}

const dateFromForecastBlock = (block: string[], lastDate: Date | null) => {
  const text = cleanForecastOcrLine(block.join(" "))

  const monthMatch = text.match(FORECAST_MONTH_WORD_PATTERN)
  const month = monthMatch ? monthIndex(monthMatch[1]) : lastDate ? lastDate.getMonth() : null

  const yearMatch = text.match(/\\b20\\d{2}\\b/)
  const year = yearMatch
    ? parseNumber(yearMatch[0])
    : lastDate
      ? lastDate.getFullYear()
      : new Date().getFullYear()

  const dayMatch = text.match(/(?:^|\\s)(\\d{1,2})\\s*,/)
  const day = dayMatch ? parseNumber(dayMatch[1]) : lastDate ? lastDate.getDate() : 0

  if (month === null || !day) return lastDate

  const date = new Date(year, month, day)
  return Number.isNaN(date.getTime()) ? lastDate : date
}

const parseForecastRowsByMetricBlocks = (rawText: string): ForecastDay[] => {
  const lines = rawText
    .replace(/\\r/g, "\\n")
    .split(/\\n/)
    .map(cleanForecastOcrLine)
    .filter(Boolean)

  const metricRows: Array<{
    index: number
    metrics: {
      arrivals: number
      arrivingGuests: number
      departures: number
      departingGuests: number
      stayovers: number
      stayoverGuests: number
    }
  }> = []

  lines.forEach((line, index) => {
    const metrics = metricValuesFromForecastLine(line)
    if (metrics) metricRows.push({ index, metrics })
  })

  if (!metricRows.length) return []

  const daysByISO = new Map<string, { date: Date; groups: Record<ForecastRoomGroup, ForecastGroupSummary> }>()
  let lastDate: Date | null = null

  metricRows.forEach((metricRow, rowIndex) => {
    const previousMetricIndex = metricRows[rowIndex - 1]?.index ?? -1
    const nextMetricIndex = metricRows[rowIndex + 1]?.index ?? lines.length

    const previousWindow = lines.slice(
      Math.max(previousMetricIndex + 1, metricRow.index - 8, 0),
      metricRow.index
    )

    const monthPosition = findLastForecastIndex(previousWindow, line => FORECAST_MONTH_WORD_PATTERN.test(line))
    const roomPosition = findLastForecastIndex(previousWindow, line => FORECAST_ROW_ROOM_START_PATTERN.test(line))

    let start = previousWindow.length

    if (monthPosition >= 0) {
      start = monthPosition

      for (let index = monthPosition - 1; index >= 0; index -= 1) {
        if (FORECAST_ROW_ROOM_START_PATTERN.test(previousWindow[index])) start = index
        else if (index < monthPosition - 3) break
      }
    } else if (roomPosition >= 0) {
      start = roomPosition
    } else {
      start = Math.max(0, previousWindow.length - 2)
    }

    const before = previousWindow.slice(start)
    const after: string[] = []

    for (let cursor = metricRow.index + 1; cursor < Math.min(nextMetricIndex, metricRow.index + 8); cursor += 1) {
      const line = lines[cursor]
      if (!line) continue
      if (/https?:|tenant|property|printed/i.test(line)) break
      if (FORECAST_MONTH_WORD_PATTERN.test(line)) break
      if (FORECAST_ROW_ROOM_START_PATTERN.test(line)) break
      after.push(line)
    }

    const block = [...before, lines[metricRow.index], ...after]
    const date = dateFromForecastBlock(block, lastDate)
    if (!date) return

    lastDate = date

    const roomDescription = normalize(
      block
        .map(cleanForecastDescriptionLine)
        .filter(Boolean)
        .join(" ")
    )

    if (!roomDescription || /\\bTOTAL\\b/i.test(roomDescription)) return

    let group = tryMapForecastRoomType(roomDescription)

    if (!group && /\\b(?:deluxe|dee|dewxe|douxe|doxe|dowxe|soluxe)\\s+room\\b/i.test(roomDescription)) {
      group = "QNQN"
    }

    if (!group) return

    const key = isoDate(date)

    if (!daysByISO.has(key)) {
      daysByISO.set(key, { date, groups: createEmptyForecastGroups() })
    }

    const day = daysByISO.get(key)
    if (!day) return

    const roomCode = roomCodeForDescription(group, roomDescription)

    day.groups[group].rows.push({
      roomCode,
      roomLabel: roomDescription,
      group,
      arrivals: metricRow.metrics.arrivals,
      departures: metricRow.metrics.departures,
      stayovers: metricRow.metrics.stayovers,
      arrivingGuests: metricRow.metrics.arrivingGuests,
      departingGuests: metricRow.metrics.departingGuests,
    })
  })

  return Array.from(daysByISO.values())
    .map(({ date, groups }) => summarizeForecastDay(date, groups))
    .filter(day => day.arrivals > 0 || day.departures > 0 || day.stayovers > 0)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
}

export function parseMonthHousekeepingForecastText(rawText: string): ForecastParseResult {
  assertForecastInventoryTotals()

  const blockDays = parseForecastRowsByMetricBlocks(rawText)
  if (blockDays.length >= 7) {
    return { days: blockDays, sourceText: rawText }
  }

  if (/housekeeping forecasting|stay rooms|room type/i.test(rawText)) {
    const ocrDays = parseOcrForecastRows(rawText)
    if (ocrDays.length >= 7) {
      return {
        days: ocrDays,
        sourceText: rawText,
      }
    }
  }

  const lines = prepareForecastText(rawText)
    .split(/\r?\n/)
    .map(normalize)
    .filter(Boolean)

  const daysByISO = new Map<string, { date: Date; groups: Record<ForecastRoomGroup, ForecastGroupSummary> }>()
  let currentDate: Date | null = null
  let currentOrder: Array<keyof ForecastRoomActivity> = ["arrivals", "departures", "stayovers", "arrivingGuests", "departingGuests"]

  lines.forEach(line => {
    const date = parseDateFromText(line)
    if (date) {
      currentDate = date
      const key = isoDate(date)
      if (!daysByISO.has(key)) {
        daysByISO.set(key, { date, groups: createEmptyForecastGroups() })
      }
    }

    const detectedOrder = detectColumnOrder(line)
    if (detectedOrder) currentOrder = detectedOrder

    if (!currentDate) return

    const activity = activityFromLine(line, currentOrder)
    if (!activity) return

    const day = daysByISO.get(isoDate(currentDate))
    if (!day) return
    day.groups[activity.group].rows.push(activity)
  })

  let days = Array.from(daysByISO.values())
    .map(({ date, groups }) => summarizeForecastDay(date, groups))
    .filter(day => day.arrivals > 0 || day.departures > 0 || day.stayovers > 0)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))

  if (days.length < 7) {
    days = parseOcrForecastRows(rawText)
  }

  if (days.length < 7) {
    throw new Error("Unable to parse housekeeping forecast. Please upload the Month Housekeeping Forecast PDF.")
  }

  return {
    days,
    sourceText: rawText,
  }
}
