import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all upload logs to establish baseline
    const { data: uploads, error: uploadError } = await supabase
      .from('upload_logs')
      .select('*')
      .order('upload_date', { ascending: false })
      .limit(2)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Compare current state with previous state
    const reconciliationDetails: any[] = []
    let recordsMatched = 0
    let recordsUpdated = 0

    if (uploads && uploads.length >= 2) {
      const currentUpload = uploads[0]
      const previousUpload = uploads[1]

      // Fetch forecasts for comparison
      const { data: currentForecasts } = await supabase
        .from('housekeeping_forecasts')
        .select('*')
        .eq('upload_id', currentUpload.id)

      const { data: previousForecasts } = await supabase
        .from('housekeeping_forecasts')
        .select('*')
        .eq('upload_id', previousUpload.id)

      // Compare records
      currentForecasts?.forEach((current) => {
        const previous = previousForecasts?.find(
          (p) => p.forecast_date === current.forecast_date && p.room_type_name === current.room_type_name
        )

        if (previous) {
          const changes: any = {}
          let hasChanges = false

          const fieldsToCompare = [
            'arrivals',
            'arriving_guests',
            'departures',
            'departing_guests',
            'stay_overs',
            'stay_over_guests',
            'otm',
            'o00',
            'rooms_on_hold',
          ]

          fieldsToCompare.forEach((field) => {
            if (current[field as keyof typeof current] !== previous[field as keyof typeof previous]) {
              changes[field] = {
                previous: previous[field as keyof typeof previous],
                current: current[field as keyof typeof current],
              }
              hasChanges = true
            }
          })

          if (hasChanges) {
            reconciliationDetails.push({
              date: current.forecast_date,
              roomType: current.room_type_name,
              previousValues: previous,
              newValues: current,
              changes,
              reconciled: Object.keys(changes).length === 0,
            })
            recordsUpdated++
          } else {
            recordsMatched++
          }
        }
      })
    }

    return NextResponse.json({
      totalRecordsReviewed: uploads?.[0]?.records_processed || 0,
      recordsMatched,
      recordsUpdated,
      recordsNeedingReview: Math.max(0, (uploads?.[0]?.records_processed || 0) - recordsMatched - recordsUpdated),
      reconciliationDetails: reconciliationDetails.slice(0, 20),
    })
  } catch (error) {
    console.error('[v0] Reconciliation route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
