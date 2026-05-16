"use client"

import { formatDisplayDate, useInventory } from "@/contexts/inventory-context"
import { cn } from "@/lib/utils"
import { ArrowDownToLine, ArrowUpFromLine, Bed, BedDouble, Calendar, Clock, Crown, Moon, Percent, RefreshCw, Sun, Sunset } from "lucide-react"

type StatProps = {
  label: string
  value: number | string
  icon?: React.ReactNode
  colorClass: string
}

function Stat({ label, value, icon, colorClass }: StatProps) {
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2", colorClass)}>
      {icon && <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10">{icon}</div>}
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-white/70">{label}</div>
        <div className="text-xl font-bold tabular-nums text-white">{value}</div>
      </div>
    </div>
  )
}

function ShiftBadge({ shift }: { shift: "AM" | "PM" | "Night" }) {
  const config = {
    AM: { icon: <Sun className="h-4 w-4" />, bg: "bg-amber-500", label: "AM Shift" },
    PM: { icon: <Sunset className="h-4 w-4" />, bg: "bg-orange-500", label: "PM Shift" },
    Night: { icon: <Moon className="h-4 w-4" />, bg: "bg-indigo-500", label: "Night Audit" },
  }
  const selected = config[shift]
  return (
    <div className={cn("flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white", selected.bg)}>
      {selected.icon}
      <span>{selected.label}</span>
    </div>
  )
}

export function InventoryBar() {
  const {
    currentDate,
    currentShift,
    dailyInventorySnapshot,
    kingTotal,
    vikgTotal,
    queensTotal,
    viqnTotal,
    suitesTotal,
    lastSync,
    syncInventory,
  } = useInventory()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-xl">
      <div className="px-4 py-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-400">Today:</span>
            <span className="text-sm font-semibold">{formatDisplayDate(currentDate)}</span>
          </div>

          <div className="flex items-center gap-4">
            <ShiftBadge shift={currentShift} />
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Last sync: {lastSync || dailyInventorySnapshot.updatedAt || "Not synced"}</span>
              <button onClick={syncInventory} className="rounded p-1 transition-colors hover:bg-slate-700" title="Sync now">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Stat label="Arrivals" value={dailyInventorySnapshot.arrivals} icon={<ArrowDownToLine className="h-4 w-4 text-green-300" />} colorClass="border-green-500/30 bg-green-500/20" />
            <Stat label="Departures" value={dailyInventorySnapshot.departures} icon={<ArrowUpFromLine className="h-4 w-4 text-red-300" />} colorClass="border-red-500/30 bg-red-500/20" />
            <Stat label="Occupancy %" value={dailyInventorySnapshot.occupancy} icon={<Percent className="h-4 w-4 text-indigo-300" />} colorClass="border-indigo-500/30 bg-indigo-500/20" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Stat label="Total Available" value={dailyInventorySnapshot.available} colorClass="border-white/15 bg-white/10" />
            <Stat label="King" value={kingTotal} icon={<Bed className="h-4 w-4 text-emerald-300" />} colorClass="border-emerald-500/30 bg-emerald-500/20" />
            <Stat label="View King / VIKG" value={vikgTotal} icon={<Bed className="h-4 w-4 text-purple-300" />} colorClass="border-purple-500/30 bg-purple-500/20" />
            <Stat label="Queen" value={queensTotal} icon={<BedDouble className="h-4 w-4 text-cyan-300" />} colorClass="border-cyan-500/30 bg-cyan-500/20" />
            <Stat label="View Queen / VIQN" value={viqnTotal} icon={<BedDouble className="h-4 w-4 text-sky-300" />} colorClass="border-sky-500/30 bg-sky-500/20" />
            <Stat label="Suites" value={suitesTotal} icon={<Crown className="h-4 w-4 text-amber-300" />} colorClass="border-amber-500/30 bg-amber-500/20" />
          </div>
        </div>
      </div>
    </header>
  )
}
