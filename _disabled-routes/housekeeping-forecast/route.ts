import { NextResponse } from "next/server"
import { parseHousekeepingForecastPdf } from "@/lib/housekeeping-forecast-parser"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload a PDF file under the form field named file." }, { status: 400 })
    }

    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json({ error: "Housekeeping Forecast upload must be a PDF." }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const parsed = await parseHousekeepingForecastPdf(buffer)
    const status = parsed.validation.matches_report_total ? 200 : 422

    return NextResponse.json(parsed, { status })
  } catch (error) {
    console.error("Housekeeping Forecast OCR parse failed:", error)
    return NextResponse.json(
      {
        error: "Failed to OCR and parse the Housekeeping Forecast PDF.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

