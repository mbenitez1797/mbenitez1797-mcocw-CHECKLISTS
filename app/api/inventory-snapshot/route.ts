import { NextResponse } from "next/server"

const DEFAULT_TABLE = "app_state"
const ALLOWED_KEYS = new Set([
  "daily-inventory-snapshot",
  "month-housekeeping-forecast-dashboard",
])

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const table = process.env.SUPABASE_APP_STATE_TABLE || DEFAULT_TABLE

  return { url, serviceKey, table }
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

function validateKey(value: string | null) {
  const key = String(value || "").trim()
  return ALLOWED_KEYS.has(key) ? key : null
}

function safeTablePath(table: string) {
  return encodeURIComponent(table).replace(/%2E/g, ".")
}

async function supabaseFetch(path: string, init?: RequestInit) {
  const { url, serviceKey } = supabaseConfig()
  if (!url || !serviceKey) {
    throw new Error("Cloud inventory storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
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
  const key = validateKey(searchParams.get("key"))
  if (!key) return jsonError("Invalid inventory state key.", 400)

  const { table } = supabaseConfig()

  try {
    const response = await supabaseFetch(`${safeTablePath(table)}?key=eq.${encodeURIComponent(key)}&select=key,value,updated_at&limit=1`, {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      const text = await response.text()
      return jsonError(text || "Unable to load cloud inventory state.", response.status)
    }

    const rows = await response.json()
    const row = Array.isArray(rows) ? rows[0] : null
    return NextResponse.json({ ok: true, key, value: row?.value ?? null, updatedAt: row?.updated_at ?? null })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to load cloud inventory state.", 503)
  }
}

export async function PUT(request: Request) {
  let payload: { key?: string; value?: unknown }
  try {
    payload = await request.json()
  } catch {
    return jsonError("Invalid JSON body.", 400)
  }

  const key = validateKey(payload.key || null)
  if (!key) return jsonError("Invalid inventory state key.", 400)
  if (payload.value === undefined || payload.value === null) return jsonError("Missing inventory state value.", 400)

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
        value: payload.value,
        updated_at: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return jsonError(text || "Unable to save cloud inventory state.", response.status)
    }

    const rows = await response.json()
    const row = Array.isArray(rows) ? rows[0] : null
    return NextResponse.json({ ok: true, key, updatedAt: row?.updated_at ?? null })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to save cloud inventory state.", 503)
  }
}
