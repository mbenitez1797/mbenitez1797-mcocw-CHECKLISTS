"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { AlertTriangle, ChevronLeft, ChevronRight, FileText, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useInventory } from "@/contexts/inventory-context"
import type { DailyInventorySnapshot } from "@/lib/daily-inventory"
import {
  FORECAST_ROOM_GROUPS,
  FORECAST_ROOM_TOTAL,
  FORECAST_ROOM_TOTALS,
  parseMonthHousekeepingForecastText,
  type ForecastDay,
  type ForecastParseResult,
  type ForecastRoomGroup,
} from "@/lib/month-housekeeping-forecast"

const STORAGE_KEY = "month-housekeeping-forecast-dashboard-v11"
const PARSE_ERROR = "Unable to parse housekeeping forecast. Please upload the Month Housekeeping Forecast PDF."

function formatDateLabel(dateISO: string) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

function availabilityClass(value: number) {
  return value < 0 ? "text-red-600 font-bold" : "text-slate-900"
}

function chipClass(value: number) {
  if (value < 0) return "border-red-300 bg-red-50 text-red-700"
  if (value === 0) return "border-amber-300 bg-amber-50 text-amber-800"
  return "border-emerald-200 bg-emerald-50 text-emerald-700"
}

function chunkWeeks(days: ForecastDay[]) {
  const weeks: ForecastDay[][] = []
  for (let index = 0; index < days.length; index += 7) weeks.push(days.slice(index, index + 7))
  return weeks
}

function recalculateDay(day: ForecastDay): ForecastDay {
  const groups = { ...day.groups } as ForecastDay["groups"]

  let totalOccupied = 0

  FORECAST_ROOM_GROUPS.forEach((group) => {
    const arrivals = Math.max(0, Number(groups[group]?.arrivals ?? 0))
    const stayovers = Math.max(0, Number(groups[group]?.stayovers ?? 0))
    const occupied = arrivals + stayovers
    const available = FORECAST_ROOM_TOTALS[group] - occupied

    groups[group] = {
      ...groups[group],
      inventoryTotal: FORECAST_ROOM_TOTALS[group],
      arrivals,
      stayovers,
      occupied,
      available,
    }

    totalOccupied += occupied
  })

  const totalAvailable = FORECAST_ROOM_GROUPS.reduce(
    (sum, group) => sum + groups[group].available,
    0
  )

  return {
    ...day,
    groups,
    totalOccupied,
    totalAvailable,
    occupancy: `${((totalOccupied / FORECAST_ROOM_TOTAL) * 100).toFixed(1)}%`,
    oversold:
      totalAvailable < 0 ||
      FORECAST_ROOM_GROUPS.some((group) => groups[group].available < 0),
  }
} function normalizeResult(result: ForecastParseResult): ForecastParseResult {
  return { ...result, days: result.days.map(recalculateDay) }
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
    recommendations: day.oversold ? ["Oversold calculated from forecast activity. Review red values before assigning rooms."] : ["Availability calculated from fixed room inventory minus arrivals and stayovers."],
    updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }
}

async function readPdfTextLayer(file: File, onProgress: (message: string) => void) {
  const pdfjs = await import("pdfjs-dist")
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString()
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  let text = ""
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    onProgress(`Reading text page ${pageNum} of ${pdf.numPages}...`)
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    text += "\n" + content.items.map((item) => ("str" in item ? String(item.str || "") : "")).join(" ")
  }
  return text
}

async function readPdfOcr(file: File, onProgress: (message: string) => void) {
  const tesseract = await import("tesseract.js")
  const pdfjs = await import("pdfjs-dist")
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString()
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  let text = ""
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    onProgress(`OCR page ${pageNum} of ${pdf.numPages}...`)
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 2.5 })
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) throw new Error(PARSE_ERROR)
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvas, canvasContext: context, viewport }).promise
    const result = await tesseract.recognize(canvas, "eng")
    text += "\n" + (result.data.text || "")
  }
  return text
}

async function readImageText(file: File, onProgress: (message: string) => void) {
  const tesseract = await import("tesseract.js")
  onProgress("Reading image...")
  const result = await tesseract.recognize(file, "eng")
  return result.data.text || ""
}

function parseText(text: string) {
  const parsed = parseMonthHousekeepingForecastText(text)
  if (!parsed.days.length) throw new Error(PARSE_ERROR)
  return normalizeResult(parsed)
}

type Props = { compact?: boolean; onForecastApplied?: () => void }

export function MonthForecastDashboardV2({ compact = false, onForecastApplied }: Props) {
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
      const parsed = JSON.parse(saved) as { result: ForecastParseResult; selectedDate: string; fileName: string }
      if (!parsed.result?.days?.length) return
      setResult(normalizeResult(parsed.result))
      setSelectedDate(parsed.selectedDate || parsed.result.days[0].dateISO)
      setFileName(parsed.fileName || "")
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const weeks = useMemo(() => chunkWeeks(result?.days || []), [result])
  const visibleDays = weeks[weekIndex] || []
  const selectedDay = useMemo(() => result?.days.find((day) => day.dateISO === selectedDate) || visibleDays[0] || null, [result, selectedDate, visibleDays])

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
    setProgress("Loading forecast...")
    setFileName(file.name)
    try {
      let parsed: ForecastParseResult
      if (file.type.startsWith("image/")) {
        parsed = parseText(await readImageText(file, setProgress))
      } else {
        try {
          parsed = parseText(await readPdfTextLayer(file, setProgress))
        } catch {
          parsed = parseText(await readPdfOcr(file, setProgress))
        }
      }
      setResult(parsed)
      setSelectedDate(parsed.days[0].dateISO)
      setWeekIndex(0)
      setProgress("")
    } catch (caught) {
      console.error("Forecast parse failed:", caught)
      setError(caught instanceof Error && caught.message ? caught.message : PARSE_ERROR)
      setProgress("")
    } finally {
      setIsProcessing(false)
    }
  }

  const clearSavedForecast = () => {
    localStorage.removeItem(STORAGE_KEY)
    setResult(null)
    setSelectedDate("")
    setFileName("")
    setError(null)
    setWeekIndex(0)
  }

  const selectWeek = (nextIndex: number) => {
    const clamped = Math.min(Math.max(nextIndex, 0), Math.max(weeks.length - 1, 0))
    setWeekIndex(clamped)
    const firstDay = weeks[clamped]?.[0]
    if (firstDay) setSelectedDate(firstDay.dateISO)
  }

  return (
    <div className={cn("space-y-6", compact && "space-y-4")}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-primary" />Month Housekeeping Forecast</CardTitle>
          <CardDescription>Upload the forecast PDF. The parser reads the PDF text layer first and uses OCR only as backup.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={cn("rounded-lg border-2 border-dashed p-5 text-center", isProcessing ? "opacity-60" : "bg-slate-50")}>
            <input id={compact ? "month-forecast-v2-compact-upload" : "month-forecast-v2-upload"} type="file" accept="application/pdf,.pdf,image/*" className="hidden" disabled={isProcessing} onChange={(event) => { const file = event.target.files?.[0]; if (file) void processFile(file) }} />
            <label htmlFor={compact ? "month-forecast-v2-compact-upload" : "month-forecast-v2-upload"} className="block cursor-pointer">
              {isProcessing ? <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" /> : <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />}
              <div className="font-medium text-slate-800">{fileName || "Upload Month Housekeeping Forecast PDF"}</div>
              <div className="text-sm text-slate-500">{progress || "One report drives availability numbers."}</div>
            </label>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={clearSavedForecast} disabled={isProcessing}>Clear saved forecast</Button>
          {groupsSum() !== FORECAST_ROOM_TOTAL && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Inventory must equal {FORECAST_ROOM_TOTAL}. Current total: {groupsSum()}.</div>}
          {error && <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        </CardContent>
      </Card>

      {selectedDay && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 lg:grid-cols-10">
            {[["Selected", formatDateLabel(selectedDay.dateISO)], ["Arrivals", selectedDay.arrivals], ["Departures", selectedDay.departures], ["Stayovers", selectedDay.stayovers], ["Occupancy %", selectedDay.occupancy], ["Total Available", selectedDay.totalAvailable], ["KING", selectedDay.groups.KING.available], ["QNQN", selectedDay.groups.QNQN.available], ["VIQN", selectedDay.groups.VIQN.available], ["VIKG", selectedDay.groups.VIKG.available], ["SUIT", selectedDay.groups.SUIT.available]].map(([label, value]) => (
              <div key={String(label)} className={cn("rounded-lg border p-3", typeof value === "number" && value < 0 ? "border-red-300 bg-red-50" : "bg-white")}>
                <div className="text-[11px] font-medium uppercase text-slate-500">{label}</div>
                <div className={cn("mt-1 text-xl font-bold tabular-nums", typeof value === "number" && value < 0 ? "text-red-600" : "text-slate-900")}>{value}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-semibold text-slate-800">Weekly Availability</h2><p className="text-sm text-slate-500">Calculated from fixed inventory minus arrivals and stayovers.</p></div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => selectWeek(weekIndex - 1)} disabled={weekIndex === 0}><ChevronLeft className="mr-1 h-4 w-4" />Previous Week</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setExpanded((value) => !value)}>{expanded ? "Consolidated View" : "Expanded Room Codes"}</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => selectWeek(weekIndex + 1)} disabled={weekIndex >= weeks.length - 1}>Next Week<ChevronRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </div>

          <div className="overflow-auto rounded-xl border bg-white">
            <table className="w-full min-w-[860px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">Day</th><th className="p-3">Date</th><th className="p-3 text-right">OCC%</th><th className="p-3 text-right">Arv</th><th className="p-3 text-right">Dpt</th>{FORECAST_ROOM_GROUPS.map((group) => <th key={group} className="p-3 text-right">{group}</th>)}<th className="p-3 text-right">Total Available</th></tr></thead>
              <tbody>{visibleDays.map((day) => <Fragment key={day.dateISO}><tr className={cn("cursor-pointer border-t hover:bg-slate-50", selectedDate === day.dateISO && "bg-blue-50")} onClick={() => setSelectedDate(day.dateISO)}><td className="p-3 font-medium">{day.dayLabel}</td><td className="p-3">{day.dateLabel}</td><td className="p-3 text-right tabular-nums">{day.occupancy}</td><td className="p-3 text-right tabular-nums">{day.arrivals}</td><td className="p-3 text-right tabular-nums">{day.departures}</td>{FORECAST_ROOM_GROUPS.map((group) => <td key={group} className={cn("p-3 text-right tabular-nums", availabilityClass(day.groups[group].available))}>{day.groups[group].available}</td>)}<td className={cn("p-3 text-right tabular-nums", availabilityClass(day.totalAvailable))}>{day.totalAvailable}</td></tr>
                {expanded && FORECAST_ROOM_GROUPS.map((group) => <tr key={`${day.dateISO}-${group}`} className="border-t bg-slate-50/60"><td className="p-3 align-top" colSpan={2}><div className="font-semibold text-slate-800">{group}</div><div className={cn("mt-1 inline-flex rounded-full border px-2 py-1 text-xs font-bold", chipClass(day.groups[group].available))}>{day.groups[group].available} available</div></td><td className="p-3 align-top" colSpan={9}><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{day.groups[group].rows.map((row) => <div key={`${day.dateISO}-${row.roomCode}-${row.roomLabel}`} className="rounded-lg border bg-white p-3"><div className="font-mono text-sm font-bold text-slate-900">{row.roomCode}</div><div className="text-xs text-slate-500">Arv {row.arrivals} / Dpt {row.departures} / Stay {row.stayovers}</div></div>)}</div></td></tr>)}
              </Fragment>)}</tbody></table>
          </div>
        </>
      )}
    </div>
  )
}

