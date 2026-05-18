"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { AlertTriangle, ChevronLeft, ChevronRight, FileText, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useInventory } from "@/contexts/inventory-context"
import type { DailyInventorySnapshot } from "@/lib/daily-inventory"
import {
  FORECAST_ROOM_CODE_TOTALS,
  FORECAST_ROOM_GROUPS,
  FORECAST_ROOM_TOTAL,
  FORECAST_ROOM_TOTALS,
  parseMonthHousekeepingForecastText,
  type ForecastDay,
  type ForecastParseResult,
} from "@/lib/month-housekeeping-forecast"

const STORAGE_KEY = "month-housekeeping-forecast-dashboard-v6"
const PARSE_ERROR = "Unable to parse housekeeping forecast. Please upload the Month Housekeeping Forecast PDF."

function groupsSum() {
  return FORECAST_ROOM_GROUPS.reduce((sum, group) => sum + FORECAST_ROOM_TOTALS[group], 0)
}

function calculateAvailabilityFromForecastDay(day: ForecastDay): ForecastDay {
  const groups = { ...day.groups } as ForecastDay["groups"]

  FORECAST_ROOM_GROUPS.forEach((group) => {
    const occupied = groups[group].arrivals + groups[group].stayovers
    groups[group] = {
      ...groups[group],
      occupied,
      available: FORECAST_ROOM_TOTALS[group] - occupied,
    }
  })

  const totalOccupied = day.arrivals + day.stayovers
  const totalAvailable = FORECAST_ROOM_TOTAL - totalOccupied

  return {
    ...day,
    groups,
    totalOccupied,
    totalAvailable,
    oversold: totalAvailable < 0 || FORECAST_ROOM_GROUPS.some((group) => groups[group].available < 0),
  }
}

function applyCalculatedAvailability(result: ForecastParseResult | null): ForecastParseResult | null {
  if (!result?.days?.length) return result

  return {
    ...result,
    days: result.days.map(calculateAvailabilityFromForecastDay),
  }
}

function dayToSnapshot(day: ForecastDay): DailyInventorySnapshot {
  return {
    dateLabel: day.dateISO,
    roomTotal: FORECAST_ROOM_TOTAL,
    available: day.totalAvailable,
    committed: day.totalOccupied,
    arrivals: day.arrivals,
    departures: day.departures,
    stayovers: day.stayovers,
    occupancy: day.occupancy,
    oooOtm: "0/0",
    groupsRemaining: 0,
    guests: `${day.arrivingGuests} arriving, ${day.departingGuests} departing`,
    rooms: {
      KING: day.groups.KING.available,
      QUEEN: day.groups.QNQN.available,
      VIQN: day.groups.VIQN.available,
      VIKG: day.groups.VIKG.available,
      SUITES: day.groups.SUIT.available,
    },
    recommendations: day.oversold
      ? ["Oversold calculated from forecast activity. Review red values before assigning rooms."]
      : ["Availability calculated from fixed room inventory minus arrivals and stayovers."],
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
    await page.render({ canvas, canvasContext: context, viewport }).promise

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
  const [selectedDate, setSelectedDate] = useState("")
  const [weekIndex, setWeekIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as {
        result: ForecastParseResult
        selectedDate: string
        fileName: string
      }
      if (!parsed.result?.days?.length) return
      setResult(parsed.result)
      setSelectedDate(parsed.selectedDate || parsed.result.days[0].dateISO)
      setFileName(parsed.fileName || "")
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const displayResult = useMemo(() => applyCalculatedAvailability(result), [result])
  const weeks = useMemo(() => chunkWeeks(displayResult?.days || []), [displayResult])
  const visibleDays = weeks[weekIndex] || []
  const selectedDay = useMemo(
    () => displayResult?.days.find((day) => day.dateISO === selectedDate) || visibleDays[0] || null,
    [displayResult, selectedDate, visibleDays],
  )

  useEffect(() => {
    if (!selectedDay) return
    setDailyInventorySnapshot(dayToSnapshot(selectedDay))
    onForecastApplied?.()
  }, [onForecastApplied, selectedDay, setDailyInventorySnapshot])

  useEffect(() => {
    if (!result?.days?.length) return
    const day = result.days.find((item) => item.dateISO === selectedDate) || result.days[0]
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ result, selectedDate: day.dateISO, fileName }))
  }, [fileName, result, selectedDate])

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
            Upload the Agilysys Housekeeping Forecasting PDF. Availability is calculated from fixed room inventory minus arrivals and stayovers.
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
              <div className="text-sm text-slate-500">{progress || "One report drives arrivals, departures, stayovers, occupancy, and calculated availability."}</div>
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
              ["Total Available", selectedDay.totalAvailable],
              ["KING", selectedDay.groups.KING.available],
              ["QNQN", selectedDay.groups.QNQN.available],
              ["VIQN", selectedDay.groups.VIQN.available],
              ["VIKG", selectedDay.groups.VIKG.available],
              ["SUIT", selectedDay.groups.SUIT.available],
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
                Activity and availability are calculated from the Month Housekeeping Forecast using fixed room inventory totals.
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
                      {FORECAST_ROOM_GROUPS.map((group) => (
                        <td key={group} className={cn("p-3 text-right tabular-nums", availabilityClass(day.groups[group].available))}>
                          {day.groups[group].available}
                        </td>
                      ))}
                      <td className={cn("p-3 text-right tabular-nums", availabilityClass(day.totalAvailable))}>{day.totalAvailable}</td>
                    </tr>
                    {expanded && FORECAST_ROOM_GROUPS.map((group) => (
                      <tr key={`${day.dateISO}-${group}`} className="border-t bg-slate-50/60 text-xs">
                        <td className="p-2 pl-8 font-semibold text-slate-700" colSpan={2}>{group}</td>
                        <td className="p-2 text-right" colSpan={3}>Arv {day.groups[group].arrivals} / Dpt {day.groups[group].departures} / Stay {day.groups[group].stayovers}</td>
                        <td className="p-2 text-slate-500" colSpan={6}>
                          {day.groups[group].rows.map((row) => {
                            const rowOccupied = row.arrivals + row.stayovers
                            const rowAvailable = (FORECAST_ROOM_CODE_TOTALS[row.roomCode] ?? 0) - rowOccupied
                            return (
                              <span key={`${row.roomCode}-${row.roomLabel}`} className={cn("mr-4 inline-block", availabilityClass(rowAvailable))}>
                                {row.roomCode}: {rowAvailable} available / Arv {row.arrivals} / Dpt {row.departures} / Stay {row.stayovers}
                              </span>
                            )
                          })}
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
