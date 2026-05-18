"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// System badge types
export type SystemBadge = 
  | "Stay PMS"
  | "GXP"
  | "GPS"
  | "Empower ResApp"
  | "ResLink"
  | "CI/SFAWeb"
  | "OneSource"
  | "Amadeus CRS"
  | "MGS/ServiceNow"
  | "Rooms"
  | "Ledger"
  | "Reports"

const badgeColors: Record<SystemBadge, string> = {
  "Stay PMS": "bg-blue-100 text-blue-700 border-blue-200",
  "GXP": "bg-purple-100 text-purple-700 border-purple-200",
  "GPS": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Empower ResApp": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "ResLink": "bg-teal-100 text-teal-700 border-teal-200",
  "CI/SFAWeb": "bg-amber-100 text-amber-700 border-amber-200",
  "OneSource": "bg-orange-100 text-orange-700 border-orange-200",
  "Amadeus CRS": "bg-rose-100 text-rose-700 border-rose-200",
  "MGS/ServiceNow": "bg-red-100 text-red-700 border-red-200",
  "Rooms": "bg-green-100 text-green-700 border-green-200",
  "Ledger": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Reports": "bg-slate-100 text-slate-700 border-slate-200",
}

interface ChecklistTaskProps {
  id: string
  label: string
  instruction: string
  expandedInstruction?: string
  systems?: SystemBadge[]
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

export function ChecklistTask({
  id,
  label,
  instruction,
  expandedInstruction,
  systems = [],
  checked,
  onCheckedChange,
  disabled = false,
}: ChecklistTaskProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-colors",
        checked
          ? "bg-green-50 border-green-200"
          : "bg-card border-border hover:border-primary/30"
      )}
    >
      <input
        type="hidden"
        name={id}
        value={checked ? "true" : "false"}
        data-checklist-task-hidden="true"
        data-checklist-task-label={label}
      />
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className="mt-1 h-5 w-5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Label
              htmlFor={id}
              className={cn(
                "text-base font-medium cursor-pointer leading-tight",
                checked && "line-through text-muted-foreground"
              )}
            >
              {label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">More details</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-sm">
                  <p className="text-sm">{expandedInstruction || instruction}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* System badges */}
          {systems.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {systems.map((system) => (
                <span
                  key={system}
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                    badgeColors[system]
                  )}
                >
                  {system}
                </span>
              ))}
            </div>
          )}
          
          {/* Visible instruction */}
          <p
            className={cn(
              "text-sm text-muted-foreground mt-2 leading-relaxed",
              checked && "line-through"
            )}
          >
            <span className="font-medium text-foreground/70">How to complete:</span>{" "}
            {instruction}
          </p>
        </div>
      </div>
    </div>
  )
}

// Simplified form section with collapsible support
interface ChecklistSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function ChecklistSection({
  title,
  description,
  children,
  defaultOpen = true,
}: ChecklistSectionProps) {
  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
