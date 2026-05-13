import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    // Get summary by date
    let query = supabase
      .from('housekeeping_forecasts')
      .select('*')

    if (date) {
      query = query.eq('forecast_date', date)
    }

    const { data, error } = await query.order('forecast_date')

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
    }

    // Aggregate data by date
    const summaryByDate: Record<string, {
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
    }> = {}

    data?.forEach(forecast => {
      if (!summaryByDate[forecast.forecast_date]) {
        summaryByDate[forecast.forecast_date] = {
          date: forecast.forecast_date,
          totalArrivals: 0,
          totalArrivingGuests: 0,
          totalDepartures: 0,
          totalDepartingGuests: 0,
          totalStayOvers: 0,
          totalStayOverGuests: 0,
          totalOTM: 0,
          totalO00: 0,
          totalRoomsOnHold: 0,
          roomTypeCount: 0,
        }
      }

      const s = summaryByDate[forecast.forecast_date]
      s.totalArrivals += forecast.arrivals || 0
      s.totalArrivingGuests += forecast.arriving_guests || 0
      s.totalDepartures += forecast.departures || 0
      s.totalDepartingGuests += forecast.departing_guests || 0
      s.totalStayOvers += forecast.stay_overs || 0
      s.totalStayOverGuests += forecast.stay_over_guests || 0
      s.totalOTM += forecast.otm || 0
      s.totalO00 += forecast.o00 || 0
      s.totalRoomsOnHold += forecast.rooms_on_hold || 0
      s.roomTypeCount++
    })

    const summary = Object.values(summaryByDate).sort((a, b) => 
      a.date.localeCompare(b.date)
    )

    // Get unique room types
    const roomTypes = [...new Set(data?.map(f => f.room_type_name) || [])]

    // Get unique dates
    const dates = [...new Set(data?.map(f => f.forecast_date) || [])].sort()

    return NextResponse.json({
      summary,
      roomTypes,
      dates,
      totalRecords: data?.length || 0,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
  }
}
