"use client"

import { useInventory, ROOM_CODES, formatDisplayDate, type ShiftType } from "@/contexts/inventory-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Bed, 
  BedDouble, 
  Crown, 
  AlertTriangle, 
  CheckCircle2, 
  Moon, 
  Sun, 
  Sunset,
  RotateCcw,
  ArrowRight,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RoomInputProps {
  code: string
  value: number
  onChange: (value: number) => void
  label?: string
}

function RoomInput({ code, value, onChange, label }: RoomInputProps) {
  return (
    <div className="flex items-center gap-3">
      <Label className="w-24 text-sm font-mono text-slate-600 shrink-0">{code}</Label>
      <Input
        type="number"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-20 text-center font-mono"
        placeholder="0"
      />
      {label && <span className="text-xs text-slate-500">{label}</span>}
    </div>
  )
}

interface CategoryCardProps {
  title: string
  icon: React.ReactNode
  codes: readonly string[]
  inventory: { [key: string]: number }
  onUpdate: (code: string, value: number) => void
  total: number
  colorClass: string
  borderClass: string
}

function CategoryCard({ title, icon, codes, inventory, onUpdate, total, colorClass, borderClass }: CategoryCardProps) {
  return (
    <div className={cn("rounded-xl border-2 p-5", borderClass)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClass)}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 uppercase">Total</div>
          <div className="text-2xl font-bold text-foreground tabular-nums">{total}</div>
        </div>
      </div>
      <div className="space-y-3">
        {codes.map(code => (
          <RoomInput
            key={code}
            code={code}
            value={inventory[code] || 0}
            onChange={(val) => onUpdate(code, val)}
          />
        ))}
      </div>
    </div>
  )
}

export default function InventoryPage() {
  const {
    currentDate,
    tomorrowDate,
    currentShift,
    todayInventory,
    tomorrowInventory,
    kingTotal,
    queensTotal,
    vikgTotal,
    suitesTotal,
    tomorrowKingTotal,
    tomorrowQueensTotal,
    tomorrowVikgTotal,
    tomorrowSuitesTotal,
    isAuditMode,
    auditSet,
    updateTodayInventory,
    updateTomorrowInventory,
    setCurrentShift,
    enterAuditMode,
    setAuditSet,
    completeAuditAndRollover,
    clearAllInventory,
  } = useInventory()

  const grandTotal = kingTotal + queensTotal + vikgTotal + suitesTotal
  const tomorrowGrandTotal = tomorrowKingTotal + tomorrowQueensTotal + tomorrowVikgTotal + tomorrowSuitesTotal

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Shift Inventory</h1>
        <p className="text-muted-foreground">
          Enter room availability by room type code. Totals update in real-time across all pages.
        </p>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-blue-900">How to get these numbers:</p>
          <p className="text-sm text-blue-700 mt-1">
            StayPMS → Dashboard → Room Types (Filter: Available)
          </p>
        </div>
      </div>

      {/* Shift Selector */}
      <div className="bg-slate-50 rounded-xl p-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Current Shift</h2>
            <p className="text-sm text-muted-foreground">Select your current shift to help track inventory by time period</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={currentShift === "AM" && !isAuditMode ? "default" : "outline"}
              onClick={() => setCurrentShift("AM")}
              className="gap-2"
            >
              <Sun className="w-4 h-4" />
              AM
            </Button>
            <Button
              variant={currentShift === "PM" && !isAuditMode ? "default" : "outline"}
              onClick={() => setCurrentShift("PM")}
              className="gap-2"
            >
              <Sunset className="w-4 h-4" />
              PM
            </Button>
            <Button
              variant={isAuditMode ? "default" : "outline"}
              onClick={enterAuditMode}
              className={cn("gap-2", isAuditMode && "bg-indigo-600 hover:bg-indigo-700")}
            >
              <Moon className="w-4 h-4" />
              Night Audit
            </Button>
          </div>
        </div>
      </div>

      {/* Night Audit Mode */}
      {isAuditMode && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-indigo-900">Night Audit Mode</h2>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant={auditSet === 1 ? "default" : "outline"}
              onClick={() => setAuditSet(1)}
              className={cn(auditSet === 1 && "bg-indigo-600 hover:bg-indigo-700")}
            >
              Set 1: Today&apos;s Inventory
            </Button>
            <Button
              variant={auditSet === 2 ? "default" : "outline"}
              onClick={() => setAuditSet(2)}
              className={cn(auditSet === 2 && "bg-indigo-600 hover:bg-indigo-700")}
            >
              Set 2: Next Day Availability
            </Button>
          </div>

          {auditSet === 1 && (
            <p className="text-sm text-indigo-700 mb-4">
              Enter final inventory counts for <strong>{formatDisplayDate(currentDate)}</strong> before running the audit.
            </p>
          )}

          {auditSet === 2 && (
            <>
              <p className="text-sm text-indigo-700 mb-4">
                After running the audit, enter availability for <strong>{formatDisplayDate(tomorrowDate)}</strong>.
              </p>
              
              <div className="mt-6 pt-6 border-t border-indigo-200">
                <Button
                  onClick={completeAuditAndRollover}
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                  size="lg"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Complete Audit & Rollover Date
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <p className="text-xs text-indigo-600 mt-2">
                  This will move tomorrow&apos;s inventory to today, increment the date, and reset to AM shift.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Today's Inventory Grid */}
      {(!isAuditMode || auditSet === 1) && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Today&apos;s Availability — {formatDisplayDate(currentDate)}
            </h2>
            <Button variant="outline" size="sm" onClick={clearAllInventory} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <CategoryCard
              title="KING"
              icon={<Bed className="w-5 h-5 text-emerald-600" />}
              codes={ROOM_CODES.KING}
              inventory={todayInventory}
              onUpdate={updateTodayInventory}
              total={kingTotal}
              colorClass="bg-emerald-100"
              borderClass="border-emerald-200"
            />

            <CategoryCard
              title="QUEENS"
              icon={<BedDouble className="w-5 h-5 text-blue-600" />}
              codes={ROOM_CODES.QUEENS}
              inventory={todayInventory}
              onUpdate={updateTodayInventory}
              total={queensTotal}
              colorClass="bg-blue-100"
              borderClass="border-blue-200"
            />

            <CategoryCard
              title="VIKG"
              icon={<Bed className="w-5 h-5 text-purple-600" />}
              codes={ROOM_CODES.VIKG}
              inventory={todayInventory}
              onUpdate={updateTodayInventory}
              total={vikgTotal}
              colorClass="bg-purple-100"
              borderClass="border-purple-200"
            />

            <CategoryCard
              title="SUITES"
              icon={<Crown className="w-5 h-5 text-amber-600" />}
              codes={ROOM_CODES.SUITES}
              inventory={todayInventory}
              onUpdate={updateTodayInventory}
              total={suitesTotal}
              colorClass="bg-amber-100"
              borderClass="border-amber-200"
            />
          </div>

          {/* Grand Total */}
          <div className="bg-slate-900 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 uppercase tracking-wider">Grand Total Available</div>
                <div className="text-lg text-slate-300 mt-1">{formatDisplayDate(currentDate)}</div>
              </div>
              <div className="text-5xl font-bold tabular-nums">{grandTotal}</div>
            </div>
          </div>
        </>
      )}

      {/* Tomorrow's Inventory Grid (Night Audit Set 2) */}
      {isAuditMode && auditSet === 2 && (
        <>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Next Day Availability — {formatDisplayDate(tomorrowDate)}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <CategoryCard
              title="KING"
              icon={<Bed className="w-5 h-5 text-emerald-600" />}
              codes={ROOM_CODES.KING}
              inventory={tomorrowInventory}
              onUpdate={updateTomorrowInventory}
              total={tomorrowKingTotal}
              colorClass="bg-emerald-100"
              borderClass="border-emerald-200"
            />

            <CategoryCard
              title="QUEENS"
              icon={<BedDouble className="w-5 h-5 text-blue-600" />}
              codes={ROOM_CODES.QUEENS}
              inventory={tomorrowInventory}
              onUpdate={updateTomorrowInventory}
              total={tomorrowQueensTotal}
              colorClass="bg-blue-100"
              borderClass="border-blue-200"
            />

            <CategoryCard
              title="VIKG"
              icon={<Bed className="w-5 h-5 text-purple-600" />}
              codes={ROOM_CODES.VIKG}
              inventory={tomorrowInventory}
              onUpdate={updateTomorrowInventory}
              total={tomorrowVikgTotal}
              colorClass="bg-purple-100"
              borderClass="border-purple-200"
            />

            <CategoryCard
              title="SUITES"
              icon={<Crown className="w-5 h-5 text-amber-600" />}
              codes={ROOM_CODES.SUITES}
              inventory={tomorrowInventory}
              onUpdate={updateTomorrowInventory}
              total={tomorrowSuitesTotal}
              colorClass="bg-amber-100"
              borderClass="border-amber-200"
            />
          </div>

          {/* Grand Total */}
          <div className="bg-indigo-900 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-indigo-300 uppercase tracking-wider">Next Day Total Available</div>
                <div className="text-lg text-indigo-200 mt-1">{formatDisplayDate(tomorrowDate)}</div>
              </div>
              <div className="text-5xl font-bold tabular-nums">{tomorrowGrandTotal}</div>
            </div>
          </div>
        </>
      )}

      {/* Low Inventory Warning */}
      {grandTotal < 10 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Low Inventory Alert</p>
            <p className="text-sm text-red-700 mt-1">
              Total available rooms is below 10. Consider reviewing oversell risk and communicating with leadership.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}



