"use client"

import { Building2 } from "lucide-react"
import { MonthForecastDashboard } from "@/components/month-forecast-dashboard"

export default function AvailabilityPage() {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Building2 className="h-8 w-8 text-slate-700" />
          <h1 className="text-3xl font-bold text-foreground">Room Availability</h1>
        </div>
        <p className="text-muted-foreground">
          Single-report availability dashboard powered by the Month Housekeeping Forecast PDF.
        </p>
      </div>

      <MonthForecastDashboard />
    </div>
  )
}
