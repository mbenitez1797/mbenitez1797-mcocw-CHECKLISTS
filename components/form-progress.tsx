"use client"

import { cn } from "@/lib/utils"

interface FormProgressProps {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
}

export function FormProgress({ currentStep, totalSteps, stepLabels }: FormProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border pb-4 pt-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">{stepLabels[currentStep]}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {stepLabels.map((label, index) => (
          <button
            key={`step-${index}-${label}`}
            type="button"
            onClick={() => {}}
            className={cn(
              "text-xs transition-colors hidden sm:block",
              index === currentStep
                ? "text-primary font-medium"
                : index < currentStep
                ? "text-muted-foreground"
                : "text-muted-foreground/50"
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  )
}



