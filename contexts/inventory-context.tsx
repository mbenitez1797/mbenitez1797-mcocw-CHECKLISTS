"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  ROOM_TOTAL,
  ROOM_TYPE_MAP,
  calculateOccupancy,
  calculateStayovers,
  emptyRooms,
  loadDailyInventory,
  saveDailyInventory,
  totalAvailableRooms,
  type DailyInventorySnapshot,
  type RoomBucket,
} from "@/lib/daily-inventory"
import { loadCloudState, saveCloudState } from "@/lib/cloud-state"

export const ROOM_CODES = {
  KING: ROOM_TYPE_MAP.KING,
  VIKG: ROOM_TYPE_MAP.VIKG,
  QUEEN: ROOM_TYPE_MAP.QUEEN,
  QUEENS: ROOM_TYPE_MAP.QUEEN,
  VIQN: ROOM_TYPE_MAP.VIQN,
  SUITES: ROOM_TYPE_MAP.SUITES,
} as const

export type RoomCategory = keyof typeof ROOM_CODES
export type ShiftType = "AM" | "PM" | "Night"
export type RoomInventory = Record<string, number>

export type DailyMetrics = {
  arrivals: number
  departures: number
  stayovers: number
  occupancy: string
}

type InventoryState = {
  currentDate: string
  tomorrowDate: string
  currentShift: ShiftType
  todayInventory: RoomInventory
  tomorrowInventory: RoomInventory
  todayMetrics: DailyMetrics
  tomorrowMetrics: DailyMetrics
  dailyInventorySnapshot: DailyInventorySnapshot
  lastSync: string | null
  isAuditMode: boolean
  auditSet: 1 | 2
  checklistUnlocked: Record<ShiftType, boolean>
  nightAuditPhase: 1 | 2
}

type InventoryContextType = InventoryState & {
  kingTotal: number
  queensTotal: number
  vikgTotal: number
  viqnTotal: number
  suitesTotal: number
  grandTotal: number
  tomorrowKingTotal: number
  tomorrowQueensTotal: number
  tomorrowVikgTotal: number
  tomorrowViqnTotal: number
  tomorrowSuitesTotal: number
  tomorrowGrandTotal: number
  updateTodayInventory: (roomCode: string, value: number) => void
  updateTomorrowInventory: (roomCode: string, value: number) => void
  setCurrentShift: (shift: ShiftType) => void
  enterAuditMode: () => void
  setAuditSet: (set: 1 | 2) => void
  completeAuditAndRollover: () => void
  syncInventory: () => void
  clearAllInventory: () => void
  unlockChecklist: (shift: ShiftType) => void
  resetChecklistUnlock: (shift: ShiftType) => void
  setNightAuditPhase: (phase: 1 | 2) => void
  isChecklistUnlocked: (shift: ShiftType) => boolean
  updateTodayMetrics: (metrics: Partial<DailyMetrics>) => void
  updateTomorrowMetrics: (metrics: Partial<DailyMetrics>) => void
  setExtractedRoomTotals: (totals: Partial<RoomBucket> & { QUEENS?: number }, isForTomorrow?: boolean) => void
  setDailyInventorySnapshot: (snapshot: DailyInventorySnapshot) => void
}

const STORAGE_KEY = "hotel-inventory-state"
const CLOUD_DAILY_INVENTORY_KEY = "daily-inventory-snapshot"
const CLOUD_POLL_MS = 15000

const todayIso = () => new Date().toISOString().split("T")[0]

const tomorrowIso = (date: string) => {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + 1)
  return d.toISOString().split("T")[0]
}

export const formatDisplayDate = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

const safeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const createEmptyInventory = (): RoomInventory => {
  const inventory: RoomInventory = {}
  Object.values(ROOM_TYPE_MAP).flat().forEach((code) => {
    inventory[code] = 0
  })
  return inventory
}

const inventoryFromRooms = (roomsInput?: Partial<RoomBucket> | null): RoomInventory => {
  const rooms = sanitizeRooms(roomsInput)
  const inventory = createEmptyInventory()
  inventory[ROOM_TYPE_MAP.KING[0]] = rooms.KING
  inventory[ROOM_TYPE_MAP.VIKG[0]] = rooms.VIKG
  inventory[ROOM_TYPE_MAP.QUEEN[0]] = rooms.QUEEN
  inventory[ROOM_TYPE_MAP.VIQN[0]] = rooms.VIQN
  inventory[ROOM_TYPE_MAP.SUITES[0]] = rooms.SUITES
  return inventory
}

const sanitizeRooms = (roomsInput?: Partial<RoomBucket> | null): RoomBucket => ({
  KING: safeNumber(roomsInput?.KING),
  VIKG: safeNumber(roomsInput?.VIKG),
  QUEEN: safeNumber(roomsInput?.QUEEN),
  VIQN: safeNumber(roomsInput?.VIQN),
  SUITES: safeNumber(roomsInput?.SUITES),
})

const totalFor = (inventory: RoomInventory, codes: readonly string[]) => codes.reduce((sum, code) => sum + (inventory[code] || 0), 0)

const defaultSnapshot = (): DailyInventorySnapshot => ({
  dateLabel: "Today",
  roomTotal: ROOM_TOTAL,
  available: 0,
  committed: 0,
  arrivals: 0,
  departures: 0,
  stayovers: ROOM_TOTAL,
  occupancy: "0.0%",
  oooOtm: "0/0",
  groupsRemaining: 0,
  guests: "0 adults, 0 children",
  rooms: emptyRooms(),
  recommendations: ["Upload the Month Housekeeping Forecast PDF to generate availability and balancing recommendations."],
  updatedAt: "Not synced",
})

const sanitizeSnapshot = (input?: Partial<DailyInventorySnapshot> | null): DailyInventorySnapshot => {
  const base = defaultSnapshot()
  const rooms = sanitizeRooms(input?.rooms)
  return {
    ...base,
    ...input,
    roomTotal: safeNumber(input?.roomTotal, ROOM_TOTAL),
    available: safeNumber(input?.available, totalAvailableRooms(rooms)),
    committed: safeNumber(input?.committed),
    arrivals: safeNumber(input?.arrivals),
    departures: safeNumber(input?.departures),
    stayovers: safeNumber(input?.stayovers, ROOM_TOTAL),
    groupsRemaining: safeNumber(input?.groupsRemaining),
    occupancy: String(input?.occupancy || base.occupancy),
    oooOtm: String(input?.oooOtm || base.oooOtm),
    guests: String(input?.guests || base.guests),
    rooms,
    recommendations: Array.isArray(input?.recommendations) ? input!.recommendations as string[] : base.recommendations,
    updatedAt: String(input?.updatedAt || base.updatedAt),
  }
}

const metricsFromSnapshot = (snapshotInput: DailyInventorySnapshot): DailyMetrics => {
  const snapshot = sanitizeSnapshot(snapshotInput)
  return {
    arrivals: snapshot.arrivals,
    departures: snapshot.departures,
    stayovers: snapshot.stayovers,
    occupancy: snapshot.occupancy,
  }
}

const snapshotSignature = (snapshotInput?: Partial<DailyInventorySnapshot> | null) => {
  const snapshot = sanitizeSnapshot(snapshotInput)
  return JSON.stringify({
    dateLabel: snapshot.dateLabel,
    available: snapshot.available,
    committed: snapshot.committed,
    arrivals: snapshot.arrivals,
    departures: snapshot.departures,
    stayovers: snapshot.stayovers,
    occupancy: snapshot.occupancy,
    rooms: snapshot.rooms,
    updatedAt: snapshot.updatedAt,
  })
}

const defaultState = (): InventoryState => {
  const currentDate = todayIso()
  const snapshot = defaultSnapshot()
  return {
    currentDate,
    tomorrowDate: tomorrowIso(currentDate),
    currentShift: "AM",
    todayInventory: createEmptyInventory(),
    tomorrowInventory: createEmptyInventory(),
    todayMetrics: metricsFromSnapshot(snapshot),
    tomorrowMetrics: metricsFromSnapshot(snapshot),
    dailyInventorySnapshot: snapshot,
    lastSync: null,
    isAuditMode: false,
    auditSet: 1,
    checklistUnlocked: { AM: false, PM: false, Night: false },
    nightAuditPhase: 1,
  }
}

const applySnapshotToState = (state: InventoryState, snapshotInput: DailyInventorySnapshot): InventoryState => {
  const snapshot = sanitizeSnapshot(snapshotInput)
  return {
    ...state,
    dailyInventorySnapshot: snapshot,
    todayInventory: inventoryFromRooms(snapshot.rooms),
    todayMetrics: metricsFromSnapshot(snapshot),
    lastSync: snapshot.updatedAt,
  }
}

const persistSnapshot = (snapshotInput: DailyInventorySnapshot) => {
  const snapshot = sanitizeSnapshot({
    ...snapshotInput,
    updatedAt: snapshotInput.updatedAt || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  })
  saveDailyInventory(snapshot)
  void saveCloudState(CLOUD_DAILY_INVENTORY_KEY, snapshot)
  return snapshot
}

const InventoryContext = createContext<InventoryContextType | null>(null)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InventoryState>(() => defaultState())
  const [isHydrated, setIsHydrated] = useState(false)
  const lastAppliedCloudSignature = useRef<string | null>(null)
  const lastLocalWriteAt = useRef(0)

  const applyCloudSnapshot = useCallback((cloudSnapshot: DailyInventorySnapshot | null) => {
    if (!cloudSnapshot) return
    const cleanSnapshot = sanitizeSnapshot(cloudSnapshot)
    const signature = snapshotSignature(cleanSnapshot)

    if (signature === lastAppliedCloudSignature.current) return
    if (Date.now() - lastLocalWriteAt.current < 3000) return

    lastAppliedCloudSignature.current = signature
    saveDailyInventory(cleanSnapshot)
    setState((prev) => {
      if (snapshotSignature(prev.dailyInventorySnapshot) === signature) return prev
      return applySnapshotToState(prev, cleanSnapshot)
    })
  }, [])

  useEffect(() => {
    const today = todayIso()
    const base = defaultState()
    const snapshot = sanitizeSnapshot(loadDailyInventory())
    const stored = localStorage.getItem(STORAGE_KEY)

    try {
      const parsed = stored ? JSON.parse(stored) : {}
      const nextSnapshot = sanitizeSnapshot(snapshot || parsed.dailyInventorySnapshot || base.dailyInventorySnapshot)
      lastAppliedCloudSignature.current = snapshotSignature(nextSnapshot)
      setState({
        ...base,
        ...parsed,
        currentDate: parsed.currentDate === today ? parsed.currentDate : today,
        tomorrowDate: tomorrowIso(parsed.currentDate === today ? parsed.currentDate : today),
        dailyInventorySnapshot: nextSnapshot,
        todayInventory: inventoryFromRooms(nextSnapshot.rooms),
        todayMetrics: metricsFromSnapshot(nextSnapshot),
        checklistUnlocked: parsed.checklistUnlocked || base.checklistUnlocked,
      })
    } catch {
      lastAppliedCloudSignature.current = snapshotSignature(snapshot)
      setState(applySnapshotToState(base, snapshot))
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    let cancelled = false

    const refreshCloud = () => {
      void loadCloudState<DailyInventorySnapshot>(CLOUD_DAILY_INVENTORY_KEY).then((cloudSnapshot) => {
        if (cancelled) return
        applyCloudSnapshot(cloudSnapshot)
      })
    }

    refreshCloud()
    const interval = window.setInterval(refreshCloud, CLOUD_POLL_MS)
    window.addEventListener("focus", refreshCloud)
    document.addEventListener("visibilitychange", refreshCloud)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.removeEventListener("focus", refreshCloud)
      document.removeEventListener("visibilitychange", refreshCloud)
    }
  }, [applyCloudSnapshot, isHydrated])

  useEffect(() => {
    if (isHydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [isHydrated, state])

  const setDailyInventorySnapshot = useCallback((snapshot: DailyInventorySnapshot) => {
    lastLocalWriteAt.current = Date.now()
    const persisted = persistSnapshot(snapshot)
    lastAppliedCloudSignature.current = snapshotSignature(persisted)
    setState((prev) => applySnapshotToState(prev, persisted))
  }, [])

  useEffect(() => {
    const onSnapshot = (event: Event) => {
      const snapshot = (event as CustomEvent<DailyInventorySnapshot>).detail
      if (!snapshot) return

      const cleanSnapshot = sanitizeSnapshot(snapshot)
      const signature = snapshotSignature(cleanSnapshot)
      lastLocalWriteAt.current = Date.now()
      lastAppliedCloudSignature.current = signature
      void saveCloudState(CLOUD_DAILY_INVENTORY_KEY, cleanSnapshot)
      setState((prev) => applySnapshotToState(prev, cleanSnapshot))
    }
    window.addEventListener("daily-inventory-updated", onSnapshot)
    return () => window.removeEventListener("daily-inventory-updated", onSnapshot)
  }, [])

  const updateSnapshotFromInventory = useCallback((inventory: RoomInventory, metrics: DailyMetrics) => {
    const rooms: RoomBucket = {
      KING: totalFor(inventory, ROOM_TYPE_MAP.KING),
      VIKG: totalFor(inventory, ROOM_TYPE_MAP.VIKG),
      QUEEN: totalFor(inventory, ROOM_TYPE_MAP.QUEEN),
      VIQN: totalFor(inventory, ROOM_TYPE_MAP.VIQN),
      SUITES: totalFor(inventory, ROOM_TYPE_MAP.SUITES),
    }
    const available = totalAvailableRooms(rooms)
    return sanitizeSnapshot({
      ...state.dailyInventorySnapshot,
      roomTotal: ROOM_TOTAL,
      available,
      arrivals: metrics.arrivals,
      departures: metrics.departures,
      stayovers: calculateStayovers(metrics.departures),
      occupancy: calculateOccupancy(available),
      rooms,
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    })
  }, [state.dailyInventorySnapshot])

  const updateTodayInventory = useCallback((roomCode: string, value: number) => {
    setState((prev) => {
      const todayInventory = { ...prev.todayInventory, [roomCode]: Math.max(0, value) }
      const snapshot = updateSnapshotFromInventory(todayInventory, prev.todayMetrics)
      lastLocalWriteAt.current = Date.now()
      const persisted = persistSnapshot(snapshot)
      lastAppliedCloudSignature.current = snapshotSignature(persisted)
      return applySnapshotToState({ ...prev, todayInventory }, persisted)
    })
  }, [updateSnapshotFromInventory])

  const updateTomorrowInventory = useCallback((roomCode: string, value: number) => {
    setState((prev) => ({
      ...prev,
      tomorrowInventory: { ...prev.tomorrowInventory, [roomCode]: Math.max(0, value) },
      lastSync: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }))
  }, [])

  const updateTodayMetrics = useCallback((metrics: Partial<DailyMetrics>) => {
    setState((prev) => {
      const nextMetrics = { ...prev.todayMetrics, ...metrics }
      nextMetrics.stayovers = calculateStayovers(nextMetrics.departures)
      const snapshot = updateSnapshotFromInventory(prev.todayInventory, nextMetrics)
      lastLocalWriteAt.current = Date.now()
      const persisted = persistSnapshot(snapshot)
      lastAppliedCloudSignature.current = snapshotSignature(persisted)
      return applySnapshotToState(prev, persisted)
    })
  }, [updateSnapshotFromInventory])

  const setExtractedRoomTotals = useCallback((totals: Partial<RoomBucket> & { QUEENS?: number }, isForTomorrow = false) => {
    const rooms: RoomBucket = {
      KING: safeNumber(totals.KING),
      VIKG: safeNumber(totals.VIKG),
      QUEEN: safeNumber(totals.QUEEN ?? totals.QUEENS),
      VIQN: safeNumber(totals.VIQN),
      SUITES: safeNumber(totals.SUITES),
    }
    const inventory = inventoryFromRooms(rooms)
    setState((prev) => {
      if (isForTomorrow) return { ...prev, tomorrowInventory: inventory }
      const available = totalAvailableRooms(rooms)
      const snapshot = sanitizeSnapshot({ ...prev.dailyInventorySnapshot, rooms, available, occupancy: calculateOccupancy(available), updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
      lastLocalWriteAt.current = Date.now()
      const persisted = persistSnapshot(snapshot)
      lastAppliedCloudSignature.current = snapshotSignature(persisted)
      return applySnapshotToState({ ...prev, todayInventory: inventory }, persisted)
    })
  }, [])

  const value = useMemo<InventoryContextType>(() => {
    const kingTotal = totalFor(state.todayInventory, ROOM_TYPE_MAP.KING)
    const queensTotal = totalFor(state.todayInventory, ROOM_TYPE_MAP.QUEEN)
    const vikgTotal = totalFor(state.todayInventory, ROOM_TYPE_MAP.VIKG)
    const viqnTotal = totalFor(state.todayInventory, ROOM_TYPE_MAP.VIQN)
    const suitesTotal = totalFor(state.todayInventory, ROOM_TYPE_MAP.SUITES)
    const tomorrowKingTotal = totalFor(state.tomorrowInventory, ROOM_TYPE_MAP.KING)
    const tomorrowQueensTotal = totalFor(state.tomorrowInventory, ROOM_TYPE_MAP.QUEEN)
    const tomorrowVikgTotal = totalFor(state.tomorrowInventory, ROOM_TYPE_MAP.VIKG)
    const tomorrowViqnTotal = totalFor(state.tomorrowInventory, ROOM_TYPE_MAP.VIQN)
    const tomorrowSuitesTotal = totalFor(state.tomorrowInventory, ROOM_TYPE_MAP.SUITES)

    return {
      ...state,
      kingTotal,
      queensTotal,
      vikgTotal,
      viqnTotal,
      suitesTotal,
      grandTotal: state.dailyInventorySnapshot.available,
      tomorrowKingTotal,
      tomorrowQueensTotal,
      tomorrowVikgTotal,
      tomorrowViqnTotal,
      tomorrowSuitesTotal,
      tomorrowGrandTotal: tomorrowKingTotal + tomorrowQueensTotal + tomorrowVikgTotal + tomorrowViqnTotal + tomorrowSuitesTotal,
      updateTodayInventory,
      updateTomorrowInventory,
      setCurrentShift: (currentShift) => setState((prev) => ({ ...prev, currentShift })),
      enterAuditMode: () => setState((prev) => ({ ...prev, isAuditMode: true, currentShift: "Night", auditSet: 1 })),
      setAuditSet: (auditSet) => setState((prev) => ({ ...prev, auditSet })),
      completeAuditAndRollover: () => setState((prev) => ({ ...prev, todayInventory: prev.tomorrowInventory, tomorrowInventory: createEmptyInventory(), currentDate: prev.tomorrowDate, tomorrowDate: tomorrowIso(prev.tomorrowDate), currentShift: "AM", isAuditMode: false, auditSet: 1 })),
      syncInventory: () => setState((prev) => ({ ...prev, lastSync: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })),
      clearAllInventory: () => setExtractedRoomTotals(emptyRooms()),
      unlockChecklist: (shift) => setState((prev) => ({ ...prev, checklistUnlocked: { ...prev.checklistUnlocked, [shift]: true } })),
      resetChecklistUnlock: (shift) => setState((prev) => ({ ...prev, checklistUnlocked: { ...prev.checklistUnlocked, [shift]: false } })),
      setNightAuditPhase: (nightAuditPhase) => setState((prev) => ({ ...prev, nightAuditPhase })),
      isChecklistUnlocked: (shift) => state.checklistUnlocked[shift] ?? false,
      updateTodayMetrics,
      updateTomorrowMetrics: (metrics) => setState((prev) => ({ ...prev, tomorrowMetrics: { ...prev.tomorrowMetrics, ...metrics } })),
      setExtractedRoomTotals,
      setDailyInventorySnapshot,
    }
  }, [setDailyInventorySnapshot, setExtractedRoomTotals, state, updateTodayInventory, updateTodayMetrics, updateTomorrowInventory])

  if (!isHydrated) return null
  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) throw new Error("useInventory must be used within an InventoryProvider")
  return context
}
