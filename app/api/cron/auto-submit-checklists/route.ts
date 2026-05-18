import { NextResponse } from "next/server"
import { Resend } from "resend"

const DEFAULT_TABLE = "app_state"
const CHECKLIST_TYPES = ["am", "pm", "night"] as const
const TIME_ZONE = process.env.CHECKLIST_TIMEZONE || "America/New_York"

type ChecklistType = (typeof CHECKLIST_TYPES)[number]

type DraftValue = {
  checklistType?: string
  date?: string
  associateName?: string
  managerOnDuty?: string
  shiftStartTime?: string
  shiftEndTime?: string
  formData?: Record<string, string>
  completedTasks?: string[]
  incompleteTasks?: string[]
  completionPercent?: number
  lastSavedAt?: string
  submitted?: boolean
  autoSubmitted?: boolean
}

type AppStateRow = {
  key: string
  value: DraftValue | null
  updated_at?: string | null
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const table = process.env.SUPABASE_APP_STATE_TABLE || DEFAULT_TABLE

  return { url, serviceKey, table }
}

function safeTablePath(table: string) {
  return encodeURIComponent(table).replace(/%2E/g, ".")
}

async function supabaseFetch(path: string, init?: RequestInit) {
  const { url, serviceKey } = supabaseConfig()
  if (!url || !serviceKey) {
    throw new Error("Supabase checklist draft storage is not configured.")
  }

  return fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      ...(init?.headers || {}),
    },
  })
}

function addDays(date: string, days: number) {
  const base = new Date(`${date}T12:00:00Z`)
  base.setUTCDate(base.getUTCDate() + days)
  return base.toISOString().split("T")[0]
}

function localParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date())

  const get = (type: string) => parts.find((part) => part.type === type)?.value || "00"
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  }
}

function stamp(date: string, hour: number, minute: number) {
  return Number(`${date.replace(/-/g, "")}${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}`)
}

function cutoffFor(checklistType: ChecklistType, date: string) {
  if (checklistType === "am") return { date, hour: 15, minute: 0, label: "3:00 PM" }
  if (checklistType === "pm") return { date, hour: 23, minute: 0, label: "11:00 PM" }
  return { date: addDays(date, 1), hour: 7, minute: 0, label: "7:00 AM" }
}

function isPastCutoff(checklistType: ChecklistType, date: string) {
  const now = localParts()
  const cutoff = cutoffFor(checklistType, date)
  return stamp(now.date, now.hour, now.minute) >= stamp(cutoff.date, cutoff.hour, cutoff.minute)
}

function draftKey(checklistType: string, date: string) {
  return `checklist-draft-${checklistType}-${date}`
}

function candidateKeys() {
  const now = localParts()
  const today = now.date
  const yesterday = addDays(today, -1)
  const keys = new Set<string>()

  for (const type of CHECKLIST_TYPES) {
    keys.add(draftKey(type, today))
    keys.add(draftKey(type, yesterday))
  }

  return Array.from(keys)
}

function checklistName(checklistType: string) {
  if (checklistType === "am") return "AM Front Desk Checklist"
  if (checklistType === "pm") return "PM Front Desk Checklist"
  return "Night Audit Checklist"
}

function list(items?: string[]) {
  if (!items || items.length === 0) return "<li>None recorded</li>"
  return items.map((item) => `<li>${item}</li>`).join("")
}

async function sendAutoSubmitEmail(draft: DraftValue) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { success: false, error: "RESEND_API_KEY is not configured" }

  const to = (process.env.AUTO_SUBMIT_EMAIL || "Michael.Benitez@marriott.com")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)

  if (to.length === 0) return { success: false, error: "AUTO_SUBMIT_EMAIL is not configured" }

  const resend = new Resend(apiKey)
  const checklistType = String(draft.checklistType || "am")
  const subject = `AUTO-SUBMITTED ${checklistName(checklistType)} - ${draft.associateName || "Unknown associate"} - ${draft.date || "Unknown date"}`

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:780px;margin:0 auto;color:#111827">
      <div style="background:#1d4ed8;color:white;padding:18px;border-radius:8px 8px 0 0">
        <h1 style="margin:0;font-size:22px">AUTO-SUBMITTED — ${checklistName(checklistType)}</h1>
        <p style="margin:6px 0 0">Checklist was not manually submitted before cutoff.</p>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:0;padding:18px;background:#f9fafb">
        <p><strong>Associate:</strong> ${draft.associateName || "Not entered"}</p>
        <p><strong>Date:</strong> ${draft.date || "Not entered"}</p>
        <p><strong>Manager on Duty:</strong> ${draft.managerOnDuty || "Not entered"}</p>
        <p><strong>Shift:</strong> ${draft.shiftStartTime || ""} - ${draft.shiftEndTime || ""}</p>
        <p><strong>Completion:</strong> ${draft.completionPercent ?? 0}%</p>
        <p><strong>Last Saved:</strong> ${draft.lastSavedAt || "Unknown"}</p>
        <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:14px;margin-top:14px">
          <h2 style="font-size:16px;margin:0 0 8px;color:#166534">Completed Tasks</h2>
          <ul>${list(draft.completedTasks)}</ul>
        </div>
        <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:14px;margin-top:14px">
          <h2 style="font-size:16px;margin:0 0 8px;color:#991b1b">Incomplete / Unconfirmed Tasks</h2>
          <ul>${list(draft.incompleteTasks)}</ul>
        </div>
        <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:14px;margin-top:14px">
          <h2 style="font-size:16px;margin:0 0 8px">Saved Notes</h2>
          <p><strong>Issues:</strong> ${draft.formData?.issuesNotes || "None entered"}</p>
          <p><strong>Handoff:</strong> ${draft.formData?.handoffNotes || "None entered"}</p>
        </div>
      </div>
    </div>
  `

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Checklist System <onboarding@resend.dev>",
    to,
    subject,
    html,
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

async function markAutoSubmitted(row: AppStateRow) {
  const { table } = supabaseConfig()
  const value = {
    ...(row.value || {}),
    submitted: true,
    autoSubmitted: true,
    autoSubmittedAt: new Date().toISOString(),
  }

  const response = await supabaseFetch(`${safeTablePath(table)}?on_conflict=key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ key: row.key, value, updated_at: new Date().toISOString() }),
  })

  if (!response.ok) throw new Error(await response.text())
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const { table } = supabaseConfig()
  const keys = candidateKeys()
  const keyList = keys.map((key) => `"${key}"`).join(",")

  try {
    const response = await supabaseFetch(`${safeTablePath(table)}?key=in.(${encodeURIComponent(keyList)})&select=key,value,updated_at`, {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) return NextResponse.json({ ok: false, error: await response.text() }, { status: response.status })

    const rows = (await response.json()) as AppStateRow[]
    const processed: string[] = []
    const skipped: string[] = []
    const failures: string[] = []

    for (const row of rows) {
      const value = row.value || {}
      const checklistType = value.checklistType as ChecklistType
      const date = value.date || ""

      if (!CHECKLIST_TYPES.includes(checklistType) || !date) {
        skipped.push(`${row.key}: invalid draft`)
        continue
      }

      if (value.submitted || value.autoSubmitted) {
        skipped.push(`${row.key}: already submitted`)
        continue
      }

      if (!isPastCutoff(checklistType, date)) {
        skipped.push(`${row.key}: before cutoff`)
        continue
      }

      try {
        const email = await sendAutoSubmitEmail(value)
        if (!email.success) throw new Error(email.error || "Email failed")
        await markAutoSubmitted(row)
        processed.push(row.key)
      } catch (error) {
        failures.push(`${row.key}: ${error instanceof Error ? error.message : "Unknown failure"}`)
      }
    }

    return NextResponse.json({ ok: true, processed, skipped, failures })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Auto-submit failed" }, { status: 503 })
  }
}
