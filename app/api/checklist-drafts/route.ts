import { NextRequest, NextResponse } from "next/server"
import {
  loadChecklistDraft,
  markChecklistDraftSubmitted,
  upsertChecklistDraft,
  type ChecklistDraft,
} from "@/lib/checklist-drafts"
import type { ChecklistType } from "@/lib/email"

const validChecklistTypes: ChecklistType[] = ["am", "pm", "night", "admin", "agm", "gm"]

function validType(value: string | null): value is ChecklistType {
  return Boolean(value && validChecklistTypes.includes(value as ChecklistType))
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const checklistType = searchParams.get("checklist_type")
  const shiftDate = searchParams.get("shift_date")
  const associateName = searchParams.get("associate_name")

  if (!validType(checklistType) || !shiftDate || !associateName) {
    return NextResponse.json({ error: "Missing or invalid draft lookup fields" }, { status: 400 })
  }

  try {
    const draft = await loadChecklistDraft({ checklistType, shiftDate, associateName })
    return NextResponse.json({ success: true, draft })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load draft", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!validType(body.checklist_type) || !body.shift_date || !body.associate_name) {
      return NextResponse.json({ error: "Missing or invalid draft save fields" }, { status: 400 })
    }

    const draft: ChecklistDraft = {
      checklist_type: body.checklist_type,
      associate_name: body.associate_name,
      shift_date: body.shift_date,
      shift_start_time: body.shift_start_time || "",
      shift_end_time: body.shift_end_time || "",
      manager_on_duty: body.manager_on_duty || "",
      draft_data: body.draft_data || {},
      completed_tasks: body.completed_tasks || [],
      incomplete_tasks: body.incomplete_tasks || [],
      completion_percent: Number(body.completion_percent || 0),
      submitted: Boolean(body.submitted),
      auto_submitted: Boolean(body.auto_submitted),
      last_saved_at: new Date().toISOString(),
      submitted_at: body.submitted_at || null,
    }

    const saved = await upsertChecklistDraft(draft)
    return NextResponse.json({ success: true, draft: saved })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save draft", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    if (!validType(body.checklist_type) || !body.shift_date || !body.associate_name) {
      return NextResponse.json({ error: "Missing or invalid submit fields" }, { status: 400 })
    }

    await markChecklistDraftSubmitted({
      checklistType: body.checklist_type,
      shiftDate: body.shift_date,
      associateName: body.associate_name,
      autoSubmitted: Boolean(body.auto_submitted),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to mark draft submitted", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

