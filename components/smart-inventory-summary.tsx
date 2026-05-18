"use client"

import { useEffect, useState } from "react"

type Snapshot = {
  arrivals?: number
  departures?: number
  stayovers?: number
  occupancy?: string
  roomTotal?: number
  available?: number
  rooms?: {
    KING?: number
    VIKG?: number
    QNQN?: number
    QUEEN?: number
    QUEENS?: number
    VIQN?: number
    SUIT?: number
    SUITES?: number
  }
  recommendations?: string[]
  updatedAt?: string
}

export function SmartInventorySummary() {
  const [snap, setSnap] = useState<Snapshot | null>(null)

  const load = () => {
    try {
      const raw = localStorage.getItem("daily-inventory-snapshot")
      setSnap(raw ? JSON.parse(raw) : null)
    } catch {
      setSnap(null)
    }
  }

  useEffect(() => {
    load()
    window.addEventListener("daily-inventory-updated", load)
    window.addEventListener("storage", load)
    return () => {
      window.removeEventListener("daily-inventory-updated", load)
      window.removeEventListener("storage", load)
    }
  }, [])

  const rooms = snap?.rooms || {}
  const total =
    (rooms.KING || 0) +
    (rooms.VIKG || 0) +
    (rooms.QNQN || rooms.QUEEN || rooms.QUEENS || 0) +
    (rooms.VIQN || 0) +
    (rooms.SUIT || rooms.SUITES || 0)

  return (
    <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Smart Inventory Balancer</h2>
          <p className="text-sm text-slate-500">Powered by today’s uploaded GA Summary + Room Availability files</p>
        </div>
        <div className="text-sm text-slate-500">Last update: {snap?.updatedAt || "Not synced"}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-7">
        <div className="rounded-lg bg-green-50 p-3"><div className="text-xs">Arrivals</div><div className="text-2xl font-bold">{snap?.arrivals ?? 0}</div></div>
        <div className="rounded-lg bg-red-50 p-3"><div className="text-xs">Departures</div><div className="text-2xl font-bold">{snap?.departures ?? 0}</div></div>
        <div className="rounded-lg bg-blue-50 p-3"><div className="text-xs">Stayovers</div><div className="text-2xl font-bold">{snap?.stayovers ?? 0}</div></div>
        <div className="rounded-lg bg-purple-50 p-3"><div className="text-xs">Occupancy</div><div className="text-2xl font-bold">{snap?.occupancy || "0%"}</div></div>
        <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs">Room Total</div><div className="text-2xl font-bold">{snap?.roomTotal ?? 0}</div></div>
        <div className="rounded-lg bg-amber-50 p-3"><div className="text-xs">Available</div><div className="text-2xl font-bold">{snap?.available ?? total}</div></div>
        <div className="rounded-lg bg-cyan-50 p-3"><div className="text-xs">Counted Total</div><div className="text-2xl font-bold">{total}</div></div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
        <div>KING: <b>{rooms.KING ?? 0}</b></div>
        <div>VIKG: <b>{rooms.VIKG ?? 0}</b></div>
        <div>QNQN: <b>{rooms.QNQN ?? rooms.QUEEN ?? rooms.QUEENS ?? 0}</b></div>
        <div>VIQN: <b>{rooms.VIQN ?? 0}</b></div>
        <div>SUIT: <b>{rooms.SUIT ?? rooms.SUITES ?? 0}</b></div>
      </div>

      <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm">
        <b>Shuffle Recommendation:</b>{" "}
        {snap?.recommendations?.length ? snap.recommendations.join(" ") : "Upload today’s reports to generate recommendations."}
      </div>
    </div>
  )
}
