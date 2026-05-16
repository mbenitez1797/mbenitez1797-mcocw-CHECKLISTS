"use client"

import { MonthForecastDashboard } from "@/components/month-forecast-dashboard"

interface HouseBalancerSectionProps {
  onBalanceComplete?: () => void
}

export function HouseBalancerSection({ onBalanceComplete }: HouseBalancerSectionProps) {
  return <MonthForecastDashboard compact onForecastApplied={onBalanceComplete} />
}
