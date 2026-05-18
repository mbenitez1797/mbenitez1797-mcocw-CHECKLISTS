import { NextRequest, NextResponse } from 'next/server'
import { sendChecklistEmail, type ChecklistSubmission, type ChecklistType } from '@/lib/email'
import { saveChecklistToOneDrive } from '@/lib/onedrive'

const validChecklistTypes: ChecklistType[] = ['am', 'pm', 'night', 'admin', 'agm', 'gm', 'sales', 'housekeeping', 'engineering']
const draftChecklistTypes = new Set(['am', 'pm', 'night'])
const DEFAULT_TABLE = 'app_state'

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const table = process.env.SUPABASE_APP_STATE_TABLE || DEFAULT_TABLE
  return { url, serviceKey, table }
}

function safeTablePath(table: string) {
  return encodeURIComponent(table).replace(/%2E/g, '.')
}

async function markDraftSubmitted(submission: ChecklistSubmission) {
  if (!draftChecklistTypes.has(submission.checklistType)) return

  const { url, serviceKey, table } = supabaseConfig()
  if (!url || !serviceKey) return

  const key = `checklist-draft-${submission.checklistType}-${submission.date}`
  const value = {
    checklistType: submission.checklistType,
    date: submission.date,
    associateName: submission.associateName,
    managerOnDuty: submission.managerOnDuty,
    shiftStartTime: submission.shiftStartTime,
    shiftEndTime: submission.shiftEndTime,
    formData: submission.data,
    submitted: true,
    autoSubmitted: false,
    submittedAt: submission.submittedAt,
    lastSavedAt: new Date().toISOString(),
  }

  await fetch(`${url.replace(/\/$/, '')}/rest/v1/${safeTablePath(table)}?on_conflict=key`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      key,
      value,
      updated_at: new Date().toISOString(),
    }),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { checklistType, associateName, date, shiftStartTime, shiftEndTime, managerOnDuty, data } = body

    // Validate required fields
    if (!checklistType || !validChecklistTypes.includes(checklistType)) {
      return NextResponse.json(
        { error: 'Invalid checklist type' },
        { status: 400 }
      )
    }

    if (!associateName || !date || !shiftStartTime || !shiftEndTime || !managerOnDuty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const submission: ChecklistSubmission = {
      checklistType,
      associateName,
      date,
      shiftStartTime,
      shiftEndTime,
      managerOnDuty,
      data,
      submittedAt: new Date().toISOString(),
    }

    // Send email notification
    const emailResult = await sendChecklistEmail(submission)
    
    // Save to OneDrive
    const oneDriveResult = await saveChecklistToOneDrive(submission)

    // Mark AM/PM/Night cloud drafts submitted so cron does not auto-submit the same checklist later.
    await markDraftSubmitted(submission)

    // Return combined results
    return NextResponse.json({
      success: true,
      email: emailResult,
      oneDrive: oneDriveResult,
      message: 'Checklist submitted successfully',
    })
  } catch (error) {
    console.error('Checklist submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit checklist', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
