import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { HousekeepingForecast, UploadResult } from '@/lib/types'

interface ParsedData {
  forecasts: HousekeepingForecast[]
  propertyName?: string
  startDate?: string
  endDate?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const parsedDataStr = formData.get('parsedData') as string | null

    if (!file && !parsedDataStr) {
      return NextResponse.json(
        { error: 'No file or data provided' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Create upload log entry
    const { data: uploadLog, error: uploadError } = await supabase
      .from('upload_logs')
      .insert({
        filename: file?.name || 'direct-upload',
        status: 'processing',
      })
      .select()
      .single()

    if (uploadError) {
      console.error('[v0] Upload log error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to create upload log' },
        { status: 500 }
      )
    }

    let forecasts: HousekeepingForecast[] = []
    
    if (parsedDataStr) {
      const parsedData: ParsedData = JSON.parse(parsedDataStr)
      forecasts = parsedData.forecasts
    }

    const result: UploadResult = {
      success: true,
      uploadId: uploadLog.id,
      recordsProcessed: forecasts.length,
      recordsInserted: 0,
      recordsUpdated: 0,
      errors: [],
      newDatesAdded: [],
    }

    const existingDates = new Set<string>()
    const newDates = new Set<string>()

    // Get existing dates for comparison
    const { data: existingForecasts } = await supabase
      .from('housekeeping_forecasts')
      .select('forecast_date')
      .order('forecast_date')

    if (existingForecasts) {
      existingForecasts.forEach(f => existingDates.add(f.forecast_date))
    }

    // Process each forecast record
    for (const forecast of forecasts) {
      try {
        // Check if this date/room type combo exists
        const { data: existing } = await supabase
          .from('housekeeping_forecasts')
          .select('id')
          .eq('forecast_date', forecast.forecast_date)
          .eq('room_type_name', forecast.room_type_name)
          .single()

        if (existing) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('housekeeping_forecasts')
            .update({
              arrivals: forecast.arrivals,
              arriving_guests: forecast.arriving_guests,
              departures: forecast.departures,
              departing_guests: forecast.departing_guests,
              stay_overs: forecast.stay_overs,
              stay_over_guests: forecast.stay_over_guests,
              otm: forecast.otm,
              o00: forecast.o00,
              rooms_on_hold: forecast.rooms_on_hold,
              source_file: file?.name || 'direct-upload',
              upload_id: uploadLog.id,
            })
            .eq('id', existing.id)

          if (updateError) {
            result.errors.push(`Failed to update ${forecast.room_type_name} on ${forecast.forecast_date}: ${updateError.message}`)
          } else {
            result.recordsUpdated++
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('housekeeping_forecasts')
            .insert({
              forecast_date: forecast.forecast_date,
              room_type_name: forecast.room_type_name,
              arrivals: forecast.arrivals,
              arriving_guests: forecast.arriving_guests,
              departures: forecast.departures,
              departing_guests: forecast.departing_guests,
              stay_overs: forecast.stay_overs,
              stay_over_guests: forecast.stay_over_guests,
              otm: forecast.otm,
              o00: forecast.o00,
              rooms_on_hold: forecast.rooms_on_hold,
              source_file: file?.name || 'direct-upload',
              upload_id: uploadLog.id,
            })

          if (insertError) {
            result.errors.push(`Failed to insert ${forecast.room_type_name} on ${forecast.forecast_date}: ${insertError.message}`)
          } else {
            result.recordsInserted++
            
            // Track new dates
            if (!existingDates.has(forecast.forecast_date)) {
              newDates.add(forecast.forecast_date)
            }
          }
        }
      } catch (err) {
        result.errors.push(`Error processing forecast: ${err}`)
      }
    }

    result.newDatesAdded = Array.from(newDates).sort()

    // Update upload log with results
    await supabase
      .from('upload_logs')
      .update({
        records_processed: result.recordsProcessed,
        records_inserted: result.recordsInserted,
        records_updated: result.recordsUpdated,
        status: result.errors.length > 0 ? 'completed' : 'completed',
        error_message: result.errors.length > 0 ? result.errors.join('; ') : null,
      })
      .eq('id', uploadLog.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process upload', details: String(error) },
      { status: 500 }
    )
  }
}
