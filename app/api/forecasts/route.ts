import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const roomType = searchParams.get('roomType')

    let query = supabase
      .from('housekeeping_forecasts')
      .select('*')
      .order('forecast_date', { ascending: true })
      .order('room_type_name', { ascending: true })

    if (startDate) {
      query = query.gte('forecast_date', startDate)
    }
    
    if (endDate) {
      query = query.lte('forecast_date', endDate)
    }
    
    if (roomType) {
      query = query.eq('room_type_name', roomType)
    }

    const { data, error } = await query

    if (error) {
      console.error('[v0] Forecasts fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch forecasts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[v0] Forecasts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forecasts' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'No ID provided' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('housekeeping_forecasts')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete forecast' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete forecast' },
      { status: 500 }
    )
  }
}
