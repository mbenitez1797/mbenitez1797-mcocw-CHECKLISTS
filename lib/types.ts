export interface HousekeepingForecast {
  id?: string
  forecast_date: string
  room_type_id?: string
  room_type_name: string
  arrivals: number
  arriving_guests: number
  departures: number
  departing_guests: number
  stay_overs: number
  stay_over_guests: number
  otm: number
  o00: number
  rooms_on_hold: number
  source_file?: string
  upload_id?: string
  created_at?: string
  updated_at?: string
}

export interface RoomType {
  id: string
  code: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface UploadLog {
  id: string
  filename: string
  upload_date: string
  records_processed: number
  records_inserted: number
  records_updated: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
  raw_data?: Record<string, unknown>
  created_at?: string
}

export interface ParsedReportData {
  reportDate: string
  startDate: string
  endDate: string
  propertyName: string
  forecasts: HousekeepingForecast[]
}

export interface UploadResult {
  success: boolean
  uploadId: string
  recordsProcessed: number
  recordsInserted: number
  recordsUpdated: number
  errors: string[]
  newDatesAdded: string[]
}
