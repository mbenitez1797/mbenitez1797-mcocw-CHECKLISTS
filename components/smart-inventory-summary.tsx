"use client"

import { useInventory } from "@/contexts/inventory-context"

export function SmartInventorySummary() {
  const { dailyInventorySnapshot: snap } = useInventory()
  const rooms = snap.rooms

  return (
    <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">Smart Inventory Balancer</h2>
          <p className="text-sm text-slate-500">Powered by the uploaded Month Housekeeping Forecast PDF</p>
        </div>
        <div className="text-sm text-slate-500">Last update: {snap.updatedAt || "Not synced"}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-7">
        <div className="rounded-lg bg-green-50 p-3"><div className="text-xs">Arrivals</div><div className="text-2xl font-bold">{snap.arrivals}</div></div>
        <div className="rounded-lg bg-red-50 p-3"><div className="text-xs">Departures</div><div className="text-2xl font-bold">{snap.departures}</div></div>
        <div className="rounded-lg bg-blue-50 p-3"><div className="text-xs">Stayovers</div><div className="text-2xl font-bold">{snap.stayovers}</div></div>
        <div className="rounded-lg bg-purple-50 p-3"><div className="text-xs">Occupancy</div><div className="text-2xl font-bold">{snap.occupancy}</div></div>
        <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs">Room Total</div><div className="text-2xl font-bold">{snap.roomTotal}</div></div>
        <div className="rounded-lg bg-amber-50 p-3"><div className="text-xs">Available</div><div className="text-2xl font-bold">{snap.available}</div></div>
        <div className="rounded-lg bg-cyan-50 p-3"><div className="text-xs">Committed</div><div className="text-2xl font-bold">{snap.committed}</div></div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
        <div>KING: <b>{rooms.KING}</b></div>
        <div>VIKG: <b>{rooms.VIKG}</b></div>
        <div>QNQN: <b>{rooms.QUEEN}</b></div>
        <div>VIQN: <b>{rooms.VIQN}</b></div>
        <div>SUIT: <b>{rooms.SUITES}</b></div>
      </div>

      <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm">
        <b>Shuffle Recommendation:</b> {snap.recommendations.length ? snap.recommendations.join(" ") : "Upload the Month Housekeeping Forecast PDF to generate recommendations."}
      </div>
    </div>
  )
}
