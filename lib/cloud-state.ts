export type CloudStateResponse<T> = {
  ok: boolean
  key?: string
  value?: T | null
  updatedAt?: string | null
  error?: string
}

export async function loadCloudState<T>(key: string): Promise<T | null> {
  if (typeof window === "undefined") return null

  try {
    const response = await fetch(`/api/inventory-snapshot?key=${encodeURIComponent(key)}`, {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) return null

    const data = (await response.json()) as CloudStateResponse<T>
    return data.ok ? data.value ?? null : null
  } catch {
    return null
  }
}

export async function saveCloudState<T>(key: string, value: T): Promise<boolean> {
  if (typeof window === "undefined") return false

  try {
    const response = await fetch("/api/inventory-snapshot", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    })

    if (!response.ok) return false
    const data = (await response.json()) as CloudStateResponse<T>
    return Boolean(data.ok)
  } catch {
    return false
  }
}
