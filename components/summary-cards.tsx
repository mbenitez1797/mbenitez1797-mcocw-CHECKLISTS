'use client'

import { format, parseISO } from 'date-fns'
import { 
  Users, 
  LogIn, 
  LogOut, 
  Home,
  Calendar,
  TrendingUp
} from 'lucide-react'

interface DailySummary {
  date: string
  totalArrivals: number
  totalArrivingGuests: number
  totalDepartures: number
  totalDepartingGuests: number
  totalStayOvers: number
  totalStayOverGuests: number
  totalOTM: number
  totalO00: number
  totalRoomsOnHold: number
  roomTypeCount: number
}

interface SummaryCardsProps {
  summary: DailySummary[]
  selectedDate?: string
  onDateSelect?: (date: string) => void
}

export function SummaryCards({ summary, selectedDate, onDateSelect }: SummaryCardsProps) {
  if (summary.length === 0) {
    return null
  }

  // Calculate totals across all dates
  const totals = summary.reduce((acc, day) => ({
    arrivals: acc.arrivals + day.totalArrivals,
    arrivingGuests: acc.arrivingGuests + day.totalArrivingGuests,
    departures: acc.departures + day.totalDepartures,
    departingGuests: acc.departingGuests + day.totalDepartingGuests,
    stayOvers: acc.stayOvers + day.totalStayOvers,
    stayOverGuests: acc.stayOverGuests + day.totalStayOverGuests,
  }), {
    arrivals: 0,
    arrivingGuests: 0,
    departures: 0,
    departingGuests: 0,
    stayOvers: 0,
    stayOverGuests: 0,
  })

  const formatDateDisplay = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d')
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Total Days</span>
          </div>
          <p className="text-2xl font-bold">{summary.length}</p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <LogIn className="h-4 w-4" />
            <span className="text-sm font-medium">Total Arrivals</span>
          </div>
          <p className="text-2xl font-bold">{totals.arrivals}</p>
          <p className="text-sm text-muted-foreground">{totals.arrivingGuests} guests</p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Total Departures</span>
          </div>
          <p className="text-2xl font-bold">{totals.departures}</p>
          <p className="text-sm text-muted-foreground">{totals.departingGuests} guests</p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Home className="h-4 w-4" />
            <span className="text-sm font-medium">Total Stay Overs</span>
          </div>
          <p className="text-2xl font-bold">{totals.stayOvers}</p>
          <p className="text-sm text-muted-foreground">{totals.stayOverGuests} guests</p>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Daily Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {summary.map((day) => (
            <button
              key={day.date}
              onClick={() => onDateSelect?.(day.date)}
              className={`
                text-left p-4 border rounded-lg transition-all hover:shadow-md
                ${selectedDate === day.date 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                  : 'bg-card hover:border-primary/50'
                }
              `}
            >
              <div className="font-semibold mb-2">
                {formatDateDisplay(day.date)}
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Arr</p>
                  <p className="font-medium text-green-600">{day.totalArrivals}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dep</p>
                  <p className="font-medium text-red-600">{day.totalDepartures}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stay</p>
                  <p className="font-medium text-blue-600">{day.totalStayOvers}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {day.roomTypeCount} room types
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
