"use client"

import { useEffect, useMemo, useState } from "react"
import { useInventory, formatDisplayDate } from "@/contexts/inventory-context"
import { cn } from "@/lib/utils"
import {
  buildSmartBalancerSuggestions,
  clearSavedForecast,
  FIXED_ROOM_CODES,
  loadSavedForecast,
  parseMonthForecastText,
  recalculateParsedForecast,
  saveForecast,
  TOTAL_PROPERTY_INVENTORY,
  type ForecastDay,
  type ParsedForecast,
} from "@/lib/month-forecast"
import { Building2, BedDouble, Crown, Sparkles, Calendar, Clock, AlertTriangle, CheckCircle2, ArrowDownToLine, ArrowUpFromLine, Home, Percent, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AvailabilityPage() {
  const [forecast, setForecast] = useState<ParsedForecast | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [parserMessage, setParserMessage] = useState("")
  const [isParsing, setIsParsing] = useState(false)

  const {
    currentDate,
    currentShift,
    isAuditMode,
  } = useInventory()

  useEffect(() => {
    const saved = loadSavedForecast()
    setForecast(saved)
    setSelectedDate(saved?.days[0]?.date || "")
  }, [])

  const selectedDay = useMemo<ForecastDay | null>(() => {
    return forecast?.days.find((day) => day.date === selectedDate) || forecast?.days[0] || null
  }, [forecast, selectedDate])

  const nextForecastDay = useMemo<ForecastDay | null>(() => {
    if (!forecast?.days.length || !selectedDay) return null
    const selectedIndex = forecast.days.findIndex((day) => day.date === selectedDay.date)
    return selectedIndex >= 0 ? forecast.days[selectedIndex + 1] || null : null
  }, [forecast, selectedDay])

  const smartSuggestions = useMemo(() => {
    return forecast && selectedDay ? buildSmartBalancerSuggestions(forecast.days, selectedDay.date) : []
  }, [forecast, selectedDay])

  const handleForecastUpload = async (file: File | null) => {
    if (!file) return

    setIsParsing(true)
    setParserMessage("")

    try {
      const text = await file.text()
      const parsed = recalculateParsedForecast(parseMonthForecastText(text, file.name))

      if (!parsed.days.length) {
        parsed.warnings.push("OCR fallback is not configured in this deployment. Upload a PDF with selectable text or export the Month Housekeeping Forecast to text/CSV.")
      }

      saveForecast(parsed)
      setForecast(parsed)
      setSelectedDate(parsed.days[0]?.date || "")
      setParserMessage(parsed.days.length ? `Parsed ${parsed.days.length} forecast date(s).` : "No forecast dates were parsed.")
    } catch (error) {
      setParserMessage(error instanceof Error ? error.message : "Forecast parsing failed.")
    } finally {
      setIsParsing(false)
    }
  }

  const handleClearForecast = () => {
    clearSavedForecast()
    setForecast(null)
    setSelectedDate("")
    setParserMessage("Saved forecast cleared.")
  }

  const categories = [
    {
      name: "KING",
      icon: BedDouble,
      today: selectedDay?.rooms.KING.available ?? 0,
      tomorrow: nextForecastDay?.rooms.KING.available ?? 0,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      codes: Object.entries(FIXED_ROOM_CODES.KING),
    },
    {
      name: "QNQN",
      icon: BedDouble,
      today: selectedDay?.rooms.QNQN.available ?? 0,
      tomorrow: nextForecastDay?.rooms.QNQN.available ?? 0,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      codes: Object.entries(FIXED_ROOM_CODES.QNQN),
    },
    {
      name: "VIKG",
      icon: Crown,
      today: selectedDay?.rooms.VIKG.available ?? 0,
      tomorrow: nextForecastDay?.rooms.VIKG.available ?? 0,
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      codes: Object.entries(FIXED_ROOM_CODES.VIKG),
    },
    {
      name: "VIQN",
      icon: BedDouble,
      today: selectedDay?.rooms.VIQN.available ?? 0,
      tomorrow: nextForecastDay?.rooms.VIQN.available ?? 0,
      color: "bg-cyan-500",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-700",
      codes: Object.entries(FIXED_ROOM_CODES.VIQN),
    },
    {
      name: "SUIT",
      icon: Sparkles,
      today: selectedDay?.rooms.SUIT.available ?? 0,
      tomorrow: nextForecastDay?.rooms.SUIT.available ?? 0,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      codes: Object.entries(FIXED_ROOM_CODES.SUIT),
    },
  ]

  const displayGrandTotal = selectedDay?.available ?? 0
  const displayArrivals = selectedDay?.arrivals ?? 0
  const displayDepartures = selectedDay?.departures ?? 0
  const displayStayovers = selectedDay?.stayovers ?? 0
  const displayOccupancy = selectedDay ? `${selectedDay.occupancy}%` : "0%"
  const isLowInventory = displayGrandTotal < 10
  const hasData = Boolean(selectedDay)

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-slate-700" />
          <h1 className="text-3xl font-bold text-foreground">Room Availability</h1>
        </div>
        <p className="text-muted-foreground">
          Month Housekeeping Forecast parser and fixed-inventory availability dashboard
        </p>
      </div>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Month Housekeeping Forecast</h2>
            <p className="text-sm text-slate-500">
              Upload the forecast PDF. Availability is calculated from {TOTAL_PROPERTY_INVENTORY} fixed rooms minus arrivals plus stayovers; departures display only.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Upload className="mr-2 h-4 w-4" />
              {isParsing ? "Parsing..." : "Upload Forecast"}
              <input
                type="file"
                accept=".pdf,.txt,.csv"
                className="sr-only"
                onChange={(event) => handleForecastUpload(event.target.files?.[0] || null)}
              />
            </label>
            <Button type="button" variant="outline" size="sm" onClick={handleClearForecast}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear saved forecast
            </Button>
          </div>
        </div>

        {parserMessage && <p className="mt-3 text-sm text-slate-600">{parserMessage}</p>}
        {forecast?.warnings?.length ? (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {forecast.warnings.slice(0, 2).join(" ")}
          </div>
        ) : null}

        {forecast?.days?.length ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Selected date</span>
            <select
              value={selectedDay?.date || ""}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {forecast.days.map((day) => (
                <option key={day.date} value={day.date}>{day.label}</option>
              ))}
            </select>
            <span className="text-xs text-slate-500">Parsed {new Date(forecast.parsedAt).toLocaleString()}</span>
          </div>
        ) : null}
      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">
            {selectedDay?.label || formatDisplayDate(currentDate)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className={cn(
            "px-2 py-0.5 rounded text-xs font-semibold",
            currentShift === "AM" && "bg-amber-100 text-amber-800",
            currentShift === "PM" && "bg-orange-100 text-orange-800",
            currentShift === "Night" && "bg-indigo-100 text-indigo-800",
          )}>
            {currentShift} Shift
          </span>
          {isAuditMode && (
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
              Audit Mode
            </span>
          )}
        </div>
        {forecast?.parsedAt && (
          <div className="text-xs text-slate-500">
            Forecast parsed: {new Date(forecast.parsedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
        {hasData ? (
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Forecast loaded
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="w-3.5 h-3.5" />
            No forecast loaded
          </div>
        )}
      </div>

      {/* Occupancy Banner */}
      {displayOccupancy && displayOccupancy !== "0%" && (
        <div className="mb-6 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">Current Occupancy</span>
          </div>
          <div className="text-6xl font-bold mb-4">{displayOccupancy}</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
                <ArrowDownToLine className="w-4 h-4" />
                Arrivals
              </div>
              <div className="text-2xl font-bold">{displayArrivals}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
                <ArrowUpFromLine className="w-4 h-4" />
                Departures
              </div>
              <div className="text-2xl font-bold">{displayDepartures}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
                <Home className="w-4 h-4" />
                Stayovers
              </div>
              <div className="text-2xl font-bold">{displayStayovers}</div>
            </div>
          </div>
        </div>
      )}

      {/* Low Inventory Warning */}
      {isLowInventory && hasData && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Low Inventory Alert</p>
            <p className="text-sm text-red-700">
              Total available rooms ({displayGrandTotal}) is below threshold. Consider stop-sell or rate adjustments.
            </p>
          </div>
        </div>
      )}

      {/* Grand Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Today */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-700">Today</h2>
            <span className="text-sm text-slate-500">{formatDisplayDate(currentDate)}</span>
          </div>
          <div className="text-center py-6">
            <div className={cn(
              "text-7xl font-bold mb-2",
              isLowInventory && hasData ? "text-red-600" : "text-slate-900"
            )}>
              {displayGrandTotal}
            </div>
            <p className="text-slate-500 text-sm">Total Available Rooms</p>
          </div>
        </div>

        {/* Tomorrow */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-500">Next Forecast Date</h2>
            <span className="text-sm text-slate-400">{nextForecastDay?.label || "No next date"}</span>
          </div>
          <div className="text-center py-6">
            <div className="text-7xl font-bold text-slate-400 mb-2">
              {nextForecastDay?.available ?? 0}
            </div>
            <p className="text-slate-400 text-sm">Total Available Rooms</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Breakdown by Room Type</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <div key={cat.name} className={cn("rounded-xl p-5 border-2", cat.bgColor, "border-transparent")}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cat.color)}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className={cn("font-semibold", cat.textColor)}>{cat.name}</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className={cn("text-4xl font-bold", cat.today < 0 ? "text-red-600" : cat.today === 0 ? "text-amber-600" : cat.textColor)}>{cat.today}</div>
                  <p className="text-xs text-slate-500 mt-1">Today</p>
                </div>
                <div className="text-right">
                  <div className={cn("text-2xl font-semibold", cat.tomorrow < 0 ? "text-red-500" : cat.tomorrow === 0 ? "text-amber-500" : "text-slate-400")}>{cat.tomorrow}</div>
                  <p className="text-xs text-slate-400 mt-1">Tomorrow</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-700">Smart Balancer</h3>
            <p className="text-xs text-slate-500">Selected date plus next 2 nights</p>
          </div>
          {selectedDay?.oversold ? (
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Oversold</span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">No shortage</span>
          )}
        </div>

        {smartSuggestions.length ? (
          <div className="space-y-3">
            {smartSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <div className="font-medium text-blue-900">
                  Move {suggestion.moveCount} for {suggestion.losNights} nights: {suggestion.from} to {suggestion.to}
                </div>
                <div className="mt-1 text-sm text-blue-800">
                  Dates helped: {suggestion.datesHelped.join(", ")}. Target open count: {suggestion.targetOpenCount}. Remaining unresolved shortages: {suggestion.remainingUnresolvedShortages}.
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No Smart Balancer moves are currently available from the parsed forecast data.</p>
        )}
      </div>

      {/* Room Code Details */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-slate-700">Room Code Details</h3>
          <p className="text-xs text-slate-500 mt-1">Fixed room-code inventory, shown for audit reference only</p>
        </div>
        <div className="divide-y divide-slate-100">
          {categories.map((cat) => (
            <div key={cat.name} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-2 h-2 rounded-full", cat.color)} />
                <span className="font-medium text-slate-700">{cat.name}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {cat.codes.map(([code, fixedTotal]) => (
                  <div key={code} className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-xs font-mono text-slate-500 mb-1">{code}</div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-slate-800">
                        {fixedTotal}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">fixed inventory</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 text-center text-sm text-slate-400">
        This is a read-only view. To update inventory, use the{" "}
        <span className="font-medium text-slate-600">Shift Inventory</span> page or complete your shift checklist.
      </div>
    </div>
  )
}



