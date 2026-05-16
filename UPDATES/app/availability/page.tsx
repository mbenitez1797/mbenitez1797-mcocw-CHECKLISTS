"use client"

import { useInventory, formatDisplayDate, ROOM_CODES } from "@/contexts/inventory-context"
import { cn } from "@/lib/utils"
import { Building2, BedDouble, Crown, Sparkles, Calendar, Clock, AlertTriangle, CheckCircle2, ArrowDownToLine, ArrowUpFromLine, Home, Percent } from "lucide-react"

export default function AvailabilityPage() {
  const {
    currentDate,
    tomorrowDate,
    currentShift,
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
    lastSync,
    isAuditMode,
    todayInventory,
    tomorrowInventory,
    todayMetrics,
    tomorrowMetrics,
  } = useInventory()

  const categories = [
    { 
      name: "KING", 
      icon: BedDouble, 
      today: kingTotal, 
      tomorrow: tomorrowKingTotal,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      codes: ROOM_CODES.KING,
      todayInventory,
      tomorrowInventory,
    },
    { 
      name: "QUEENS", 
      icon: BedDouble, 
      today: queensTotal, 
      tomorrow: tomorrowQueensTotal,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      codes: ROOM_CODES.QUEENS,
      todayInventory,
      tomorrowInventory,
    },
    { 
      name: "VIKG", 
      icon: Crown, 
      today: vikgTotal, 
      tomorrow: tomorrowVikgTotal,
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      codes: ROOM_CODES.VIKG,
      todayInventory,
      tomorrowInventory,
    },
    { 
      name: "SUITES", 
      icon: Sparkles, 
      today: suitesTotal, 
      tomorrow: tomorrowSuitesTotal,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      codes: ROOM_CODES.SUITES,
      todayInventory,
      tomorrowInventory,
    },
  ]

  const isLowInventory = grandTotal < 10
  const hasData = grandTotal > 0 || tomorrowGrandTotal > 0

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-slate-700" />
          <h1 className="text-3xl font-bold text-foreground">Room Availability</h1>
        </div>
        <p className="text-muted-foreground">
          Live inventory dashboard - Read-only view of current room availability
        </p>
      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">
            {formatDisplayDate(currentDate)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className={cn(
            "px-2 py-0.5 rounded text-xs font-semibold",
            currentShift === "AM" && "bg-amber-100 text-amber-800",
            currentShift === "PM" && "bg-orange-100 text-orange-800",
            currentShift === "Night" && "bg-indigo-100 text-indigo-800",
          )}>
            {currentShift} Shift
          </span>
          {isAuditMode && (
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
              Audit Mode
            </span>
          )}
        </div>
        {lastSync && (
          <div className="text-xs text-slate-500">
            Last updated: {lastSync}
          </div>
        )}
        {hasData ? (
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Data synced
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="w-3.5 h-3.5" />
            No inventory data entered
          </div>
        )}
      </div>

      {/* Occupancy Banner */}
      {todayMetrics?.occupancy && todayMetrics.occupancy !== "0%" && (
        <div className="mb-6 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">Current Occupancy</span>
          </div>
          <div className="text-6xl font-bold mb-4">{todayMetrics?.occupancy ?? "0%"}</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
                <ArrowDownToLine className="w-4 h-4" />
                Arrivals
              </div>
              <div className="text-2xl font-bold">{todayMetrics?.arrivals ?? 0}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
                <ArrowUpFromLine className="w-4 h-4" />
                Departures
              </div>
              <div className="text-2xl font-bold">{todayMetrics?.departures ?? 0}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
                <Home className="w-4 h-4" />
                Stayovers
              </div>
              <div className="text-2xl font-bold">{todayMetrics?.stayovers ?? 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Low Inventory Warning */}
      {isLowInventory && hasData && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Low Inventory Alert</p>
            <p className="text-sm text-red-700">
              Total available rooms ({grandTotal}) is below threshold. Consider stop-sell or rate adjustments.
            </p>
          </div>
        </div>
      )}

      {/* Grand Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Today */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-700">Today</h2>
            <span className="text-sm text-slate-500">{formatDisplayDate(currentDate)}</span>
          </div>
          <div className="text-center py-6">
            <div className={cn(
              "text-7xl font-bold mb-2",
              isLowInventory && hasData ? "text-red-600" : "text-slate-900"
            )}>
              {grandTotal}
            </div>
            <p className="text-slate-500 text-sm">Total Available Rooms</p>
          </div>
        </div>

        {/* Tomorrow */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-500">Tomorrow</h2>
            <span className="text-sm text-slate-400">{formatDisplayDate(tomorrowDate)}</span>
          </div>
          <div className="text-center py-6">
            <div className="text-7xl font-bold text-slate-400 mb-2">
              {tomorrowGrandTotal}
            </div>
            <p className="text-slate-400 text-sm">Total Available Rooms</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Breakdown by Room Type</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <div key={cat.name} className={cn("rounded-xl p-5 border-2", cat.bgColor, "border-transparent")}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cat.color)}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className={cn("font-semibold", cat.textColor)}>{cat.name}</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className={cn("text-4xl font-bold", cat.textColor)}>{cat.today}</div>
                  <p className="text-xs text-slate-500 mt-1">Today</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-slate-400">{cat.tomorrow}</div>
                  <p className="text-xs text-slate-400 mt-1">Tomorrow</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Room Code Details */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-slate-700">Room Code Details</h3>
          <p className="text-xs text-slate-500 mt-1">Individual room type availability</p>
        </div>
        <div className="divide-y divide-slate-100">
          {categories.map((cat) => (
            <div key={cat.name} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-2 h-2 rounded-full", cat.color)} />
                <span className="font-medium text-slate-700">{cat.name}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {cat.codes.map((code) => (
                  <div key={code} className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-xs font-mono text-slate-500 mb-1">{code}</div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-slate-800">
                        {todayInventory[code] || 0}
                      </span>
                      <span className="text-slate-300">/</span>
                      <span className="text-sm text-slate-400">
                        {tomorrowInventory[code] || 0}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">today / tomorrow</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 text-center text-sm text-slate-400">
        This is a read-only view. To update inventory, use the{" "}
        <span className="font-medium text-slate-600">Shift Inventory</span> page or complete your shift checklist.
      </div>
    </div>
  )
}



