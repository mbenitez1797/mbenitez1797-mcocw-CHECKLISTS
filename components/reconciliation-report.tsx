'use client'

import { useState, useCallback } from 'react'
import { BarChart3, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface ReconciliationEntry {
  date: string
  roomType: string
  previousValues: Record<string, number>
  newValues: Record<string, number>
  changes: Record<string, number>
  reconciled: boolean
}

interface ReconciliationSummary {
  totalRecordsReviewed: number
  recordsMatched: number
  recordsUpdated: number
  recordsNeedingReview: number
  reconciliationDetails: ReconciliationEntry[]
}

export function ReconciliationReport() {
  const [reconciliation, setReconciliation] = useState<ReconciliationSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState<number | null>(null)

  const generateReconciliation = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reconcile', {
        method: 'GET',
      })
      const result = await response.json()
      setReconciliation(result)
    } catch (error) {
      console.error('[v0] Reconciliation error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  if (!reconciliation) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Reconciliation Report
        </h3>
        <button
          onClick={generateReconciliation}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Reconciliation Report'}
        </button>
      </div>
    )
  }

  const matchPercentage = Math.round(
    (reconciliation.recordsMatched / reconciliation.totalRecordsReviewed) * 100
  )

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Reconciliation Report
        </h3>
        <button
          onClick={generateReconciliation}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <div className="text-sm text-gray-600">Total Reviewed</div>
          <div className="text-2xl font-bold">{reconciliation.totalRecordsReviewed}</div>
        </div>
        <div className="bg-green-50 p-4 rounded border border-green-200">
          <div className="flex items-center gap-1 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" />
            Matched
          </div>
          <div className="text-2xl font-bold text-green-700">{reconciliation.recordsMatched}</div>
          <div className="text-xs text-green-600 mt-1">{matchPercentage}%</div>
        </div>
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <div className="text-sm text-blue-700">Updated</div>
          <div className="text-2xl font-bold text-blue-700">{reconciliation.recordsUpdated}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <div className="flex items-center gap-1 text-sm text-yellow-700">
            <AlertTriangle className="w-4 h-4" />
            Needs Review
          </div>
          <div className="text-2xl font-bold text-yellow-700">{reconciliation.recordsNeedingReview}</div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold text-sm mb-4">Detailed Changes:</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Room Type</th>
                <th className="text-center px-3 py-2">Status</th>
                <th className="text-center px-3 py-2">Changes</th>
              </tr>
            </thead>
            <tbody>
              {reconciliation.reconciliationDetails.slice(0, 10).map((entry, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedRow(selectedRow === idx ? null : idx)}
                >
                  <td className="px-3 py-2">{entry.date}</td>
                  <td className="px-3 py-2">{entry.roomType}</td>
                  <td className="text-center px-3 py-2">
                    {entry.reconciled ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600 mx-auto" />
                    )}
                  </td>
                  <td className="text-center px-3 py-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {Object.keys(entry.changes).length} fields
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
