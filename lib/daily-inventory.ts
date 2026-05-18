export type RoomBucket = {
  KING: number
  VIKG: number
  QNQN: number
  VIQN: number
  SUIT: number
}

export const FIXED_PROPERTY_ROOM_TOTAL = 111

export type DailyInventorySnapshot = {
  dateLabel: string
  roomTotal: number
  available: number
  committed: number
  arrivals: number
  departures: number
  stayovers: number
  oooOtm: string
  groupsRemaining: number
  guests: string
  rooms: RoomBucket
  recommendations: string[]
  updatedAt: string
}

export const ROOM_TYPE_MAP: Record<keyof RoomBucket, string[]> = {
  KING: ["RM1K0006", "RM1KA0008", "RM1KA0009"],
  VIKG: ["RM1K0007"],
  QNQN: ["RM2Q0001"],
  VIQN: ["RM2Q0002", "RM2QA003", "RM2QA004", "RM2QA005"],
  SUIT: ["SU1B0010", "SU1BA0011"],
}

export function saveDailyInventory(snapshot: DailyInventorySnapshot) {
  if (typeof window === "undefined") return
  localStorage.setItem("daily-inventory-snapshot", JSON.stringify(snapshot))
  localStorage.setItem("shuffle-recommendations", JSON.stringify(snapshot.recommendations))
  window.dispatchEvent(new CustomEvent("daily-inventory-updated", { detail: snapshot }))
}

export function loadDailyInventory(): DailyInventorySnapshot | null {
  if (typeof window === "undefined") return null
  try {
    return JSON.parse(localStorage.getItem("daily-inventory-snapshot") || "null")
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
  const idx = headers.findIndex(h => h.includes(wanted.slice(0, 3)) && h.includes(wanted.slice(4)))
  return idx >= 0 ? idx : 2
}

export function numberValue(v: any) {
  const n = Number(String(v ?? "0").replace(/[$,%,"\s]/g, ""))
  return Number.isFinite(n) ? n : 0
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let q = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]
    if (ch === '"' && q && next === '"') {
      cell += '"'
      i++
    } else if (ch === '"') {
      q = !q
    } else if (ch === "," && !q) {
      row.push(cell.replace(/^\uFEFF/, ""))
      cell = ""
    } else if ((ch === "\n" || ch === "\r") && !q) {
      if (cell.length || row.length) {
        row.push(cell.replace(/^\uFEFF/, ""))
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
    row.push(cell.replace(/^\uFEFF/, ""))
    rows.push(row)
  }

  return rows
}

export function buildDailySnapshot(gaCsv: string, roomCsv: string): DailyInventorySnapshot {
  const gaRows = parseCsv(gaCsv)
  const roomRows = parseCsv(roomCsv)

  const gaHeaders = gaRows[0] || []
  const roomHeaders = roomRows[0] || []

  const gaCol = todayColumn(gaHeaders)
  const roomCol = todayColumn(roomHeaders)

  const getGa = (name: string) => {
    const row = gaRows.find(r => String(r[0] || "").trim().toUpperCase() === name.toUpperCase())
    return row ? row[gaCol] : 0
  }

  const roomTotal = numberValue(getGa("ROOM_TOTAL")) || 110
  const fixedRoomTotal = FIXED_PROPERTY_ROOM_TOTAL
  const committed = numberValue(getGa("COMMITTED"))
  const arrivals = numberValue(getGa("ARRIVALS"))
  const departures = numberValue(getGa("DEPARTURES"))
  const stayovers = numberValue(getGa("STAYOVERS")) || numberValue(getGa("STAYOVER"))
  const available = fixedRoomTotal - (arrivals + stayovers)
  const oooOtm = String(getGa("OOO/OTM") || "0/0").trim()
  const groupsRemaining = numberValue(getGa("Groups Bedded Rooms Remaining "))
  const adults = numberValue(getGa("Adults"))
  const children = Math.max(0, numberValue(getGa("Guest Numbers")) - adults)

  const rooms: RoomBucket = { KING: 0, VIKG: 0, QNQN: 0, VIQN: 0, SUIT: 0 }

  for (const row of roomRows.slice(1)) {
    const code = normalizeCode(row[0])
    const val = numberValue(row[roomCol])
    for (const bucket of Object.keys(ROOM_TYPE_MAP) as (keyof RoomBucket)[]) {
      if (ROOM_TYPE_MAP[bucket].includes(code)) {
        rooms[bucket] += val
      }
    }
  }

  const recommendations: string[] = []
  if (rooms.KING < 0) recommendations.push(`Oversold KING by ${Math.abs(rooms.KING)}. Look for upgrade/shift from VIQN or SUIT before assigning arrivals.`)
  if (rooms.VIKG < 1 && arrivals > 0) recommendations.push("VIKG is tight/sold out. Do not pre-assign RM1K0007 unless guest specifically needs water view king.")
  if (rooms.VIQN > 0 && rooms.QNQN < 1) recommendations.push(`Use VIQN as queen-family overflow. VIQN available: ${rooms.VIQN}.`)
  if (rooms.SUIT > 0) recommendations.push(`SUIT available: ${rooms.SUIT}. Use only for recovery, elite upgrade, or true inventory balancing.`)
  if (!recommendations.length) recommendations.push("No shuffle needed based on uploaded inventory.")

  return {
    dateLabel: gaHeaders[gaCol] || roomHeaders[roomCol] || "Today",
    roomTotal: fixedRoomTotal,
    available,
    committed,
    arrivals,
    departures,
    stayovers,
    oooOtm,
    groupsRemaining,
    guests: `${adults} adults, ${children} children`,
    rooms,
    recommendations,
    updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }
}



