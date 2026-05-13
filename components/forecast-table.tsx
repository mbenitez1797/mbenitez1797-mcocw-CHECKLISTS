'use client'

import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ChevronDown, ChevronUp, Filter, Calendar, Trash2 } from 'lucide-react'
import type { HousekeepingForecast } from '@/lib/types'

interface ForecastTableProps {
  forecasts: HousekeepingForecast[]
  onDelete?: (id: string) => void
  isLoading?: boolean
}

type SortField = keyof HousekeepingForecast
type SortDirection = 'asc' | 'desc'

export function ForecastTable({ forecasts, onDelete, isLoading }: ForecastTableProps) {
  const [sortField, setSortField] = useState<SortField>('forecast_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filterDate, setFilterDate] = useState<string>('')
  const [filterRoomType, setFilterRoomType] = useState<string>('')

  const roomTypes = useMemo(() => {
    const types = new Set(forecasts.map(f => f.room_type_name))
    return Array.from(types).sort()
  }, [forecasts])

  const dates = useMemo(() => {
    const dateSet = new Set(forecasts.map(f => f.forecast_date))
    return Array.from(dateSet).sort()
  }, [forecasts])

  const filteredAndSorted = useMemo(() => {
    let result = [...forecasts]

    // Filter
    if (filterDate) {
      result = result.filter(f => f.forecast_date === filterDate)
    }
    if (filterRoomType) {
      result = result.filter(f => f.room_type_name === filterRoomType)
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      if (aVal === undefined || aVal === null) return 1
      if (bVal === undefined || bVal === null) return -1

      let comparison = 0
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal)
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [forecasts, filterDate, filterRoomType, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />
  }

  const formatDateDisplay = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (forecasts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No forecast data available</p>
        <p className="text-sm mt-1">Upload a report to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-3 py-1.5 text-sm border rounded-lg bg-background"
        >
          <option value="">All Dates</option>
          {dates.map(date => (
            <option key={date} value={date}>
              {formatDateDisplay(date)}
            </option>
          ))}
        </select>

        <select
          value={filterRoomType}
          onChange={(e) => setFilterRoomType(e.target.value)}
          className="px-3 py-1.5 text-sm border rounded-lg bg-background max-w-[250px]"
        >
          <option value="">All Room Types</option>
          {roomTypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {(filterDate || filterRoomType) && (
          <button
            onClick={() => { setFilterDate(''); setFilterRoomType('') }}
            className="text-sm text-primary hover:underline"
          >
            Clear filters
          </button>
        )}

        <span className="text-sm text-muted-foreground ml-auto">
          Showing {filteredAndSorted.length} of {forecasts.length} records
        </span>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th 
                  className="px-3 py-3 text-left font-medium cursor-pointer hover:bg-muted/70"
                  onClick={() => handleSort('forecast_date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <SortIcon field="forecast_date" />
                  </div>
                </th>
                <th 
                  className="px-3 py-3 text-left font-medium cursor-pointer hover:bg-muted/70"
                  onClick={() => handleSort('room_type_name')}
                >
                  <div className="flex items-center gap-1">
                    Room Type
                    <SortIcon field="room_type_name" />
                  </div>
                </th>
                <th 
                  className="px-3 py-3 text-right font-medium cursor-pointer hover:bg-muted/70"
                  onClick={() => handleSort('arrivals')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Arrivals
                    <SortIcon field="arrivals" />
                  </div>
                </th>
                <th 
                  className="px-3 py-3 text-right font-medium cursor-pointer hover:bg-muted/70"
                  onClick={() => handleSort('arriving_guests')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Arr. Guests
                    <SortIcon field="arriving_guests" />
                  </div>
                </th>
                <th 
                  className="px-3 py-3 text-right font-medium cursor-pointer hover:bg-muted/70"
                  onClick={() => handleSort('departures')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Departures
                    <SortIcon field="departures" />
                  </div>
                </th>
                <th 
                  className="px-3 py-3 text-right font-medium cursor-pointer hover:bg-muted/70"
                  onClick={() => handleSort('departing_guests')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Dep. Guests
                    <SortIcon field="departing_guests" />
                  </div>
                </th>
                <th 
                  className="px-3 py-3 text-right font-medium cursor-pointer hover:bg-muted/70"
                  onClick={() => handleSort('stay_overs')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Stay Overs
                    <SortIcon field="stay_overs" />
                  </div>
                </th>
                <th 
                  className="px-3 py-3 text-right font-medium cursor-pointer hover:bg-muted/70"
                  onClick={() => handleSort('stay_over_guests')}
                >
                  <div className="flex items-center justify-end gap-1">
                    SO Guests
                    <SortIcon field="stay_over_guests" />
                  </div>
                </th>
                <th className="px-3 py-3 text-right font-medium">OTM</th>
                <th className="px-3 py-3 text-right font-medium">O00</th>
                <th className="px-3 py-3 text-right font-medium">On Hold</th>
                {onDelete && <th className="px-3 py-3 w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAndSorted.map((forecast, index) => (
                <tr key={forecast.id || index} className="hover:bg-muted/30">
                  <td className="px-3 py-2 whitespace-nowrap font-medium">
                    {formatDateDisplay(forecast.forecast_date)}
                  </td>
                  <td className="px-3 py-2 max-w-[250px]" title={forecast.room_type_name}>
                    <span className="line-clamp-2">{forecast.room_type_name}</span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{forecast.arrivals}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{forecast.arriving_guests}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{forecast.departures}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{forecast.departing_guests}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{forecast.stay_overs}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{forecast.stay_over_guests}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{forecast.otm}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{forecast.o00}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{forecast.rooms_on_hold}</td>
                  {onDelete && forecast.id && (
                    <td className="px-3 py-2">
                      <button
                        onClick={() => onDelete(forecast.id!)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
