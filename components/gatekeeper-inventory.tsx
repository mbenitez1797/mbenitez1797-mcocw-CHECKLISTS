"use client"

import { useState } from "react"
import { useInventory, ROOM_CODES, type ShiftType } from "@/contexts/inventory-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Lock, Unlock, AlertTriangle, CheckCircle2, Monitor, Info } from "lucide-react"
import { SmartUpload } from "@/components/smart-upload"

interface GatekeeperInventoryProps {
  shift: ShiftType
  onUnlock?: () => void
}

export function GatekeeperInventory({ shift, onUnlock }: GatekeeperInventoryProps) {
  const {
    todayInventory,
    tomorrowInventory,
    updateTodayInventory,
    updateTomorrowInventory,
    unlockChecklist,
    isChecklistUnlocked,
    kingTotal,
    queensTotal,
    vikgTotal,
    viqnTotal,
    suitesTotal,
    grandTotal,
    nightAuditPhase,
    setNightAuditPhase,
    completeAuditAndRollover,
    tomorrowKingTotal,
    tomorrowQueensTotal,
    tomorrowVikgTotal,
    tomorrowViqnTotal,
    tomorrowSuitesTotal,
    tomorrowGrandTotal,
  } = useInventory()

  const [validationError, setValidationError] = useState<string | null>(null)
  const isUnlocked = isChecklistUnlocked(shift)

  const isNightAudit = shift === "Night"
  const isPhase2 = isNightAudit && nightAuditPhase === 2

  // For Night Audit Phase 2, we use tomorrow's inventory
  const currentInventory = isPhase2 ? tomorrowInventory : todayInventory
  const updateInventory = isPhase2 ? updateTomorrowInventory : updateTodayInventory

  const handleInputChange = (code: string, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value, 10)
    if (!isNaN(numValue)) {
      updateInventory(code, numValue)
    }
  }

  const validateAndUnlock = () => {
    // Check if at least some inventory has been entered
    const hasAnyData = Object.values(currentInventory).some(v => v > 0)

    if (!hasAnyData) {
      setValidationError("Please enter room availability before unlocking the checklist.")
      return
    }

    setValidationError(null)
    unlockChecklist(shift)
    onUnlock?.()
  }

  const handlePhase2Submit = () => {
    // Validate tomorrow's inventory
    const hasAnyData = Object.values(tomorrowInventory).some(v => v > 0)

    if (!hasAnyData) {
      setValidationError("Please enter tomorrow's availability before completing the audit.")
      return
    }

    setValidationError(null)
    completeAuditAndRollover()
  }

  // Room code groups
  const roomGroups = [
    {
      name: "KING Rooms",
      codes: ROOM_CODES.KING,
      description: "Standard king bed rooms",
      color: "border-blue-200 bg-blue-50/50",
    },
    {
      name: "QNQN Rooms",
      codes: ROOM_CODES.QUEENS,
      description: "Double queen bed rooms",
      color: "border-emerald-200 bg-emerald-50/50",
    },
    {
      name: "VIKG",
      codes: ROOM_CODES.VIKG,
      description: "View king rooms",
      color: "border-amber-200 bg-amber-50/50",
    },
    {
      name: "VIQN",
      codes: ROOM_CODES.VIQN,
      description: "View queen rooms",
      color: "border-cyan-200 bg-cyan-50/50",
    },
    {
      name: "SUIT",
      codes: ROOM_CODES.SUITES,
      description: "Suite accommodations",
      color: "border-purple-200 bg-purple-50/50",
    },
  ]

  // If already unlocked and not in Night Audit Phase 2 mode
  if (isUnlocked && !(isNightAudit && nightAuditPhase === 2)) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <Unlock className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-800">Inventory Submitted - Checklist Unlocked</h3>
            <p className="text-sm text-emerald-600">
              You can now complete the rest of your {shift} shift checklist.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t border-emerald-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700">{kingTotal}</div>
            <div className="text-xs text-emerald-600">KING</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700">{queensTotal}</div>
            <div className="text-xs text-emerald-600">QNQN</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700">{vikgTotal}</div>
            <div className="text-xs text-emerald-600">VIKG</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700">{viqnTotal}</div>
            <div className="text-xs text-emerald-600">VIQN</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700">{suitesTotal}</div>
            <div className="text-xs text-emerald-600">SUIT</div>
          </div>
        </div>
        {isNightAudit && (
          <div className="mt-4 pt-4 border-t border-emerald-200">
            <Button
              variant="outline"
              onClick={() => setNightAuditPhase(2)}
              className="w-full"
            >
              Proceed to Post-Audit (Phase 2)
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Night Audit Phase 2 UI
  if (isNightAudit && nightAuditPhase === 2) {
    return (
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-indigo-800">Phase 2: Post-Audit Tomorrow&apos;s Availability</h3>
            <p className="text-sm text-indigo-600">
              Enter tomorrow&apos;s room availability after the night audit is complete.
            </p>
          </div>
        </div>

        {/* Smart Upload Section for Tomorrow */}
        <SmartUpload isForTomorrow={true} />

        {/* Manual Input Section */}
        <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <Monitor className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-700">
            <strong>Manual Entry:</strong> Or enter tomorrow&apos;s room codes directly from <strong>StayPMS</strong>
          </p>
        </div>

        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{validationError}</p>
          </div>
        )}

        {/* Room Code Inputs */}
        <div className="space-y-4 mb-6">
          {roomGroups.map((group) => (
            <div key={group.name} className={cn("border rounded-lg p-4", group.color)}>
              <div className="mb-3">
                <h4 className="font-medium text-slate-700">{group.name}</h4>
                <p className="text-xs text-slate-500">{group.description}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {group.codes.map((code) => (
                  <div key={code}>
                    <Label htmlFor={`tomorrow-${code}`} className="text-xs font-mono text-slate-500">
                      {code}
                    </Label>
                    <Input
                      id={`tomorrow-${code}`}
                      type="number"
                      value={tomorrowInventory[code] || ""}
                      onChange={(e) => handleInputChange(code, e.target.value)}
                      className="mt-1 text-center font-semibold"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tomorrow's Totals */}
        <div className="grid grid-cols-6 gap-4 mb-6 p-4 bg-white rounded-lg border border-indigo-200">
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-700">{tomorrowKingTotal}</div>
            <div className="text-xs text-slate-500">KING</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-700">{tomorrowQueensTotal}</div>
            <div className="text-xs text-slate-500">QNQN</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-700">{tomorrowVikgTotal}</div>
            <div className="text-xs text-slate-500">VIKG</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-700">{tomorrowViqnTotal}</div>
            <div className="text-xs text-slate-500">VIQN</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-700">{tomorrowSuitesTotal}</div>
            <div className="text-xs text-slate-500">SUIT</div>
          </div>
          <div className="text-center border-l border-indigo-200">
            <div className="text-xl font-bold text-indigo-900">{tomorrowGrandTotal}</div>
            <div className="text-xs text-slate-500">TOTAL</div>
          </div>
        </div>

        <Button
          onClick={handlePhase2Submit}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
          size="lg"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Complete Audit & Roll Over Date
        </Button>

        <p className="text-xs text-center text-indigo-600 mt-3">
          This will set tomorrow&apos;s date as the new &quot;Today&quot; and reset the shift cycle.
        </p>
      </div>
    )
  }

  // Default locked state - inventory input required
  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <Lock className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-800">Step 1: Submit Room Inventory</h3>
          <p className="text-sm text-amber-600">
            Enter current room availability to unlock the {shift} checklist.
          </p>
        </div>
      </div>

      {/* Smart Upload Section */}
      <SmartUpload isForTomorrow={false} />

      {/* Manual Input Section */}
      <div className="bg-white border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
        <Monitor className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700">
          <strong>Manual Entry:</strong> Or enter room codes directly from <strong>StayPMS</strong> → Dashboard → Room Types (Filter: Available)
        </p>
      </div>

      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{validationError}</p>
        </div>
      )}

      {/* Room Code Inputs */}
      <div className="space-y-4 mb-6">
        {roomGroups.map((group) => (
          <div key={group.name} className={cn("border rounded-lg p-4", group.color)}>
            <div className="mb-3">
              <h4 className="font-medium text-slate-700">{group.name}</h4>
              <p className="text-xs text-slate-500">{group.description}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {group.codes.map((code) => (
                <div key={code}>
                  <Label htmlFor={code} className="text-xs font-mono text-slate-500">
                    {code}
                  </Label>
                  <Input
                    id={code}
                    type="number"
                    value={currentInventory[code] || ""}
                    onChange={(e) => handleInputChange(code, e.target.value)}
                    className="mt-1 text-center font-semibold"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Calculated Totals */}
      <div className="grid grid-cols-6 gap-4 mb-6 p-4 bg-white rounded-lg border border-amber-200">
        <div className="text-center">
          <div className="text-xl font-bold text-amber-700">{kingTotal}</div>
          <div className="text-xs text-slate-500">KING</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-amber-700">{queensTotal}</div>
          <div className="text-xs text-slate-500">QNQN</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-amber-700">{vikgTotal}</div>
          <div className="text-xs text-slate-500">VIKG</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-amber-700">{viqnTotal}</div>
          <div className="text-xs text-slate-500">VIQN</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-amber-700">{suitesTotal}</div>
          <div className="text-xs text-slate-500">SUIT</div>
        </div>
        <div className="text-center border-l border-amber-200">
          <div className="text-xl font-bold text-amber-900">{grandTotal}</div>
          <div className="text-xs text-slate-500">TOTAL</div>
        </div>
      </div>

      {/* Low Inventory Warning */}
      {grandTotal > 0 && grandTotal < 10 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            <strong>Low Inventory Warning:</strong> Total available rooms ({grandTotal}) is below threshold.
          </p>
        </div>
      )}

      <Button
        onClick={validateAndUnlock}
        className="w-full bg-amber-600 hover:bg-amber-700"
        size="lg"
      >
        <Unlock className="w-4 h-4 mr-2" />
        Submit & Unlock Checklist
      </Button>

      <p className="text-xs text-center text-amber-600 mt-3 flex items-center justify-center gap-1">
        <Info className="w-3 h-3" />
        Complete this step to unlock the rest of the {shift} checklist
      </p>
    </div>
  )
}



