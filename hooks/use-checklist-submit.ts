'use client'

import { useState } from 'react'
import type { ChecklistType } from '@/lib/email'

interface SubmissionResult {
  success: boolean
  email?: { success: boolean; error?: string }
  oneDrive?: { success: boolean; fileUrl?: string; error?: string }
  message?: string
  error?: string
}

interface UseChecklistSubmitReturn {
  submit: (data: SubmitData) => Promise<SubmissionResult>
  isSubmitting: boolean
  result: SubmissionResult | null
  reset: () => void
}

interface SubmitData {
  checklistType: ChecklistType
  associateName: string
  date: string
  shiftStartTime: string
  shiftEndTime: string
  managerOnDuty: string
  data: Record<string, unknown>
}

export function useChecklistSubmit(): UseChecklistSubmitReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<SubmissionResult | null>(null)

  const submit = async (data: SubmitData): Promise<SubmissionResult> => {
    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await fetch('/api/checklist/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const errorResult: SubmissionResult = {
          success: false,
          error: responseData.error || 'Failed to submit checklist',
        }
        setResult(errorResult)
        return errorResult
      }

      setResult(responseData)
      return responseData
    } catch (error) {
      const errorResult: SubmissionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
      setResult(errorResult)
      return errorResult
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setResult(null)
    setIsSubmitting(false)
  }

  return { submit, isSubmitting, result, reset }
}



