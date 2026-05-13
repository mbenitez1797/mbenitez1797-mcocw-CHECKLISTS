'use client'

import { useState, useCallback } from 'react'
import { AlertCircle, CheckCircle2, Info, TrendingUp, TrendingDown } from 'lucide-react'

interface ValidationIssue {
  type: 'warning' | 'error' | 'info'
  field: string
  message: string
  row?: number
  expectedValue?: number
  actualValue?: number
}

interface DataValidationResult {
  isValid: boolean
  issues: ValidationIssue[]
  recordsProcessed: number
  recordsValid: number
  recordsWithIssues: number
}

export function DataValidationReport() {
  const [validationResult, setValidationResult] = useState<DataValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateData = useCallback(async () => {
    setIsValidating(true)
    try {
      const response = await fetch('/api/validate', {
        method: 'GET',
      })
      const result = await response.json()
      setValidationResult(result)
    } catch (error) {
      console.error('[v0] Validation error:', error)
    } finally {
      setIsValidating(false)
    }
  }, [])

  if (!validationResult) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          Data Validation Report
        </h3>
        <button
          onClick={validateData}
          disabled={isValidating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isValidating ? 'Validating...' : 'Run Validation Check'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {validationResult.isValid ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          Validation Results
        </h3>
        <button
          onClick={validateData}
          disabled={isValidating}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Revalidate
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <div className="text-sm text-gray-600">Total Records</div>
          <div className="text-2xl font-bold">{validationResult.recordsProcessed}</div>
        </div>
        <div className="bg-green-50 p-4 rounded border border-green-200">
          <div className="flex items-center gap-1 text-sm text-green-700">
            <TrendingUp className="w-4 h-4" />
            Valid
          </div>
          <div className="text-2xl font-bold text-green-700">{validationResult.recordsValid}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <div className="flex items-center gap-1 text-sm text-yellow-700">
            <TrendingDown className="w-4 h-4" />
            Issues Found
          </div>
          <div className="text-2xl font-bold text-yellow-700">{validationResult.recordsWithIssues}</div>
        </div>
      </div>

      {validationResult.issues.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Issues Found:</h4>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {validationResult.issues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-3 rounded text-sm border-l-4 ${
                  issue.type === 'error'
                    ? 'bg-red-50 border-red-400 text-red-800'
                    : issue.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                      : 'bg-blue-50 border-blue-400 text-blue-800'
                }`}
              >
                <div className="font-semibold">{issue.field}</div>
                <div>{issue.message}</div>
                {issue.row && <div className="text-xs opacity-75">Row: {issue.row}</div>}
                {issue.expectedValue !== undefined && (
                  <div className="text-xs opacity-75">
                    Expected: {issue.expectedValue}, Got: {issue.actualValue}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
