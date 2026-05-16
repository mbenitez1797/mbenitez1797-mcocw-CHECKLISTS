"use client"

import { HelpCircle } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface HelpTooltipProps {
  instructions: string[]
  title?: string
}

export function HelpTooltip({ instructions, title }: HelpTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors p-0.5 ml-1"
          aria-label="Help instructions"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 max-h-96 overflow-y-auto" 
        side="right" 
        align="start"
        sideOffset={8}
      >
        {title && (
          <h4 className="font-semibold text-sm mb-2 text-foreground">{title}</h4>
        )}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">StayNTouch PMS Instructions:</p>
          <ol className="list-decimal list-outside ml-4 space-y-1.5">
            {instructions.map((step, index) => (
              <li key={index} className="text-sm text-foreground leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </PopoverContent>
    </Popover>
  )
}



