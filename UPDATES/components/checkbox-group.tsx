"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { HelpTooltip } from "@/components/help-tooltip"
import { getInstructions } from "@/lib/pms-instructions"

export type SystemType = 
  | "StayPMS" 
  | "GXP" 
  | "GPS" 
  | "EmpowerResApp" 
  | "MGS" 
  | "PaymentDevice" 
  | "KeyEncoder" 
  | "MobileKey"

export interface CheckboxOption {
  id: string
  label: string
  system?: SystemType
}

interface CheckboxGroupProps {
  label: string
  helpText?: string
  options: (string | CheckboxOption)[]
  value: string[]
  onChange: (value: string[]) => void
  showHelp?: boolean
}

const systemBadges: Record<SystemType, { label: string; color: string }> = {
  StayPMS: { label: "Stay PMS", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  GXP: { label: "GXP", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  GPS: { label: "GPS", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  EmpowerResApp: { label: "Empower", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  MGS: { label: "MGS/ServiceNow", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  PaymentDevice: { label: "Payment Device", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  KeyEncoder: { label: "Key Encoder", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" },
  MobileKey: { label: "Mobile Key", color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" },
}

export function SystemBadge({ system }: { system: SystemType }) {
  const badge = systemBadges[system]
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${badge.color}`}>
      {badge.label}
    </span>
  )
}

export function CheckboxGroup({ 
  label, 
  helpText, 
  options, 
  value, 
  onChange,
  showHelp = true 
}: CheckboxGroupProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue])
    } else {
      onChange(value.filter((v) => v !== optionValue))
    }
  }

  // Normalize options to always be objects
  const normalizedOptions: CheckboxOption[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { id: opt, label: opt }
    }
    return opt
  })

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {helpText && <p className="mt-1 text-xs text-muted-foreground">{helpText}</p>}
      </div>
      <div className="flex flex-col gap-2">
        {normalizedOptions.map((option) => (
          <div
            key={option.id}
            className="flex items-start gap-3 rounded-md p-2 -mx-2 hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              id={option.id}
              checked={value.includes(option.label)}
              onCheckedChange={(checked) => handleChange(option.label, checked as boolean)}
              className="mt-0.5"
            />
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <label
                  htmlFor={option.id}
                  className="text-sm text-foreground leading-relaxed cursor-pointer"
                >
                  {option.label}
                </label>
                {option.system && <SystemBadge system={option.system} />}
              </div>
            </div>
            {showHelp && (
              <HelpTooltip 
                instructions={getInstructions(option.id)} 
                title={option.label}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}



