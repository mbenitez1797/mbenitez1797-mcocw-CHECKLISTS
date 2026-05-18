import { NextResponse } from "next/server"

const DEFAULT_TABLE = "app_state"
const VALID_TYPES = new Set(["am", "pm", "night"])

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const table = process.env.SUPABASE_APP_STATE_TABLE || DEFAULT_TABLE

  return { url, serviceKey, table }
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

function safeTablePath(table: string) {
  return encodeURIComponent(table).replace(/%2E/g, ".")
}

function normalizeType(value: unknown) {
  const checklistType = String(value || "").trim().toLowerCase()
  return VALID_TYPES.has(checklistType) ? checklistType : null
}

function normalizeDate(value: unknown) {
  const date = String(value || "").trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null
}

function draftKey(checklistType: string, date: string) {
  return `checklist-draft-${checklistType}-${date}`
}

async function supabaseFetch(path: string, init?: RequestInit) {
  const { url, serviceKey } = supabaseConfig()
  if (!url || !serviceKey) {
    throw new Error("Cloud checklist draft storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const checklistType = normalizeType(searchParams.get("checklistType"))
  const date = normalizeDate(searchParams.get("date"))

  if (!checklistType || !date) return jsonError("Invalid checklist draft request.", 400)

  const key = draftKey(checklistType, date)
  const { table } = supabaseConfig()

  try {
    const response = await supabaseFetch(`${safeTablePath(table)}?key=eq.${encodeURIComponent(key)}&select=key,value,updated_at&limit=1`, {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      const text = await response.text()
      return jsonError(text || "Unable to load checklist draft.", response.status)
    }

    const rows = await response.json()
    const row = Array.isArray(rows) ? rows[0] : null
    return NextResponse.json({ ok: true, key, value: row?.value ?? null, updatedAt: row?.updated_at ?? null })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to load checklist draft.", 503)
  }
}

export async function PUT(request: Request) {
  let payload: { checklistType?: unknown; date?: unknown; value?: Record<string, unknown> }

  try {
    payload = await request.json()
  } catch {
    return jsonError("Invalid JSON body.", 400)
  }

  const checklistType = normalizeType(payload.checklistType)
  const date = normalizeDate(payload.date)

  if (!checklistType || !date) return jsonError("Invalid checklist draft request.", 400)
  if (!payload.value || typeof payload.value !== "object") return jsonError("Missing checklist draft value.", 400)

  const key = draftKey(checklistType, date)
  const { table } = supabaseConfig()

  try {
    const response = await supabaseFetch(`${safeTablePath(table)}?on_conflict=key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        key,
        value: {
          ...payload.value,
          checklistType,
          date,
          lastSavedAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return jsonError(text || "Unable to save checklist draft.", response.status)
    }

    const rows = await response.json()
    const row = Array.isArray(rows) ? rows[0] : null
    return NextResponse.json({ ok: true, key, updatedAt: row?.updated_at ?? null })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to save checklist draft.", 503)
  }
}
