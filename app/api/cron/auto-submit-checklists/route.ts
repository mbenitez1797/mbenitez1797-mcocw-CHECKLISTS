import { NextRequest, NextResponse } from "next/server"
import { autoSubmitDraft, loadOverdueChecklistDrafts } from "@/lib/checklist-drafts"

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get("authorization")
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const drafts = await loadOverdueChecklistDrafts()
    const results = []

    for (const draft of drafts) {
      try {
        const result = await autoSubmitDraft(draft)
        results.push({
          checklistType: draft.checklist_type,
          associateName: draft.associate_name,
          shiftDate: draft.shift_date,
          success: result.success,
          email: result.email,
        })
      } catch (error) {
        results.push({
          checklistType: draft.checklist_type,
          associateName: draft.associate_name,
          shiftDate: draft.shift_date,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results })
  } catch (error) {
    return NextResponse.json(
      { error: "Auto-submit cron failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

