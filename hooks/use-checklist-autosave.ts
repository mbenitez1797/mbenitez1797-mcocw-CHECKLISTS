"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { ChecklistType } from "@/lib/email"
import type { TaskDefinition } from "@/lib/streamlined-schemas"

type ChecklistFormData = {
  associateName: string
  date: string
  shiftStartTime?: string
  shiftEndTime?: string
  managerOnDuty?: string
  [key: string]: unknown
}

function getDraftKey(checklistType: string, shiftDate: string, associateName: string) {
  return `checklist-draft:${checklistType}:${shiftDate}:${associateName.trim().toLowerCase()}`
}

interface UseChecklistAutosaveOptions<T extends ChecklistFormData> {
  checklistType: ChecklistType
  storageKey: string
  form: UseFormReturn<T>
  tasks: Record<string, TaskDefinition>
}

export function useChecklistAutosave<T extends ChecklistFormData>({
  checklistType,
  storageKey,
  form,
  tasks,
}: UseChecklistAutosaveOptions<T>) {
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "offline">("idle")
  const loadedCloudKey = useRef<string | null>(null)
  const watchedValues = form.watch()
  const taskIds = useMemo(() => Object.keys(tasks), [tasks])

  const buildTaskState = useCallback((values: T) => {
    const completed = taskIds.filter((id) => values[id] === true).map((id) => tasks[id].label)
    const incomplete = taskIds.filter((id) => values[id] !== true).map((id) => tasks[id].label)
    const completionPercent = taskIds.length ? Math.round((completed.length / taskIds.length) * 100) : 0

    return { completed, incomplete, completionPercent }
  }, [taskIds, tasks])

  const persist = useCallback(async (values: T, options: { submitted?: boolean; autoSubmitted?: boolean } = {}) => {
    if (!values.associateName || !values.date) {
      localStorage.setItem(storageKey, JSON.stringify(values))
      return
    }

    const { completed, incomplete, completionPercent } = buildTaskState(values)
    const payload = {
      checklist_type: checklistType,
      associate_name: values.associateName,
      shift_date: values.date,
      shift_start_time: values.shiftStartTime || "",
      shift_end_time: values.shiftEndTime || "",
      manager_on_duty: values.managerOnDuty || "",
      draft_data: values,
      completed_tasks: completed,
      incomplete_tasks: incomplete,
      completion_percent: completionPercent,
      submitted: Boolean(options.submitted),
      auto_submitted: Boolean(options.autoSubmitted),
      last_saved_at: new Date().toISOString(),
      submitted_at: options.submitted ? new Date().toISOString() : null,
    }

    localStorage.setItem(storageKey, JSON.stringify(values))
    localStorage.setItem(getDraftKey(checklistType, values.date, values.associateName), JSON.stringify(payload))
    setSaveStatus("saving")

    try {
      const response = await fetch("/api/checklist-drafts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Draft cloud save failed")
      }

      setLastSavedAt(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
      setSaveStatus("saved")
    } catch {
      setSaveStatus("offline")
    }
  }, [buildTaskState, checklistType, storageKey])

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        form.reset({ ...form.getValues(), ...JSON.parse(saved) })
      } catch {
        localStorage.removeItem(storageKey)
      }
    }
  }, [form, storageKey])

  useEffect(() => {
    const values = form.getValues()
    if (!values.associateName || !values.date) return

    const key = getDraftKey(checklistType, values.date, values.associateName)
    if (loadedCloudKey.current === key) return
    loadedCloudKey.current = key

    const controller = new AbortController()
    const query = new URLSearchParams({
      checklist_type: checklistType,
      shift_date: values.date,
      associate_name: values.associateName,
    })

    fetch(`/api/checklist-drafts?${query}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((body) => {
        if (body?.draft?.draft_data) {
          form.reset({ ...form.getValues(), ...body.draft.draft_data })
          localStorage.setItem(storageKey, JSON.stringify(body.draft.draft_data))
        }
      })
      .catch(() => undefined)

    return () => controller.abort()
  }, [checklistType, form, storageKey, watchedValues.associateName, watchedValues.date])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      persist(form.getValues())
    }, 800)

    return () => window.clearTimeout(timeout)
  }, [form, persist, watchedValues])

  const saveNow = useCallback(() => persist(form.getValues()), [form, persist])

  const clearDraft = useCallback(async () => {
    const values = form.getValues()
    localStorage.removeItem(storageKey)
    if (values.associateName && values.date) {
      localStorage.removeItem(getDraftKey(checklistType, values.date, values.associateName))
      await fetch("/api/checklist-drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklist_type: checklistType,
          shift_date: values.date,
          associate_name: values.associateName,
        }),
      }).catch(() => undefined)
    }
  }, [checklistType, form, storageKey])

  return {
    completedTasks: buildTaskState(form.getValues()).completed,
    incompleteTasks: buildTaskState(form.getValues()).incomplete,
    completionPercent: buildTaskState(form.getValues()).completionPercent,
    saveStatus,
    lastSavedAt,
    saveNow,
    clearDraft,
  }
}
