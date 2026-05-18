"use client"

import { useEffect, useMemo, useRef, useState } from "react"

export type ChecklistBrowserAutosaveProps = {
  checklistType: "am" | "pm" | "night"
  title: string
  cutoffLabel: string
}

type DraftPayload = {
  checklistType: string
  date: string
  associateName?: string
  managerOnDuty?: string
  shiftStartTime?: string
  shiftEndTime?: string
  formData: Record<string, string>
  completedTasks: string[]
  incompleteTasks: string[]
  completionPercent: number
  lastSavedAt: string
  submitted?: boolean
  autoSubmitted?: boolean
}

function todayISO() {
  return new Date().toISOString().split("T")[0]
}

function getTaskInputs(form: HTMLFormElement) {
  return Array.from(form.querySelectorAll<HTMLInputElement>('input[data-checklist-task-hidden="true"]'))
}

function getCompletion(form: HTMLFormElement) {
  const taskInputs = getTaskInputs(form)
  const completed = taskInputs.filter((input) => input.value === "true")
  const total = taskInputs.length
  return {
    total,
    completedCount: completed.length,
    percent: total > 0 ? Math.round((completed.length / total) * 100) : 0,
    completedTasks: completed.map((input) => input.dataset.checklistTaskLabel || input.name),
    incompleteTasks: taskInputs
      .filter((input) => input.value !== "true")
      .map((input) => input.dataset.checklistTaskLabel || input.name),
  }
}

function collectDraft(form: HTMLFormElement, checklistType: string): DraftPayload {
  const formData = new FormData(form)
  const values: Record<string, string> = {}

  formData.forEach((value, key) => {
    values[key] = String(value)
  })

  const completion = getCompletion(form)
  const date = values.date || todayISO()

  return {
    checklistType,
    date,
    associateName: values.associateName || "",
    managerOnDuty: values.managerOnDuty || "",
    shiftStartTime: values.shiftStartTime || "",
    shiftEndTime: values.shiftEndTime || "",
    formData: values,
    completedTasks: completion.completedTasks,
    incompleteTasks: completion.incompleteTasks,
    completionPercent: completion.percent,
    lastSavedAt: new Date().toISOString(),
    submitted: false,
    autoSubmitted: false,
  }
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set
  const prototype = Object.getPrototypeOf(element)
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value)
  } else if (valueSetter) {
    valueSetter.call(element, value)
  } else {
    element.value = value
  }

  element.dispatchEvent(new Event("input", { bubbles: true }))
  element.dispatchEvent(new Event("change", { bubbles: true }))
}

function restoreDraft(form: HTMLFormElement, draft: DraftPayload) {
  const values = draft.formData || {}

  Object.entries(values).forEach(([key, value]) => {
    const textField = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`input[name="${CSS.escape(key)}"], textarea[name="${CSS.escape(key)}"]`)
    if (textField && textField.type !== "hidden") {
      setNativeValue(textField, value)
      return
    }

    const taskButton = form.querySelector<HTMLElement>(`#${CSS.escape(key)}`)
    if (!taskButton) return

    const shouldBeChecked = value === "true"
    const ariaChecked = taskButton.getAttribute("aria-checked")
    const isChecked = ariaChecked === "true"
    if (shouldBeChecked !== isChecked) taskButton.click()
  })
}

export function ChecklistBrowserAutosave({ checklistType, title, cutoffLabel }: ChecklistBrowserAutosaveProps) {
  const [percent, setPercent] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [status, setStatus] = useState("Loading saved draft...")
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restored = useRef(false)

  const storageKey = useMemo(() => `checklist-draft-${checklistType}-${todayISO()}`, [checklistType])

  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>("form")
    if (!form) {
      setStatus("Draft saver waiting for checklist form...")
      return
    }

    const refreshProgress = () => {
      const completion = getCompletion(form)
      setPercent(completion.percent)
      setCompletedCount(completion.completedCount)
      setTotalCount(completion.total)
    }

    const saveDraft = async () => {
      refreshProgress()
      const draft = collectDraft(form, checklistType)
      const key = `checklist-draft-${checklistType}-${draft.date || todayISO()}`
      localStorage.setItem(key, JSON.stringify(draft))
      localStorage.setItem(storageKey, JSON.stringify(draft))

      try {
        const response = await fetch("/api/checklist-drafts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checklistType, date: draft.date, value: draft }),
        })
        setStatus(response.ok ? `Saved to web ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Saved locally; web save failed")
      } catch {
        setStatus("Saved locally; web save offline")
      }
    }

    const scheduleSave = () => {
      refreshProgress()
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(saveDraft, 900)
    }

    const loadDraft = async () => {
      try {
        const dateInput = form.querySelector<HTMLInputElement>('input[name="date"]')
        const draftDate = dateInput?.value || todayISO()
        const response = await fetch(`/api/checklist-drafts?checklistType=${encodeURIComponent(checklistType)}&date=${encodeURIComponent(draftDate)}`, { cache: "no-store" })
        const cloud = response.ok ? await response.json() : null
        const cloudDraft = cloud?.ok ? cloud.value as DraftPayload | null : null
        const localDraft = localStorage.getItem(`checklist-draft-${checklistType}-${draftDate}`) || localStorage.getItem(storageKey)
        const parsedLocal = localDraft ? JSON.parse(localDraft) as DraftPayload : null
        const draft = cloudDraft || parsedLocal

        if (draft && !restored.current) {
          restored.current = true
          restoreDraft(form, draft)
          setStatus(cloudDraft ? "Restored saved web draft" : "Restored saved local draft")
          setTimeout(refreshProgress, 250)
        } else {
          setStatus("Autosave ready")
          refreshProgress()
        }
      } catch {
        setStatus("Autosave ready")
        refreshProgress()
      }
    }

    const observer = new MutationObserver(refreshProgress)
    observer.observe(form, { attributes: true, subtree: true, attributeFilter: ["value", "aria-checked", "data-state"] })

    form.addEventListener("input", scheduleSave)
    form.addEventListener("change", scheduleSave)
    form.addEventListener("click", scheduleSave)

    loadDraft()
    const progressTimer = setInterval(refreshProgress, 1500)

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      clearInterval(progressTimer)
      observer.disconnect()
      form.removeEventListener("input", scheduleSave)
      form.removeEventListener("change", scheduleSave)
      form.removeEventListener("click", scheduleSave)
    }
  }, [checklistType, storageKey])

  return (
    <div className="sticky top-0 z-20 rounded-lg border border-blue-200 bg-white/95 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-950">{title} progress</p>
          <p className="text-xs text-muted-foreground">{completedCount} of {totalCount} tasks complete • {status} • Auto-submit cutoff: {cutoffLabel}</p>
        </div>
        <p className="text-lg font-bold text-blue-700">{percent}%</p>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-blue-100">
        <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
