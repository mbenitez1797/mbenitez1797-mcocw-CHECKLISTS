import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all forecasts with potential issues
    const { data: forecasts, error: forecastError } = await supabase
      .from('housekeeping_forecasts')
      .select('*')
      .order('forecast_date', { ascending: true })

    if (forecastError) {
      console.error('[v0] Error fetching forecasts:', forecastError)
      return NextResponse.json({ error: forecastError.message }, { status: 500 })
    }

    const issues: any[] = []
    const validationRules = [
      {
        name: 'Negative Values',
        check: (record: any) =>
          [
            'arrivals',
            'arriving_guests',
            'departures',
            'departing_guests',
            'stay_overs',
            'stay_over_guests',
            'otm',
            'o00',
            'rooms_on_hold',
          ].filter((field) => record[field] < 0),
        severity: 'error',
      },
      {
        name: 'Zero When Should Have Value',
        check: (record: any) => {
          const zeros = []
          if (record.arrivals === 0 && record.arriving_guests > 0) zeros.push('arrivals')
          if (record.departures === 0 && record.departing_guests > 0) zeros.push('departures')
          if (record.stay_overs === 0 && record.stay_over_guests > 0) zeros.push('stay_overs')
          return zeros
        },
        severity: 'warning',
      },
      {
        name: 'Guest Count Mismatch',
        check: (record: any) => {
          const mismatches = []
          if (record.arrivals > 0 && record.arriving_guests === 0) mismatches.push('arriving_guests')
          if (record.departures > 0 && record.departing_guests === 0) mismatches.push('departing_guests')
          if (record.stay_overs > 0 && record.stay_over_guests === 0) mismatches.push('stay_over_guests')
          return mismatches
        },
        severity: 'warning',
      },
      {
        name: 'Missing Room Type',
        check: (record: any) =>
          !record.room_type_name || record.room_type_name.trim() === '' ? ['room_type_name'] : [],
        severity: 'error',
      },
    ]

    // Run validation checks
    forecasts?.forEach((record, idx) => {
      validationRules.forEach((rule) => {
        const failedFields = rule.check(record)
        failedFields.forEach((field) => {
          issues.push({
            type: rule.severity,
            field,
            message: `${rule.name}: ${field}`,
            row: idx + 1,
            actualValue: record[field],
          })
        })
      })
    })

    const recordsWithIssues = new Set(issues.map((i) => i.row)).size

    return NextResponse.json({
      isValid: issues.length === 0,
      issues,
      recordsProcessed: forecasts?.length || 0,
      recordsValid: (forecasts?.length || 0) - recordsWithIssues,
      recordsWithIssues,
    })
  } catch (error) {
    console.error('[v0] Validation route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
