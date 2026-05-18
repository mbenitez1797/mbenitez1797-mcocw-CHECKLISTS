"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
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

const createEmptyInventory = (): RoomInventory => {
  const inventory: RoomInventory = {}
  Object.values(ROOM_TYPE_MAP).flat().forEach((code) => {
    inventory[code] = 0
  })
  return inventory
}

const inventoryFromRooms = (rooms: RoomBucket): RoomInventory => {
  const inventory = createEmptyInventory()
  inventory[ROOM_TYPE_MAP.KING[0]] = rooms.KING
  inventory[ROOM_TYPE_MAP.VIKG[0]] = rooms.VIKG
  inventory[ROOM_TYPE_MAP.QUEEN[0]] = rooms.QUEEN
  inventory[ROOM_TYPE_MAP.VIQN[0]] = rooms.VIQN
  inventory[ROOM_TYPE_MAP.SUITES[0]] = rooms.SUITES
  return inventory
}

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

const metricsFromSnapshot = (snapshot: DailyInventorySnapshot): DailyMetrics => ({
  arrivals: snapshot.arrivals,
  departures: snapshot.departures,
  stayovers: snapshot.stayovers,
  occupancy: snapshot.occupancy,
})

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

const applySnapshotToState = (state: InventoryState, snapshot: DailyInventorySnapshot): InventoryState => ({
  ...state,
  dailyInventorySnapshot: snapshot,
  todayInventory: inventoryFromRooms(snapshot.rooms),
  todayMetrics: metricsFromSnapshot(snapshot),
  lastSync: snapshot.updatedAt,
})

const persistSnapshot = (snapshot: DailyInventorySnapshot) => {
  saveDailyInventory(snapshot)
  void saveCloudState(CLOUD_DAILY_INVENTORY_KEY, snapshot)
}

const InventoryContext = createContext<InventoryContextType | null>(null)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InventoryState>(() => defaultState())
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const today = todayIso()
    const base = defaultState()
    const snapshot = loadDailyInventory()
    const stored = localStorage.getItem(STORAGE_KEY)

    try {
      const parsed = stored ? JSON.parse(stored) : {}
      const nextSnapshot = snapshot || parsed.dailyInventorySnapshot || base.dailyInventorySnapshot
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
      setState(snapshot ? applySnapshotToState(base, snapshot) : base)
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    let cancelled = false

    void loadCloudState<DailyInventorySnapshot>(CLOUD_DAILY_INVENTORY_KEY).then((cloudSnapshot) => {
      if (cancelled || !cloudSnapshot?.rooms) return
      saveDailyInventory(cloudSnapshot)
      setState((prev) => applySnapshotToState(prev, cloudSnapshot))
    })

    return () => {
      cancelled = true
    }
  }, [isHydrated])

  useEffect(() => {
    if (isHydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [isHydrated, state])

  const setDailyInventorySnapshot = useCallback((snapshot: DailyInventorySnapshot) => {
    persistSnapshot(snapshot)
    setState((prev) => applySnapshotToState(prev, snapshot))
  }, [])

  useEffect(() => {
    const onSnapshot = (event: Event) => {
      const snapshot = (event as CustomEvent<DailyInventorySnapshot>).detail
      if (snapshot) {
        setState((prev) => applySnapshotToState(prev, snapshot))
      }
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
    return {
      ...state.dailyInventorySnapshot,
      roomTotal: ROOM_TOTAL,
      available,
      arrivals: metrics.arrivals,
      departures: metrics.departures,
      stayovers: calculateStayovers(metrics.departures),
      occupancy: calculateOccupancy(available),
      rooms,
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }, [state.dailyInventorySnapshot])

  const updateTodayInventory = useCallback((roomCode: string, value: number) => {
    setState((prev) => {
      const todayInventory = { ...prev.todayInventory, [roomCode]: Math.max(0, value) }
      const snapshot = updateSnapshotFromInventory(todayInventory, prev.todayMetrics)
      persistSnapshot(snapshot)
      return applySnapshotToState({ ...prev, todayInventory }, snapshot)
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
      persistSnapshot(snapshot)
      return applySnapshotToState(prev, snapshot)
    })
  }, [updateSnapshotFromInventory])

  const setExtractedRoomTotals = useCallback((totals: Partial<RoomBucket> & { QUEENS?: number }, isForTomorrow = false) => {
    const rooms: RoomBucket = {
      KING: totals.KING || 0,
      VIKG: totals.VIKG || 0,
      QUEEN: totals.QUEEN ?? totals.QUEENS ?? 0,
      VIQN: totals.VIQN || 0,
      SUITES: totals.SUITES || 0,
    }
    const inventory = inventoryFromRooms(rooms)
    setState((prev) => {
      if (isForTomorrow) return { ...prev, tomorrowInventory: inventory }
      const available = totalAvailableRooms(rooms)
      const snapshot = { ...prev.dailyInventorySnapshot, rooms, available, occupancy: calculateOccupancy(available), updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
      persistSnapshot(snapshot)
      return applySnapshotToState({ ...prev, todayInventory: inventory }, snapshot)
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
