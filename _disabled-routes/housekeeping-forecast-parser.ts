export type HousekeepingForecastDailyTotal = {
  date: string
  arrivals: number
  arriving_guests: number
  departures: number
  departing_guests: number
  stayovers: number
  stayover_guests: number
  otm: number
  ooo: number
  rooms_on_hold: number
}

export type HousekeepingForecastParseResult = {
  property: string
  report_name: string
  start_date: string
  end_date: string
  daily_totals: HousekeepingForecastDailyTotal[]
  grand_totals: HousekeepingForecastDailyTotalNoDate
  validation: {
    matches_report_total: boolean
    errors: string[]
    warnings?: string[]
  }
}

type HousekeepingForecastDailyTotalNoDate = Omit<HousekeepingForecastDailyTotal, "date">

type TsvWord = {
  level: number
  page: number
  block: number
  paragraph: number
  line: number
  word: number
  left: number
  top: number
  width: number
  height: number
  confidence: number
  text: string
}

type ParsedNumericRow = {
  top: number
  totals: HousekeepingForecastDailyTotalNoDate
  candidates: Array<{
    columnIndex: number
    top: number
    confidence: number
  }>
}

const PROPERTY = "Courtyard By Marriott Winter Haven"
const REPORT_NAME = "Housekeeping Forecasting"

const NUMERIC_COLUMNS: (keyof HousekeepingForecastDailyTotalNoDate)[] = [
  "arrivals",
  "arriving_guests",
  "departures",
  "departing_guests",
  "stayovers",
  "stayover_guests",
  "otm",
  "ooo",
  "rooms_on_hold",
]

const COLUMN_CENTERS = [0.1, 0.225, 0.386, 0.53, 0.625, 0.735, 0.802, 0.871, 0.974]
const MONTHS: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
}

function parseTsv(tsv: string, onlyDigits = true): TsvWord[] {
  return tsv
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split("\t"))
    .filter((parts) => parts.length >= 12 && parts[11]?.trim())
    .map((parts) => ({
      level: Number(parts[0]),
      page: Number(parts[1]),
      block: Number(parts[2]),
      paragraph: Number(parts[3]),
      line: Number(parts[4]),
      word: Number(parts[5]),
      left: Number(parts[6]),
      top: Number(parts[7]),
      width: Number(parts[8]),
      height: Number(parts[9]),
      confidence: Number(parts[10]),
      text: parts.slice(11).join("\t").trim(),
    }))
    .filter((word) => word.level === 5 && (!onlyDigits || word.text.length > 0))
}

function emptyTotals(date = ""): HousekeepingForecastDailyTotal {
  return {
    date,
    arrivals: 0,
    arriving_guests: 0,
    departures: 0,
    departing_guests: 0,
    stayovers: 0,
    stayover_guests: 0,
    otm: 0,
    ooo: 0,
    rooms_on_hold: 0,
  }
}

function addDays(date: string, days: number) {
  const next = new Date(`${date}T00:00:00Z`)
  next.setUTCDate(next.getUTCDate() + days)
  return next.toISOString().slice(0, 10)
}

function dateRange(startDate: string, endDate: string) {
  const days = Math.round(
    (new Date(`${endDate}T00:00:00Z`).getTime() - new Date(`${startDate}T00:00:00Z`).getTime()) / 86400000,
  ) + 1

  return Array.from({ length: Math.max(0, days) }, (_value, index) => addDays(startDate, index))
}

function isDateInRange(date: string, startDate: string, endDate: string) {
  return date >= startDate && date <= endDate
}

function parseReportDateRange(text: string) {
  const compact = text.replace(/\s+/g, " ")
  const matches = [...compact.matchAll(/(?:start\s*date|end\s*date)\s+([A-Za-z]{3,9})\s+(\d{1,2}),?\s*(\d{4})/gi)]
  const dates = matches.map((match) => {
    const month = MONTHS[match[1].slice(0, 3).toLowerCase()]
    const day = match[2].padStart(2, "0")
    return month ? `${match[3]}-${month}-${day}` : null
  }).filter((date): date is string => Boolean(date))

  return dates.length >= 2 ? { startDate: dates[0], endDate: dates[1] } : null
}

function totalsWithoutDate(row: HousekeepingForecastDailyTotal): HousekeepingForecastDailyTotalNoDate {
  const { date: _date, ...totals } = row
  return totals
}

function addTotals(target: HousekeepingForecastDailyTotal, source: HousekeepingForecastDailyTotalNoDate) {
  for (const key of NUMERIC_COLUMNS) target[key] += source[key]
}

function sumDailyTotals(rows: HousekeepingForecastDailyTotal[]) {
  const sum = emptyTotals()
  for (const row of rows) addTotals(sum, totalsWithoutDate(row))
  return totalsWithoutDate(sum)
}

function nearestColumnIndex(centerRatio: number) {
  let bestIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY
  COLUMN_CENTERS.forEach((columnCenter, index) => {
    const distance = Math.abs(centerRatio - columnCenter)
    if (distance < bestDistance) {
      bestIndex = index
      bestDistance = distance
    }
  })
  return bestDistance <= 0.08 ? bestIndex : -1
}

function parseNumericRowsFromTsv(tsv: string, cropWidth: number): ParsedNumericRow[] {
  const words = parseTsv(tsv)
  const lines = new Map<string, TsvWord[]>()

  for (const word of words) {
    const key = `${word.block}:${word.paragraph}:${word.line}`
    const current = lines.get(key) || []
    current.push(word)
    lines.set(key, current)
  }

  const sortedLines = [...lines.values()]
    .sort((a, b) => Math.min(...a.map((word) => word.top)) - Math.min(...b.map((word) => word.top)))

  return sortedLines
    .filter((lineWords) => lineWords.length >= 6)
    .map((lineWords) => {
      const row = emptyTotals()
      const candidates: ParsedNumericRow["candidates"] = []

      for (const word of lineWords) {
        const centerRatio = (word.left + word.width / 2) / cropWidth
        const columnIndex = nearestColumnIndex(centerRatio)
        if (columnIndex < 0) continue

        const key = NUMERIC_COLUMNS[columnIndex]
        const value = Number.parseInt(word.text, 10)
        if (Number.isFinite(value)) {
          row[key] = value
          candidates.push({ columnIndex, top: word.top, confidence: word.confidence })
        }
      }

      return {
        top: Math.min(...lineWords.map((word) => word.top)),
        totals: totalsWithoutDate(row),
        candidates,
      }
    })
}

function parseDateForRow(tsv: string, rowTop: number): string | null {
  const words = parseTsv(tsv, false)
  const nearby = words
    .filter((word) => {
      const center = word.top + word.height / 2
      return center >= rowTop - 25 && center <= rowTop + 55
    })
    .map((word) => word.text.replace(/[^\w,]/g, ""))
    .filter(Boolean)

  const monthIndex = nearby.findIndex((word) => /^Ma/i.test(word) || /^Jun/i.test(word))
  if (monthIndex < 0) return null

  const month = /^Jun/i.test(nearby[monthIndex]) ? "06" : "05"
  const dayWord = nearby.slice(monthIndex + 1).find((word) => /^\d{1,2},?$/.test(word))
  const yearWord = nearby.slice(monthIndex + 1).find((word) => /\d{4}/.test(word))

  if (!dayWord || !yearWord) return null

  const day = dayWord.replace(",", "").padStart(2, "0")
  const year = yearWord.match(/\d{4}/)?.[0]
  return year ? `${year}-${month}-${day}` : null
}

function isReportTotalRow(row: HousekeepingForecastDailyTotalNoDate) {
  return row.arrivals >= 100 && row.arriving_guests >= 100 && row.departures >= 100 && row.departing_guests >= 100
}

async function correctLowConfidenceCells(
  rows: ParsedNumericRow[],
  worker: Awaited<ReturnType<typeof import("tesseract.js")["createWorker"]>>,
  canvas: any,
  cropX: number,
  cropY: number,
  cropWidth: number,
  scaleRatio: number,
) {
  const needsCorrection = rows.flatMap((row) =>
    row.candidates
      .filter((candidate) => candidate.columnIndex < 6 && candidate.confidence < 80)
      .map((candidate) => ({ row, candidate })),
  )

  if (!needsCorrection.length) return

  await worker.setParameters(({
    tessedit_char_whitelist: "0123456789",
    tessedit_pageseg_mode: 7,
  } as unknown) as Parameters<typeof worker.setParameters>[0])

  for (const { row, candidate } of needsCorrection) {
    const cellWidth = Math.round(54 * scaleRatio)
    const cellHeight = Math.round(34 * scaleRatio)
    const centerX = Math.round(COLUMN_CENTERS[candidate.columnIndex] * cropWidth)
    const sourceX = cropX + centerX - Math.round(cellWidth / 2)
    const sourceY = cropY + candidate.top - Math.round(8 * scaleRatio)
    const cell = (await import("@napi-rs/canvas")).createCanvas(cellWidth, cellHeight) as any
    const cellContext = cell.getContext("2d")

    cellContext.drawImage(canvas, sourceX, sourceY, cellWidth, cellHeight, 0, 0, cellWidth, cellHeight)
    const result = await worker.recognize(cell.toBuffer("image/png"))
    const corrected = Number.parseInt((result.data.text.match(/\d+/) || [])[0] || "", 10)

    if (Number.isFinite(corrected)) {
      const key = NUMERIC_COLUMNS[candidate.columnIndex]
      row.totals[key] = corrected
    }
  }

  await worker.setParameters(({
    tessedit_char_whitelist: "0123456789",
    tessedit_pageseg_mode: 6,
  } as unknown) as Parameters<typeof worker.setParameters>[0])
}

function buildDailyTotals(
  rows: Array<{ date: string | null; totals: HousekeepingForecastDailyTotalNoDate }>,
  reportRange: { startDate: string; endDate: string } | null,
) {
  const dailyByDate = new Map<string, HousekeepingForecastDailyTotal>()
  let parsedReportTotal: HousekeepingForecastDailyTotalNoDate | null = null
  let currentDate: string | null = null
  const detectedDates = new Set<string>()

  for (const row of rows) {
    if (isReportTotalRow(row.totals)) {
      parsedReportTotal = row.totals
      continue
    }

    if (row.date && (!reportRange || isDateInRange(row.date, reportRange.startDate, reportRange.endDate))) {
      currentDate = row.date
      detectedDates.add(row.date)
    }
    if (!currentDate) continue

    const daily = dailyByDate.get(currentDate) || emptyTotals(currentDate)
    addTotals(daily, row.totals)
    dailyByDate.set(currentDate, daily)
  }

  const sortedDates = [...detectedDates].sort()
  const startDate = reportRange?.startDate || sortedDates[0] || new Date().toISOString().slice(0, 10)
  const endDate = reportRange?.endDate || sortedDates[sortedDates.length - 1] || startDate
  const dailyTotals = dateRange(startDate, endDate).map((date) => dailyByDate.get(date) || emptyTotals(date))

  return { dailyTotals, parsedReportTotal, datedRows: rows.filter((row) => row.date).length, startDate, endDate }
}

function validateTotals(
  dailyTotals: HousekeepingForecastDailyTotal[],
  parsedReportTotal: HousekeepingForecastDailyTotalNoDate | null,
  datedRowCount: number,
) {
  const errors: string[] = []
  const warnings: string[] = []
  const computed = sumDailyTotals(dailyTotals)

  if (!datedRowCount) {
    errors.push("No dated detail rows were detected by OCR.")
  }

  if (parsedReportTotal) {
    for (const key of NUMERIC_COLUMNS) {
      if (computed[key] !== parsedReportTotal[key]) {
        warnings.push(`visible detail ${key} sum is ${computed[key]}, page 14 TOTAL is ${parsedReportTotal[key]}.`)
      }
    }
  } else {
    errors.push("Page 14 TOTAL row was not detected by OCR.")
  }

  return {
    matches_report_total: errors.length === 0,
    errors,
    warnings,
  }
}

export async function parseHousekeepingForecastPdf(pdfBuffer: Buffer): Promise<HousekeepingForecastParseResult> {
  const [{ createCanvas }, { createWorker }, pdfjs] = await Promise.all([
    import("@napi-rs/canvas"),
    import("tesseract.js"),
    import("pdfjs-dist/legacy/build/pdf.mjs"),
  ])

  const pdf = await (pdfjs as any).getDocument({ data: new Uint8Array(pdfBuffer), disableWorker: true }).promise
  const worker = await createWorker("eng")
  const rawRows: Array<{ date: string | null; totals: HousekeepingForecastDailyTotalNoDate }> = []
  let reportRange: { startDate: string; endDate: string } | null = null

  try {
    const firstPage = await pdf.getPage(1)
    const headerViewport = firstPage.getViewport({ scale: 3 })
    const headerCanvas = createCanvas(headerViewport.width, headerViewport.height)
    const headerContext = headerCanvas.getContext("2d")

    await firstPage.render(({ canvasContext: headerContext, viewport: headerViewport } as unknown) as Parameters<typeof firstPage.render>[0]).promise

    const headerScaleRatio = headerViewport.width / 612
    const headerCrop = createCanvas(Math.round(560 * headerScaleRatio), Math.round(80 * headerScaleRatio))
    const headerCropContext = headerCrop.getContext("2d")
    headerCropContext.drawImage(
      headerCanvas,
      Math.round(30 * headerScaleRatio),
      Math.round(35 * headerScaleRatio),
      headerCrop.width,
      headerCrop.height,
      0,
      0,
      headerCrop.width,
      headerCrop.height,
    )
    const headerResult = await worker.recognize(headerCrop.toBuffer("image/png"))
    reportRange = parseReportDateRange(headerResult.data.text || "")

    await worker.setParameters(({
      tessedit_char_whitelist: "0123456789",
      tessedit_pageseg_mode: 6,
    } as unknown) as Parameters<typeof worker.setParameters>[0])

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 3 })
      const canvas = createCanvas(viewport.width, viewport.height)
      const context = canvas.getContext("2d")

      await page.render(({ canvasContext: context, viewport } as unknown) as Parameters<typeof page.render>[0]).promise

      const scaleRatio = viewport.width / 612
      const cropX = Math.round(140 * scaleRatio)
      const cropY = Math.round(140 * scaleRatio)
      const cropWidth = Math.round(440 * scaleRatio)
      const cropHeight = Math.round((pageNumber === pdf.numPages ? 595 : 565) * scaleRatio)
      const crop = createCanvas(cropWidth, Math.min(cropHeight, viewport.height - cropY))
      const cropContext = crop.getContext("2d")

      cropContext.drawImage(
        canvas,
        cropX,
        cropY,
        cropWidth,
        crop.height,
        0,
        0,
        cropWidth,
        crop.height,
      )

      const result = await worker.recognize(crop.toBuffer("image/png"), {}, { tsv: true })
      const numericRows = parseNumericRowsFromTsv(result.data.tsv || "", cropWidth)

      await worker.setParameters(({
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,",
        tessedit_pageseg_mode: 6,
      } as unknown) as Parameters<typeof worker.setParameters>[0])

      const dateCrop = createCanvas(Math.round(105 * scaleRatio), crop.height)
      const dateCropContext = dateCrop.getContext("2d")
      dateCropContext.drawImage(
        canvas,
        Math.round(35 * scaleRatio),
        cropY,
        dateCrop.width,
        crop.height,
        0,
        0,
        dateCrop.width,
        crop.height,
      )
      const dateResult = await worker.recognize(dateCrop.toBuffer("image/png"), {}, { tsv: true })

      rawRows.push(
        ...numericRows.map((row) => ({
          date: parseDateForRow(dateResult.data.tsv || "", row.top),
          totals: row.totals,
        })),
      )

      await worker.setParameters(({
        tessedit_char_whitelist: "0123456789",
        tessedit_pageseg_mode: 6,
      } as unknown) as Parameters<typeof worker.setParameters>[0])
    }
  } finally {
    await worker.terminate()
  }

  const { dailyTotals, parsedReportTotal, datedRows, startDate, endDate } = buildDailyTotals(rawRows, reportRange)
  const validation = validateTotals(dailyTotals, parsedReportTotal, datedRows)

  return {
    property: PROPERTY,
    report_name: REPORT_NAME,
    start_date: startDate,
    end_date: endDate,
    daily_totals: dailyTotals,
    grand_totals: parsedReportTotal || sumDailyTotals(dailyTotals),
    validation,
  }
}
