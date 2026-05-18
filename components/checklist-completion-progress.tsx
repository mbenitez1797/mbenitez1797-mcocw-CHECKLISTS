"use client"

import { cn } from "@/lib/utils"

interface ChecklistCompletionProgressProps {
  title: string
  completed: number
  total: number
}

export function ChecklistCompletionProgress({ title, completed, total }: ChecklistCompletionProgressProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-900">
            {title} - {percent}% complete
          </p>
          <p className="text-xs text-blue-700">
            {completed} of {total} tasks completed
          </p>
        </div>
        <span className="text-sm font-bold text-blue-700">{percent}%</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white border border-blue-100">
        <div
          className={cn("h-full rounded-full bg-blue-600 transition-all duration-300")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

