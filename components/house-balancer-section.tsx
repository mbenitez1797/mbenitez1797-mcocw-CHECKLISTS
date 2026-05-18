"use client"

import { MonthForecastDashboardV2 } from "@/components/month-forecast-dashboard-v2"

interface HouseBalancerSectionProps {
  onBalanceComplete?: () => void
}

export function HouseBalancerSection({ onBalanceComplete }: HouseBalancerSectionProps) {
  return <MonthForecastDashboardV2 compact onForecastApplied={onBalanceComplete} />
}
