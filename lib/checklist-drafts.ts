import { sendChecklistEmail, type ChecklistSubmission, type ChecklistType } from "@/lib/email"

export type ChecklistDraft = {
  id?: string
  checklist_type: ChecklistType
  associate_name: string
  shift_date: string
  shift_start_time?: string
  shift_end_time?: string
  manager_on_duty?: string
  draft_data: Record<string, unknown>
  completed_tasks: string[]
  incomplete_tasks: string[]
  completion_percent: number
  submitted: boolean
  auto_submitted: boolean
  last_saved_at: string
  submitted_at?: string | null
}

const SUPABASE_TABLE = "checklist_drafts"

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return null
  }

  return {
    endpoint: `${url.replace(/\/$/, "")}/rest/v1/${SUPABASE_TABLE}`,
    key,
  }
}

function supabaseHeaders(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  }
}

export function getDraftKey(checklistType: string, shiftDate: string, associateName: string) {
  return `checklist-draft:${checklistType}:${shiftDate}:${associateName.trim().toLowerCase()}`
}

export function calculateCompletion(completedCount: number, totalCount: number) {
  if (!totalCount) return 0
  return Math.round((completedCount / totalCount) * 100)
}

export async function loadChecklistDraft(params: {
  checklistType: ChecklistType
  shiftDate: string
  associateName: string
}): Promise<ChecklistDraft | null> {
  const config = getSupabaseConfig()
  if (!config) return null

  const query = new URLSearchParams({
    checklist_type: `eq.${params.checklistType}`,
    shift_date: `eq.${params.shiftDate}`,
    associate_name: `eq.${params.associateName}`,
    submitted: "eq.false",
    select: "*",
    limit: "1",
  })

  const response = await fetch(`${config.endpoint}?${query}`, {
    headers: supabaseHeaders(config.key),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Supabase draft load failed: ${response.status}`)
  }

  const rows = await response.json()
  return rows[0] ?? null
}

export async function upsertChecklistDraft(draft: ChecklistDraft): Promise<ChecklistDraft | null> {
  const config = getSupabaseConfig()
  if (!config) return null

  const payload = {
    checklist_type: draft.checklist_type,
    associate_name: draft.associate_name,
    shift_date: draft.shift_date,
    shift_start_time: draft.shift_start_time ?? "",
    shift_end_time: draft.shift_end_time ?? "",
    manager_on_duty: draft.manager_on_duty ?? "",
    draft_data: draft.draft_data,
    completed_tasks: draft.completed_tasks,
    incomplete_tasks: draft.incomplete_tasks,
    completion_percent: draft.completion_percent,
    submitted: draft.submitted,
    auto_submitted: draft.auto_submitted,
    last_saved_at: new Date().toISOString(),
    submitted_at: draft.submitted_at ?? null,
  }

  const response = await fetch(`${config.endpoint}?on_conflict=checklist_type,shift_date,associate_name`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(config.key),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Supabase draft save failed: ${response.status} ${text}`)
  }

  const rows = await response.json()
  return rows[0] ?? null
}

export async function markChecklistDraftSubmitted(params: {
  checklistType: ChecklistType
  shiftDate: string
  associateName: string
  autoSubmitted?: boolean
}): Promise<void> {
  const config = getSupabaseConfig()
  if (!config) return

  const query = new URLSearchParams({
    checklist_type: `eq.${params.checklistType}`,
    shift_date: `eq.${params.shiftDate}`,
    associate_name: `eq.${params.associateName}`,
  })

  const response = await fetch(`${config.endpoint}?${query}`, {
    method: "PATCH",
    headers: supabaseHeaders(config.key),
    body: JSON.stringify({
      submitted: true,
      auto_submitted: Boolean(params.autoSubmitted),
      submitted_at: new Date().toISOString(),
      last_saved_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    throw new Error(`Supabase draft submit failed: ${response.status}`)
  }
}

function cutoffForDraft(draft: ChecklistDraft) {
  const cutoffHours: Record<ChecklistType, number | null> = {
    am: 15,
    pm: 23,
    night: 7,
    admin: null,
    agm: null,
    gm: null,
  }

  const hour = cutoffHours[draft.checklist_type]
  if (hour === null) return null

  const date = new Date(`${draft.shift_date}T00:00:00`)
  if (draft.checklist_type === "night") {
    date.setDate(date.getDate() + 1)
  }
  date.setHours(hour, 0, 0, 0)
  return date
}

export async function loadOverdueChecklistDrafts(now = new Date()): Promise<ChecklistDraft[]> {
  const config = getSupabaseConfig()
  if (!config) return []

  const query = new URLSearchParams({
    submitted: "eq.false",
    auto_submitted: "eq.false",
    checklist_type: "in.(am,pm,night)",
    select: "*",
  })

  const response = await fetch(`${config.endpoint}?${query}`, {
    headers: supabaseHeaders(config.key),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Supabase overdue draft load failed: ${response.status}`)
  }

  const rows = (await response.json()) as ChecklistDraft[]
  return rows.filter((draft) => {
    const cutoff = cutoffForDraft(draft)
    return cutoff ? now >= cutoff : false
  })
}

export function buildAutoSubmitData(draft: ChecklistDraft) {
  return {
    status: "AUTO-SUBMITTED - Checklist not completed by cutoff",
    completionPercent: draft.completion_percent,
    lastSavedAt: draft.last_saved_at,
    completedTasks: draft.completed_tasks,
    incompleteTasks: draft.incomplete_tasks,
    notes: {
      issues: draft.draft_data?.issuesNotes ?? "",
      handoff: draft.draft_data?.handoffNotes ?? draft.draft_data?.summaryNotes ?? "",
    },
    draftData: draft.draft_data,
  }
}

export async function autoSubmitDraft(draft: ChecklistDraft) {
  const recipient = process.env.AUTO_SUBMIT_EMAIL || "Michael.Benitez@marriott.com"

  const submission: ChecklistSubmission = {
    checklistType: draft.checklist_type,
    associateName: draft.associate_name,
    date: draft.shift_date,
    shiftStartTime: draft.shift_start_time || "",
    shiftEndTime: draft.shift_end_time || "",
    managerOnDuty: draft.manager_on_duty || "",
    data: buildAutoSubmitData(draft),
    submittedAt: new Date().toISOString(),
  }

  const previousRecipients = process.env.CHECKLIST_RECIPIENT_EMAILS
  process.env.CHECKLIST_RECIPIENT_EMAILS = recipient

  try {
    const email = await sendChecklistEmail(submission)
    await markChecklistDraftSubmitted({
      checklistType: draft.checklist_type,
      shiftDate: draft.shift_date,
      associateName: draft.associate_name,
      autoSubmitted: true,
    })
    return { success: true, email }
  } finally {
    if (previousRecipients === undefined) {
      delete process.env.CHECKLIST_RECIPIENT_EMAILS
    } else {
      process.env.CHECKLIST_RECIPIENT_EMAILS = previousRecipients
    }
  }
}

