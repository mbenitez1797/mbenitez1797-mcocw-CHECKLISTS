"use client"

import { useInventory, formatDisplayDate } from "@/contexts/inventory-context"
import { Calendar, Clock, BedDouble, Bed, Crown, RefreshCw, Moon, Sun, Sunset, ArrowDownToLine, ArrowUpFromLine, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface InventoryStatProps {
  label: string
  value: number
  tomorrowValue?: number
  showTomorrow?: boolean
  icon: React.ReactNode
  colorClass: string
}

function InventoryStat({ label, value, tomorrowValue, showTomorrow, icon, colorClass }: InventoryStatProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 rounded-lg border",
      colorClass
    )}>
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-white/10">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-white/70 uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
          {showTomorrow && tomorrowValue !== undefined && (
            <span className="text-sm text-white/50">
              → {tomorrowValue}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ShiftBadge({ shift }: { shift: "AM" | "PM" | "Night" }) {
  const config = {
    AM: { icon: <Sun className="w-4 h-4" />, bg: "bg-amber-500", label: "AM Shift" },
    PM: { icon: <Sunset className="w-4 h-4" />, bg: "bg-orange-500", label: "PM Shift" },
    Night: { icon: <Moon className="w-4 h-4" />, bg: "bg-indigo-500", label: "Night Audit" },
  }
  const { icon, bg, label } = config[shift]
  
  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium", bg)}>
      {icon}
      <span>{label}</span>
    </div>
  )
}

export function InventoryBar() {
  const {
    currentDate,
    tomorrowDate,
    currentShift,
    kingTotal,
    queensTotal,
    vikgTotal,
    suitesTotal,
    tomorrowKingTotal,
    tomorrowQueensTotal,
    tomorrowVikgTotal,
    tomorrowSuitesTotal,
    lastSync,
    isAuditMode,
    syncInventory,
    todayMetrics,
  } = useInventory()

  const hasMetrics = (todayMetrics?.arrivals ?? 0) > 0 || (todayMetrics?.departures ?? 0) > 0 || (todayMetrics?.stayovers ?? 0) > 0

  const showTomorrow = isAuditMode

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-xl">
      <div className="px-4 py-3">
        {/* Top Row: Dates and Shift */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-6">
            {/* Today's Date */}
            <div className="flex items-center gap-2 text-white">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-400">Today:</span>
              <span className="text-sm font-semibold">{formatDisplayDate(currentDate)}</span>
            </div>
            
            {/* Tomorrow's Date */}
            <div className="flex items-center gap-2 text-white/70">
              <span className="text-sm font-medium text-slate-500">Tomorrow:</span>
              <span className="text-sm">{formatDisplayDate(tomorrowDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Shift Badge */}
            <ShiftBadge shift={currentShift} />
            
            {/* Last Sync */}
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs">
                {lastSync ? `Last sync: ${lastSync}` : "Not synced"}
              </span>
              <button
                onClick={syncInventory}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
                title="Sync Now"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Row: Arrivals, Departures, Stayovers (if data exists) */}
        {hasMetrics && (
          <div className="flex items-center gap-4 mb-3 pb-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/25">
              <ArrowDownToLine className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-300/80">Arrivals</span>
              <span className="text-lg font-bold text-green-300 tabular-nums">{todayMetrics?.arrivals ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/25">
              <ArrowUpFromLine className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-300/80">Departures</span>
              <span className="text-lg font-bold text-red-300 tabular-nums">{todayMetrics?.departures ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/25">
              <Home className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300/80">Stayovers</span>
              <span className="text-lg font-bold text-blue-300 tabular-nums">{todayMetrics?.stayovers ?? 0}</span>
            </div>
            {todayMetrics?.occupancy && todayMetrics.occupancy !== "0%" && (
              <div className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                <span className="text-xs text-indigo-300/80">Occupancy</span>
                <span className="text-xl font-bold text-indigo-200 tabular-nums">{todayMetrics.occupancy}</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom Row: Inventory Stats */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">
            Available
          </div>
          
          <InventoryStat
            label="King"
            value={kingTotal}
            tomorrowValue={tomorrowKingTotal}
            showTomorrow={showTomorrow}
            icon={<Bed className="w-5 h-5 text-emerald-400" />}
            colorClass="bg-emerald-500/20 border-emerald-500/30"
          />
          
          <InventoryStat
            label="Queens"
            value={queensTotal}
            tomorrowValue={tomorrowQueensTotal}
            showTomorrow={showTomorrow}
            icon={<BedDouble className="w-5 h-5 text-blue-400" />}
            colorClass="bg-blue-500/20 border-blue-500/30"
          />
          
          <InventoryStat
            label="VIKG"
            value={vikgTotal}
            tomorrowValue={tomorrowVikgTotal}
            showTomorrow={showTomorrow}
            icon={<Bed className="w-5 h-5 text-purple-400" />}
            colorClass="bg-purple-500/20 border-purple-500/30"
          />
          
          <InventoryStat
            label="Suites"
            value={suitesTotal}
            tomorrowValue={tomorrowSuitesTotal}
            showTomorrow={showTomorrow}
            icon={<Crown className="w-5 h-5 text-amber-400" />}
            colorClass="bg-amber-500/20 border-amber-500/30"
          />

          {/* Total Available */}
          <div className="ml-auto flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xs font-medium text-slate-400 uppercase">Total</span>
            <span className="text-3xl font-bold text-white tabular-nums">
              {kingTotal + queensTotal + vikgTotal + suitesTotal}
            </span>
          </div>

          {isAuditMode && (
            <div className="px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium animate-pulse">
              Audit Mode Active
            </div>
          )}
        </div>
      </div>
    </header>
  )
}



