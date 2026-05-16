"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { AlertTriangle, ChevronLeft, ChevronRight, FileText, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useInventory } from "@/contexts/inventory-context"
import type { DailyInventorySnapshot } from "@/lib/daily-inventory"
import {
  FORECAST_ROOM_CODES,
  FORECAST_ROOM_GROUPS,
  FORECAST_ROOM_TOTAL,
  FORECAST_ROOM_TOTALS,
  parseMonthHousekeepingForecastText,
  type ForecastDay,
  type ForecastParseResult,
  type ForecastRoomGroup,
} from "@/lib/month-housekeeping-forecast"
import { parseRoomAvailabilityText, type RoomAvailabilityParseResult } from "@/lib/room-availability"

const STORAGE_KEY = "month-housekeeping-forecast-dashboard-v5"
const PARSE_ERROR = "Unable to parse housekeeping forecast. Please upload the Month Housekeeping Forecast PDF."
const AVAILABILITY_PARSE_ERROR = "Unable to parse Room Availability. Please upload the StayPMS Room Availability report."

function groupsSum() {
  return FORECAST_ROOM_GROUPS.reduce((sum, group) => sum + FORECAST_ROOM_TOTALS[group], 0)
}

function applyRoomAvailability(result: ForecastParseResult | null, availability: RoomAvailabilityParseResult | null): ForecastParseResult | null {
  if (!result || !availability?.days?.length) return result

  const availabilityByDate = new Map(availability.days.map((day) => [day.dateISO, day]))
  return {
    ...result,
    days: result.days.map((day) => {
      const availableDay = availabilityByDate.get(day.dateISO)
      if (!availableDay) return day

      const groups = { ...day.groups } as ForecastDay["groups"]
      FORECAST_ROOM_GROUPS.forEach((group) => {
        groups[group] = {
          ...groups[group],
          available: availableDay.groups[group],
        }
      })

      return {
        ...day,
        groups,
        totalAvailable: availableDay.totalAvailable,
        oversold: availableDay.totalAvailable < 0 || FORECAST_ROOM_GROUPS.some((group) => availableDay.groups[group] < 0),
      }
    }),
  }
}

function dayToSnapshot(day: ForecastDay, hasRoomAvailability: boolean): DailyInventorySnapshot {
  const rooms = hasRoomAvailability
    ? {
        KING: day.groups.KING.available,
        QUEEN: day.groups.QNQN.available,
        VIQN: day.groups.VIQN.available,
        VIKG: day.groups.VIKG.available,
        SUITES: day.groups.SUIT.available,
      }
    : {
        KING: 0,
        QUEEN: 0,
        VIQN: 0,
        VIKG: 0,
        SUITES: 0,
      }
  const available = hasRoomAvailability ? day.totalAvailable : 0

  return {
    dateLabel: day.dateISO,
    roomTotal: FORECAST_ROOM_TOTAL,
    available,
    committed: hasRoomAvailability ? FORECAST_ROOM_TOTAL - available : day.totalOccupied,
    arrivals: day.arrivals,
    departures: day.departures,
    stayovers: day.stayovers,
    occupancy: day.occupancy,
    oooOtm: "0/0",
    groupsRemaining: 0,
    guests: `${day.arrivingGuests} arriving, ${day.departingGuests} departing`,
    rooms,
    recommendations: day.oversold
      ? ["Oversold room availability detected. Review red values before assigning rooms."]
      : [hasRoomAvailability ? "Room Availability loaded. Bucket totals are sourced from StayPMS room-code availability." : "Month Housekeeping Forecast loaded. Upload Room Availability for actual bucket totals."],
    updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }
}

function formatDateLabel(dateISO: string) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function chunkWeeks(days: ForecastDay[]) {
  const weeks: ForecastDay[][] = []
  for (let index = 0; index < days.length; index += 7) weeks.push(days.slice(index, index + 7))
  return weeks
}

function availabilityClass(value: number) {
  return value < 0 ? "text-red-600 font-bold" : "text-slate-900"
}

function availabilityDisplay(value: number, hasAvailability: boolean) {
  return hasAvailability ? value : "-"
}

async function ocrDocumentFile(file: File, onProgress: (message: string) => void, parseError: string) {
  const tesseract = await import("tesseract.js")

  if (file.type.startsWith("image/")) {
    onProgress("Reading image...")
    const image = new Image()
    const url = URL.createObjectURL(file)
    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error(parseError))
        image.src = url
      })
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      if (!context) throw new Error(parseError)
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      context.drawImage(image, 0, 0)
      const result = await tesseract.recognize(canvas, "eng", {
        logger: (message: { status?: string; progress?: number }) => {
          if (!message.status) return
          const pct = message.progress ? ` ${Math.round(message.progress * 100)}%` : ""
          onProgress(`OCR image: ${message.status}${pct}`)
        },
      })
      return result.data.text || ""
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const pdfjs = await import("pdfjs-dist")

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString()

  const buffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buffer }).promise
  let text = ""

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    onProgress(`Reading page ${pageNum} of ${pdf.numPages}...`)
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 2.5 })
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) throw new Error(parseError)

    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: context, viewport }).promise

    const result = await tesseract.recognize(canvas, "eng", {
      logger: (message: { status?: string; progress?: number }) => {
        if (!message.status) return
        const pct = message.progress ? ` ${Math.round(message.progress * 100)}%` : ""
        onProgress(`OCR page ${pageNum}/${pdf.numPages}: ${message.status}${pct}`)
      },
    })
    text += `\n${result.data.text || ""}`
  }

  return text
}

type MonthForecastDashboardProps = {
  compact?: boolean
  onForecastApplied?: () => void
}

export function MonthForecastDashboard({ compact = false, onForecastApplied }: MonthForecastDashboardProps) {
  const { setDailyInventorySnapshot } = useInventory()
  const [result, setResult] = useState<ForecastParseResult | null>(null)
  const [availabilityResult, setAvailabilityResult] = useState<RoomAvailabilityParseResult | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [weekIndex, setWeekIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAvailabilityProcessing, setIsAvailabilityProcessing] = useState(false)
  const [progress, setProgress] = useState("")
  const [availabilityProgress, setAvailabilityProgress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [availabilityFileName, setAvailabilityFileName] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as {
        result: ForecastParseResult
        availabilityResult?: RoomAvailabilityParseResult
        selectedDate: string
        fileName: string
        availabilityFileName?: string
      }
      if (!parsed.result?.days?.length) return
      setResult(parsed.result)
      setAvailabilityResult(parsed.availabilityResult || null)
      setSelectedDate(parsed.selectedDate || parsed.result.days[0].dateISO)
      setFileName(parsed.fileName || "")
      setAvailabilityFileName(parsed.availabilityFileName || "")
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const displayResult = useMemo(() => applyRoomAvailability(result, availabilityResult), [availabilityResult, result])
  const weeks = useMemo(() => chunkWeeks(displayResult?.days || []), [displayResult])
  const visibleDays = weeks[weekIndex] || []
  const selectedDay = useMemo(
    () => displayResult?.days.find((day) => day.dateISO === selectedDate) || visibleDays[0] || null,
    [displayResult, selectedDate, visibleDays],
  )
  const availabilityByDate = useMemo(
    () => new Map((availabilityResult?.days || []).map((day) => [day.dateISO, day])),
    [availabilityResult],
  )
  const selectedHasAvailability = selectedDay ? availabilityByDate.has(selectedDay.dateISO) : false

  useEffect(() => {
    if (!selectedDay) return
    setDailyInventorySnapshot(dayToSnapshot(selectedDay, Boolean(availabilityResult?.days?.length)))
    onForecastApplied?.()
  }, [availabilityResult, onForecastApplied, selectedDay, setDailyInventorySnapshot])

  useEffect(() => {
    if (!result?.days?.length) return
    const day = result.days.find((item) => item.dateISO === selectedDate) || result.days[0]
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ result, availabilityResult, selectedDate: day.dateISO, fileName, availabilityFileName }))
  }, [availabilityFileName, availabilityResult, fileName, result, selectedDate])

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    setProgress("Loading Month Housekeeping Forecast PDF...")
    setFileName(file.name)

    try {
      const text = await ocrDocumentFile(file, setProgress, PARSE_ERROR)
      const parsed = parseMonthHousekeepingForecastText(text)
      if (!parsed.days.length) throw new Error(PARSE_ERROR)

      setResult(parsed)
      setSelectedDate(parsed.days[0].dateISO)
      setWeekIndex(0)
      setProgress("")
    } catch (caught) {
      console.error("Month Housekeeping Forecast parse failed:", caught)
      setError(caught instanceof Error && caught.message ? caught.message : PARSE_ERROR)
      setProgress("")
    } finally {
      setIsProcessing(false)
    }
  }

  const processAvailabilityFile = async (file: File) => {
    setIsAvailabilityProcessing(true)
    setAvailabilityError(null)
    setAvailabilityResult(null)
    setAvailabilityProgress("Loading Room Availability report...")
    setAvailabilityFileName(file.name)

    try {
      const text = file.type.includes("csv") || file.name.toLowerCase().endsWith(".csv") || file.name.toLowerCase().endsWith(".txt")
        ? await file.text()
        : await ocrDocumentFile(file, setAvailabilityProgress, AVAILABILITY_PARSE_ERROR)
      const parsed = parseRoomAvailabilityText(text)
      if (!parsed.days.length) throw new Error(AVAILABILITY_PARSE_ERROR)

      setAvailabilityResult(parsed)
      setAvailabilityProgress("")
    } catch (caught) {
      console.error("Room Availability parse failed:", caught)
      setAvailabilityResult(null)
      setAvailabilityError(caught instanceof Error && caught.message ? caught.message : AVAILABILITY_PARSE_ERROR)
      setAvailabilityProgress("")
    } finally {
      setIsAvailabilityProcessing(false)
    }
  }

  const selectWeek = (nextIndex: number) => {
    const clamped = Math.min(Math.max(nextIndex, 0), weeks.length - 1)
    setWeekIndex(clamped)
    const firstDay = weeks[clamped]?.[0]
    if (firstDay) setSelectedDate(firstDay.dateISO)
  }

  const inventoryValid = groupsSum() === FORECAST_ROOM_TOTAL

  return (
    <div className={cn("space-y-6", compact && "space-y-4")}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Month Housekeeping Forecast
          </CardTitle>
          <CardDescription>
            Upload the Agilysys Housekeeping Forecasting PDF for arrivals, departures, stayovers, and OCC%. Upload Room Availability for actual bucket totals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={cn("rounded-lg border-2 border-dashed p-5 text-center", isProcessing ? "opacity-60" : "bg-slate-50")}>
            <input
              id={compact ? "month-forecast-compact-upload" : "month-forecast-upload"}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              disabled={isProcessing}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void processFile(file)
              }}
            />
            <label htmlFor={compact ? "month-forecast-compact-upload" : "month-forecast-upload"} className="block cursor-pointer">
              {isProcessing ? <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" /> : <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />}
              <div className="font-medium text-slate-800">{fileName || "Upload Month Housekeeping Forecast PDF"}</div>
              <div className="text-sm text-slate-500">{progress || "Forecast activity only. Actual room availability comes from the Room Availability report."}</div>
            </label>
          </div>

          <div className={cn("rounded-lg border-2 border-dashed p-5 text-center", isAvailabilityProcessing ? "opacity-60" : "bg-slate-50")}>
            <input
              id={compact ? "room-availability-compact-upload" : "room-availability-upload"}
              type="file"
              accept="application/pdf,.pdf,image/*,.txt,.csv"
              className="hidden"
              disabled={isAvailabilityProcessing}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void processAvailabilityFile(file)
              }}
            />
            <label htmlFor={compact ? "room-availability-compact-upload" : "room-availability-upload"} className="block cursor-pointer">
              {isAvailabilityProcessing ? <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" /> : <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />}
              <div className="font-medium text-slate-800">{availabilityFileName || "Upload Room Availability report"}</div>
              <div className="text-sm text-slate-500">{availabilityProgress || "KING, QNQN, VIQN, VIKG, SUIT and Total Available are summed from room-code availability."}</div>
            </label>
          </div>

          {!inventoryValid && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Consolidated inventory must equal {FORECAST_ROOM_TOTAL}. Current total: {groupsSum()}.
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {availabilityError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{availabilityError}</span>
            </div>
          )}

        </CardContent>
      </Card>

      {selectedDay && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 lg:grid-cols-10">
            {[
              ["Today", formatDateLabel(selectedDay.dateISO)],
              ["Tomorrow", displayResult?.days[displayResult.days.findIndex((day) => day.dateISO === selectedDay.dateISO) + 1]?.dateLabel || "N/A"],
              ["Arrivals", selectedDay.arrivals],
              ["Departures", selectedDay.departures],
              ["Stayovers", selectedDay.stayovers],
              ["Occupancy %", selectedDay.occupancy],
              ["Total Available", availabilityDisplay(selectedDay.totalAvailable, selectedHasAvailability)],
              ["KING", availabilityDisplay(selectedDay.groups.KING.available, selectedHasAvailability)],
              ["QNQN", availabilityDisplay(selectedDay.groups.QNQN.available, selectedHasAvailability)],
              ["VIQN", availabilityDisplay(selectedDay.groups.VIQN.available, selectedHasAvailability)],
              ["VIKG", availabilityDisplay(selectedDay.groups.VIKG.available, selectedHasAvailability)],
              ["SUIT", availabilityDisplay(selectedDay.groups.SUIT.available, selectedHasAvailability)],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border bg-white p-3">
                <div className="text-[11px] font-medium uppercase text-slate-500">{label}</div>
                <div className={cn("mt-1 text-xl font-bold tabular-nums", typeof value === "number" && value < 0 ? "text-red-600" : "text-slate-900")}>{value}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Weekly Availability</h2>
              <p className="text-sm text-slate-500">
                {availabilityResult?.days?.length ? "Activity from Housekeeping Forecast; availability from Room Availability." : "Upload Room Availability to display PMS room-code availability."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => selectWeek(weekIndex - 1)} disabled={weekIndex === 0}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous Week
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setExpanded((value) => !value)}>
                {expanded ? "Consolidated View" : "Expanded Room Types"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => selectWeek(weekIndex + 1)} disabled={weekIndex >= weeks.length - 1}>
                Next Week
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-auto rounded-xl border bg-white">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Day</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">OCC%</th>
                  <th className="p-3 text-right">Arv</th>
                  <th className="p-3 text-right">Dpt</th>
                  {FORECAST_ROOM_GROUPS.map((group) => <th key={group} className="p-3 text-right">{group}</th>)}
                  <th className="p-3 text-right">Total Available</th>
                </tr>
              </thead>
              <tbody>
                {visibleDays.map((day) => (
                  <Fragment key={day.dateISO}>
                    <tr
                      className={cn("cursor-pointer border-t hover:bg-slate-50", selectedDate === day.dateISO && "bg-blue-50")}
                      onClick={() => setSelectedDate(day.dateISO)}
                    >
                      <td className="p-3 font-medium">{day.dayLabel}</td>
                      <td className="p-3">{day.dateLabel}</td>
                      <td className="p-3 text-right tabular-nums">{day.occupancy}</td>
                      <td className="p-3 text-right tabular-nums">{day.arrivals}</td>
                      <td className="p-3 text-right tabular-nums">{day.departures}</td>
                      {FORECAST_ROOM_GROUPS.map((group) => {
                        const hasAvailability = availabilityByDate.has(day.dateISO)
                        return (
                        <td key={group} className={cn("p-3 text-right tabular-nums", hasAvailability && availabilityClass(day.groups[group].available))}>
                          {availabilityDisplay(day.groups[group].available, hasAvailability)}
                        </td>
                        )
                      })}
                      <td className={cn("p-3 text-right tabular-nums", availabilityByDate.has(day.dateISO) && availabilityClass(day.totalAvailable))}>{availabilityDisplay(day.totalAvailable, availabilityByDate.has(day.dateISO))}</td>
                    </tr>
                    {expanded && FORECAST_ROOM_GROUPS.map((group) => (
                      <tr key={`${day.dateISO}-${group}`} className="border-t bg-slate-50/60 text-xs">
                        <td className="p-2 pl-8 font-semibold text-slate-700" colSpan={2}>{group}</td>
                        <td className="p-2 text-right" colSpan={3}>Arv {day.groups[group].arrivals} / Dpt {day.groups[group].departures} / Stay {day.groups[group].stayovers}</td>
                        <td className="p-2 text-slate-500" colSpan={6}>
                          {day.groups[group].rows
                            .map((row) => (
                              <span key={`${row.roomCode}-${row.roomLabel}`} className="mr-4 inline-block">
                                {row.roomCode}: {availabilityByDate.get(day.dateISO)?.rows.find((availabilityRow) => availabilityRow.roomCode === row.roomCode)?.values[day.dateISO] ?? "-"}
                                {availabilityByDate.has(day.dateISO) ? " available" : " upload Room Availability"}
                              </span>
                            ))}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
