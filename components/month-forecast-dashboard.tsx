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
  type ForecastRoomGroup,
} from "@/lib/month-housekeeping-forecast"

const STORAGE_KEY = "month-housekeeping-forecast-dashboard-v6"
const PARSE_ERROR = "Unable to parse housekeeping forecast. Please upload the Month Housekeeping Forecast PDF."
const SMART_BALANCER_LOS_NIGHTS = 3

const UPGRADE_PATHS: Record<ForecastRoomGroup, ForecastRoomGroup[]> = {
  KING: ["VIKG", "SUIT"],
  QNQN: ["VIQN", "SUIT"],
  VIQN: ["SUIT"],
  VIKG: ["SUIT"],
  SUIT: [],
}

type ForecastRoomRow = ForecastDay["groups"][ForecastRoomGroup]["rows"][number]

type RoomCodeBalanceStats = {
  roomCode: string
  roomLabel: string
  group: ForecastRoomGroup
  availabilityByDate: Array<{ dateISO: string; dateLabel: string; available: number }>
  minAvailable: number
  shortage: number
  shortageDates: string[]
}

type SmartBalanceSuggestion = {
  fromCode: string
  fromGroup: ForecastRoomGroup
  toCode: string
  toGroup: ForecastRoomGroup
  moveCount: number
  losNights: number
  datesHelped: string[]
  sourceShortage: number
  targetMinAvailable: number
}

type SmartBalanceResult = {
  windowDays: ForecastDay[]
  suggestions: SmartBalanceSuggestion[]
  unresolvedShortages: RoomCodeBalanceStats[]
}

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

function availabilityChipClass(value: number) {
  if (value < 0) return "border-red-300 bg-red-50 text-red-700"
  if (value === 0) return "border-amber-300 bg-amber-50 text-amber-800"
  return "border-emerald-200 bg-emerald-50 text-emerald-700"
}

function getRoomCodeInventory(roomCode: string) {
  return FORECAST_ROOM_CODE_TOTALS[roomCode] ?? 0
}

function getSmartBalanceWindow(days: ForecastDay[], selectedDate: string, losNights = SMART_BALANCER_LOS_NIGHTS) {
  const startIndex = days.findIndex((day) => day.dateISO === selectedDate)
  if (startIndex < 0) return []
  return days.slice(startIndex, startIndex + losNights)
}

function getRoomCodeBalanceStats(windowDays: ForecastDay[]) {
  const stats = new Map<string, Omit<RoomCodeBalanceStats, "minAvailable" | "shortage" | "shortageDates">>()

  windowDays.forEach((day) => {
    FORECAST_ROOM_GROUPS.forEach((group) => {
      day.groups[group].rows.forEach((row) => {
        const inventoryTotal = getRoomCodeInventory(row.roomCode)
        const available = inventoryTotal - (row.arrivals + row.stayovers)
        const existing = stats.get(row.roomCode) || {
          roomCode: row.roomCode,
          roomLabel: row.roomLabel,
          group: row.group,
          availabilityByDate: [],
        }

        existing.availabilityByDate.push({
          dateISO: day.dateISO,
          dateLabel: formatDateLabel(day.dateISO),
          available,
        })
        stats.set(row.roomCode, existing)
      })
    })
  })

  return Array.from(stats.values()).map((item) => {
    const values = item.availabilityByDate.map((day) => day.available)
    const minAvailable = values.length ? Math.min(...values) : 0
    const shortage = Math.max(0, ...values.map((value) => Math.max(0, -value)))
    const shortageDates = item.availabilityByDate
      .filter((day) => day.available < 0)
      .map((day) => `${day.dateLabel} (${day.available})`)

    return {
      ...item,
      minAvailable,
      shortage,
      shortageDates,
    }
  })
}

function buildSmartBalanceSuggestions(days: ForecastDay[], selectedDate: string, losNights = SMART_BALANCER_LOS_NIGHTS): SmartBalanceResult {
  const windowDays = getSmartBalanceWindow(days, selectedDate, losNights)
  const stats = getRoomCodeBalanceStats(windowDays)
  const targetRemaining = new Map<string, number>()
  const unresolvedShortages: RoomCodeBalanceStats[] = []
  const suggestions: SmartBalanceSuggestion[] = []

  stats.forEach((item) => {
    if (item.minAvailable > 0 && item.availabilityByDate.length === windowDays.length) {
      targetRemaining.set(item.roomCode, item.minAvailable)
    }
  })

  const sources = stats
    .filter((item) => item.shortage > 0)
    .sort((a, b) => b.shortage - a.shortage || a.roomCode.localeCompare(b.roomCode))

  sources.forEach((source) => {
    let remainingShortage = source.shortage
    const allowedTargetGroups = UPGRADE_PATHS[source.group]
    const targets = stats
      .filter((target) => allowedTargetGroups.includes(target.group) && (targetRemaining.get(target.roomCode) || 0) > 0)
      .sort((a, b) => {
        const groupRank = allowedTargetGroups.indexOf(a.group) - allowedTargetGroups.indexOf(b.group)
        if (groupRank !== 0) return groupRank
        return (targetRemaining.get(b.roomCode) || 0) - (targetRemaining.get(a.roomCode) || 0)
      })

    targets.forEach((target) => {
      if (remainingShortage <= 0) return
      const availableToMove = targetRemaining.get(target.roomCode) || 0
      const moveCount = Math.min(remainingShortage, availableToMove)
      if (moveCount <= 0) return

      suggestions.push({
        fromCode: source.roomCode,
        fromGroup: source.group,
        toCode: target.roomCode,
        toGroup: target.group,
        moveCount,
        losNights: windowDays.length,
        datesHelped: source.shortageDates,
        sourceShortage: source.shortage,
        targetMinAvailable: target.minAvailable,
      })

      targetRemaining.set(target.roomCode, availableToMove - moveCount)
      remainingShortage -= moveCount
    })

    if (remainingShortage > 0) {
      unresolvedShortages.push({
        ...source,
        shortage: remainingShortage,
      })
    }
  })

  return {
    windowDays,
    suggestions,
    unresolvedShortages,
  }
}

function MiniMetric({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className={cn("rounded-md border bg-white px-2 py-1 text-center", className)}>
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-sm font-bold tabular-nums text-slate-900">{value}</div>
    </div>
  )
}

function RoomCodeAvailabilityCard({ row }: { row: ForecastRoomRow }) {
  const inventory = getRoomCodeInventory(row.roomCode)
  const occupied = row.arrivals + row.stayovers
  const available = inventory - occupied

  return (
    <div className={cn("rounded-lg border p-3", available < 0 ? "border-red-300 bg-red-50" : available === 0 ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-mono text-sm font-bold text-slate-900">{row.roomCode}</div>
          <div className="mt-0.5 max-w-[240px] truncate text-[11px] text-slate-500" title={row.roomLabel}>{row.roomLabel}</div>
        </div>
        <div className={cn("rounded-full border px-2 py-1 text-xs font-bold", availabilityChipClass(available))}>
          {available} available
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <MiniMetric label="Inv" value={inventory} />
        <MiniMetric label="Arv" value={row.arrivals} />
        <MiniMetric label="Dpt" value={row.departures} />
        <MiniMetric label="Stay" value={row.stayovers} />
      </div>
    </div>
  )
}

function SmartBalanceCard({ suggestion }: { suggestion: SmartBalanceSuggestion }) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">Recommended move</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            Move {suggestion.moveCount}
          </div>
        </div>
        <div className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700">
          LOS {suggestion.losNights}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-lg border bg-white p-3">
          <div className="text-[10px] font-semibold uppercase text-slate-500">From</div>
          <div className="mt-1 font-mono text-lg font-bold text-red-700">{suggestion.fromCode}</div>
          <div className="text-xs text-slate-500">{suggestion.fromGroup}</div>
        </div>
        <div className="text-center text-xl font-bold text-slate-400">→</div>
        <div className="rounded-lg border bg-white p-3">
          <div className="text-[10px] font-semibold uppercase text-slate-500">To</div>
          <div className="mt-1 font-mono text-lg font-bold text-emerald-700">{suggestion.toCode}</div>
          <div className="text-xs text-slate-500">{suggestion.toGroup}</div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <MiniMetric label="Target open" value={suggestion.targetMinAvailable} />
        <MiniMetric label="Source short" value={suggestion.sourceShortage} />
      </div>

      <div className="mt-3">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Dates helped</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {suggestion.datesHelped.map((date) => (
            <span key={date} className="rounded-full border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-700">
              {date}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
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
  const smartBalance = useMemo(
    () => buildSmartBalanceSuggestions(displayResult?.days || [], selectedDay?.dateISO || "", SMART_BALANCER_LOS_NIGHTS),
    [displayResult, selectedDay],
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
              <div key={String(label)} className={cn("rounded-lg border p-3", typeof value === "number" && value < 0 ? "border-red-300 bg-red-50" : "bg-white")}>
                <div className="text-[11px] font-medium uppercase text-slate-500">{label}</div>
                <div className={cn("mt-1 text-xl font-bold tabular-nums", typeof value === "number" && value < 0 ? "text-red-600" : "text-slate-900")}>{value}</div>
              </div>
            ))}
          </div>

          <Card className="border-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Smart Balancer</CardTitle>
              <CardDescription>
                Tests a {SMART_BALANCER_LOS_NIGHTS}-night LOS window from {formatDateLabel(selectedDay.dateISO)} and turns oversold room codes into clear upgrade actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-800">Window</span>
                {smartBalance.windowDays.length ? smartBalance.windowDays.map((day) => (
                  <span key={day.dateISO} className="rounded-full border bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                    {formatDateLabel(day.dateISO)}
                  </span>
                )) : <span>not enough forecast days</span>}
              </div>

              {smartBalance.windowDays.length < SMART_BALANCER_LOS_NIGHTS && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Not enough future days loaded to test a full {SMART_BALANCER_LOS_NIGHTS}-night window.
                </div>
              )}

              {smartBalance.suggestions.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {smartBalance.suggestions.map((suggestion, index) => (
                    <SmartBalanceCard key={`${suggestion.fromCode}-${suggestion.toCode}-${index}`} suggestion={suggestion} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="font-semibold text-slate-900">No clean upgrade path found.</div>
                  <div className="mt-1">Either the selected window is balanced, or every logical upgrade target is also tight for the full LOS. In hotel terms: the inventory Jenga tower is wobbling.</div>
                </div>
              )}

              {smartBalance.unresolvedShortages.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <div className="font-semibold">Still short after suggested moves</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {smartBalance.unresolvedShortages.map((item) => (
                      <span key={item.roomCode} className="rounded-full border border-red-300 bg-white px-2.5 py-1 text-xs font-bold text-red-700">
                        {item.roomCode}: needs {item.shortage}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
                {expanded ? "Consolidated View" : "Expanded Room Codes"}
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
                      <tr key={`${day.dateISO}-${group}`} className="border-t bg-slate-50/60">
                        <td className="p-3 align-top" colSpan={2}>
                          <div className="font-semibold text-slate-800">{group}</div>
                          <div className={cn("mt-1 inline-flex rounded-full border px-2 py-1 text-xs font-bold", availabilityChipClass(day.groups[group].available))}>
                            {day.groups[group].available} available
                          </div>
                        </td>
                        <td className="p-3 align-top" colSpan={9}>
                          <div className="mb-2 grid max-w-md grid-cols-3 gap-2">
                            <MiniMetric label="Arv" value={day.groups[group].arrivals} />
                            <MiniMetric label="Dpt" value={day.groups[group].departures} />
                            <MiniMetric label="Stay" value={day.groups[group].stayovers} />
                          </div>
                          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                            {day.groups[group].rows.map((row) => (
                              <RoomCodeAvailabilityCard key={`${day.dateISO}-${row.roomCode}-${row.roomLabel}`} row={row} />
                            ))}
                          </div>
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
