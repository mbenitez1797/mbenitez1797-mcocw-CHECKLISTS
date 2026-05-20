"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

// Room code mappings
export const ROOM_CODES = {
  KING: ["RM1K0006", "RM1KA008", "RM1KA009"],
  QUEENS: ["RM2Q0002", "RM2QA003", "RM2Q0004", "RM2QA005", "RM2Q0001"],
  VIKG: ["VIKG"], // Direct entry
  SUITES: ["SU1B0010", "SU1BA011"],
} as const

export type RoomCategory = keyof typeof ROOM_CODES
export type ShiftType = "AM" | "PM" | "Night"

interface RoomInventory {
  [roomCode: string]: number
}

// Daily metrics extracted from screenshot or manual entry
interface DailyMetrics {
  arrivals: number
  departures: number
  stayovers: number
  occupancy: string // e.g., "51.1%"
}

interface InventoryState {
  // Current date tracking
  currentDate: string
  tomorrowDate: string
  
  // Current shift
  currentShift: ShiftType
  
  // Today's inventory by room code
  todayInventory: RoomInventory
  
  // Tomorrow's inventory (for night audit)
  tomorrowInventory: RoomInventory
  
  // Daily metrics (arrivals, departures, stayovers, occupancy)
  todayMetrics: DailyMetrics
  tomorrowMetrics: DailyMetrics
  
  // Last sync timestamp
  lastSync: string | null
  
  // Night audit state
  isAuditMode: boolean
  auditSet: 1 | 2
  
  // Checklist unlock state per shift (Gatekeeper)
  checklistUnlocked: {
    AM: boolean
    PM: boolean
    Night: boolean
  }
  
  // Night audit phase (1 = start of shift, 2 = post-audit)
  nightAuditPhase: 1 | 2
}

interface InventoryContextType extends InventoryState {
  // Calculated totals for today
  kingTotal: number
  queensTotal: number
  vikgTotal: number
  suitesTotal: number
  grandTotal: number
  
  // Calculated totals for tomorrow
  tomorrowKingTotal: number
  tomorrowQueensTotal: number
  tomorrowVikgTotal: number
  tomorrowSuitesTotal: number
  tomorrowGrandTotal: number
  
  // Actions
  updateTodayInventory: (roomCode: string, value: number) => void
  updateTomorrowInventory: (roomCode: string, value: number) => void
  setCurrentShift: (shift: ShiftType) => void
  enterAuditMode: () => void
  setAuditSet: (set: 1 | 2) => void
  completeAuditAndRollover: () => void
  syncInventory: () => void
  clearAllInventory: () => void
  
  // Gatekeeper actions
  unlockChecklist: (shift: ShiftType) => void
  resetChecklistUnlock: (shift: ShiftType) => void
  setNightAuditPhase: (phase: 1 | 2) => void
  isChecklistUnlocked: (shift: ShiftType) => boolean
  
  // AI Scanner / Metrics actions
  updateTodayMetrics: (metrics: Partial<DailyMetrics>) => void
  updateTomorrowMetrics: (metrics: Partial<DailyMetrics>) => void
  setExtractedRoomTotals: (totals: { KING: number; QUEENS: number; VIKG: number; SUITES: number }, isForTomorrow?: boolean) => void
}

export type { DailyMetrics }

const STORAGE_KEY = "hotel-inventory-state"

const getInitialDate = () => {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

const getTomorrowDate = (todayStr: string) => {
  const today = new Date(todayStr)
  today.setDate(today.getDate() + 1)
  return today.toISOString().split("T")[0]
}

const formatDisplayDate = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

const createEmptyInventory = (): RoomInventory => {
  const inventory: RoomInventory = {}
  Object.values(ROOM_CODES).flat().forEach(code => {
    inventory[code] = 0
  })
  return inventory
}

const calculateTotal = (inventory: RoomInventory, codes: readonly string[]): number => {
  return codes.reduce((sum, code) => sum + (inventory[code] || 0), 0)
}

const defaultMetrics: DailyMetrics = {
  arrivals: 0,
  departures: 0,
  stayovers: 0,
  occupancy: "0%",
}

const defaultState: InventoryState = {
  currentDate: getInitialDate(),
  tomorrowDate: getTomorrowDate(getInitialDate()),
  currentShift: "AM",
  todayInventory: createEmptyInventory(),
  tomorrowInventory: createEmptyInventory(),
  todayMetrics: { ...defaultMetrics },
  tomorrowMetrics: { ...defaultMetrics },
  lastSync: null,
  isAuditMode: false,
  auditSet: 1,
  checklistUnlocked: {
    AM: false,
    PM: false,
    Night: false,
  },
  nightAuditPhase: 1,
}

const InventoryContext = createContext<InventoryContextType | null>(null)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InventoryState>(defaultState)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Check if stored date is still today, if not reset
        const today = getInitialDate()
        if (parsed.currentDate !== today) {
          // Date changed, reset inventory but keep structure
          setState({
            ...defaultState,
            currentDate: today,
            tomorrowDate: getTomorrowDate(today),
          })
        } else {
          // Merge with defaults to ensure new fields exist
          setState({
            ...defaultState,
            ...parsed,
            // Ensure new fields have proper defaults even if missing from stored
            checklistUnlocked: parsed.checklistUnlocked || defaultState.checklistUnlocked,
            todayMetrics: parsed.todayMetrics || defaultState.todayMetrics,
            tomorrowMetrics: parsed.tomorrowMetrics || defaultState.tomorrowMetrics,
            nightAuditPhase: parsed.nightAuditPhase || defaultState.nightAuditPhase,
          })
        }
      } catch {
        setState(defaultState)
      }
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage on state change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, isHydrated])

  const updateTodayInventory = useCallback((roomCode: string, value: number) => {
    setState(prev => ({
      ...prev,
      todayInventory: {
        ...prev.todayInventory,
        [roomCode]: Math.max(0, value),
      },
      lastSync: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }))
  }, [])

  const updateTomorrowInventory = useCallback((roomCode: string, value: number) => {
    setState(prev => ({
      ...prev,
      tomorrowInventory: {
        ...prev.tomorrowInventory,
        [roomCode]: Math.max(0, value),
      },
      lastSync: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }))
  }, [])

  const setCurrentShift = useCallback((shift: ShiftType) => {
    setState(prev => ({ ...prev, currentShift: shift }))
  }, [])

  const enterAuditMode = useCallback(() => {
    setState(prev => ({ ...prev, isAuditMode: true, currentShift: "Night", auditSet: 1 }))
  }, [])

  const setAuditSet = useCallback((set: 1 | 2) => {
    setState(prev => ({ ...prev, auditSet: set }))
  }, [])

  const completeAuditAndRollover = useCallback(() => {
    setState(prev => {
      const newDate = getTomorrowDate(prev.currentDate)
      return {
        ...prev,
        // Move tomorrow's inventory to today
        todayInventory: { ...prev.tomorrowInventory },
        // Clear tomorrow's inventory
        tomorrowInventory: createEmptyInventory(),
        // Increment date
        currentDate: newDate,
        tomorrowDate: getTomorrowDate(newDate),
        // Reset to AM shift
        currentShift: "AM",
        // Exit audit mode
        isAuditMode: false,
        auditSet: 1,
        lastSync: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }
    })
  }, [])

  const syncInventory = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastSync: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }))
  }, [])

  const clearAllInventory = useCallback(() => {
    setState(prev => ({
      ...prev,
      todayInventory: createEmptyInventory(),
      tomorrowInventory: createEmptyInventory(),
      lastSync: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }))
  }, [])

  const unlockChecklist = useCallback((shift: ShiftType) => {
    setState(prev => ({
      ...prev,
      checklistUnlocked: {
        ...prev.checklistUnlocked,
        [shift]: true,
      },
      lastSync: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }))
  }, [])

  const resetChecklistUnlock = useCallback((shift: ShiftType) => {
    setState(prev => ({
      ...prev,
      checklistUnlocked: {
        ...prev.checklistUnlocked,
        [shift]: false,
      },
    }))
  }, [])

  const setNightAuditPhase = useCallback((phase: 1 | 2) => {
    setState(prev => ({ ...prev, nightAuditPhase: phase }))
  }, [])

  const isChecklistUnlocked = useCallback((shift: ShiftType) => {
    return state.checklistUnlocked?.[shift] ?? false
  }, [state.checklistUnlocked])

  const updateTodayMetrics = useCallback((metrics: Partial<DailyMetrics>) => {
    setState(prev => ({
      ...prev,
      todayMetrics: { ...(prev.todayMetrics || defaultMetrics), ...metrics },
      lastSync: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }))
  }, [])

  const updateTomorrowMetrics = useCallback((metrics: Partial<DailyMetrics>) => {
    setState(prev => ({
      ...prev,
      tomorrowMetrics: { ...prev.tomorrowMetrics, ...metrics },
      lastSync: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }))
  }, [])

  // Set extracted room totals from AI scanner (distributes to first room code of each category)
  const setExtractedRoomTotals = useCallback((totals: { KING: number; QUEENS: number; VIKG: number; SUITES: number }, isForTomorrow = false) => {
    setState(prev => {
      const targetInventory = isForTomorrow ? { ...prev.tomorrowInventory } : { ...prev.todayInventory }
      
      // Set the total to the first room code in each category
      if (ROOM_CODES.KING[0]) targetInventory[ROOM_CODES.KING[0]] = totals.KING
      if (ROOM_CODES.QUEENS[0]) targetInventory[ROOM_CODES.QUEENS[0]] = totals.QUEENS
      if (ROOM_CODES.VIKG[0]) targetInventory[ROOM_CODES.VIKG[0]] = totals.VIKG
      if (ROOM_CODES.SUITES[0]) targetInventory[ROOM_CODES.SUITES[0]] = totals.SUITES
      
      return {
        ...prev,
        [isForTomorrow ? "tomorrowInventory" : "todayInventory"]: targetInventory,
        lastSync: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }
    })
  }, [])

  // Calculate totals
  const kingTotal = calculateTotal(state.todayInventory, ROOM_CODES.KING)
  const queensTotal = calculateTotal(state.todayInventory, ROOM_CODES.QUEENS)
  const vikgTotal = calculateTotal(state.todayInventory, ROOM_CODES.VIKG)
  const suitesTotal = calculateTotal(state.todayInventory, ROOM_CODES.SUITES)
  const grandTotal = kingTotal + queensTotal + vikgTotal + suitesTotal

  const tomorrowKingTotal = calculateTotal(state.tomorrowInventory, ROOM_CODES.KING)
  const tomorrowQueensTotal = calculateTotal(state.tomorrowInventory, ROOM_CODES.QUEENS)
  const tomorrowVikgTotal = calculateTotal(state.tomorrowInventory, ROOM_CODES.VIKG)
  const tomorrowSuitesTotal = calculateTotal(state.tomorrowInventory, ROOM_CODES.SUITES)
  const tomorrowGrandTotal = tomorrowKingTotal + tomorrowQueensTotal + tomorrowVikgTotal + tomorrowSuitesTotal

  // Ensure safe defaults for potentially undefined state properties
  const safeState = {
    ...defaultState,
    ...state,
    checklistUnlocked: state.checklistUnlocked || defaultState.checklistUnlocked,
    todayMetrics: state.todayMetrics || defaultState.todayMetrics,
    tomorrowMetrics: state.tomorrowMetrics || defaultState.tomorrowMetrics,
  }

  const value: InventoryContextType = {
    ...safeState,
    kingTotal,
    queensTotal,
    vikgTotal,
    suitesTotal,
    grandTotal,
    tomorrowKingTotal,
    tomorrowQueensTotal,
    tomorrowVikgTotal,
    tomorrowSuitesTotal,
    tomorrowGrandTotal,
    updateTodayInventory,
    updateTomorrowInventory,
    setCurrentShift,
    enterAuditMode,
    setAuditSet,
    completeAuditAndRollover,
    syncInventory,
    clearAllInventory,
    unlockChecklist,
    resetChecklistUnlock,
    setNightAuditPhase,
    isChecklistUnlocked,
    updateTodayMetrics,
    updateTomorrowMetrics,
    setExtractedRoomTotals,
  }

  if (!isHydrated) {
    return null
  }

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}

export { formatDisplayDate }



