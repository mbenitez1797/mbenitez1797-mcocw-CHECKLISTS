"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormProgress } from "@/components/form-progress"
import { ChecklistTask, ChecklistSection } from "@/components/checklist-task"
import { ChecklistActions } from "@/components/checklist-actions"
import { ChecklistCompletionProgress } from "@/components/checklist-completion-progress"
import { useChecklistAutosave } from "@/hooks/use-checklist-autosave"
import { useChecklistSubmit } from "@/hooks/use-checklist-submit"
import { ChevronLeft, ChevronRight, CheckCircle2, Send, Save, Home, Loader2, AlertCircle, Monitor, MessageSquare, FileText, CreditCard } from "lucide-react"
import {
  nightStreamlinedSchema,
  type NightStreamlinedFormData,
  STREAMLINED_STEPS,
  nightTasks,
} from "@/lib/streamlined-schemas"

const STORAGE_KEY = "night-streamlined-checklist-draft"

const nightSystems = [
  { name: "Stay PMS", icon: Monitor, description: "Reservations, audit, rooms" },
  { name: "GXP", icon: MessageSquare, description: "Guest requests & issues" },
  { name: "Ledger", icon: CreditCard, description: "Payments & balances" },
  { name: "Reports", icon: FileText, description: "Night audit reports" },
]

function QuickReferenceCard() {
  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-3">Quick Reference - Key Systems</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {nightSystems.map((system) => (
          <div key={system.name} className="flex items-center gap-2 text-sm">
            <system.icon className="h-4 w-4 text-primary shrink-0" />
            <div>
              <span className="font-medium">{system.name}</span>
              <p className="text-xs text-muted-foreground">{system.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const defaultValues: NightStreamlinedFormData = {
  associateName: "",
  date: new Date().toISOString().split("T")[0],
  shiftStartTime: "23:00",
  shiftEndTime: "07:00",
  managerOnDuty: "",
  reviewPMHandoff: false,
  reviewLateArrivalsNoShow: false,
  reviewRoomInventory: false,
  reviewPaymentsFoliosCash: false,
  reviewGXPOvernight: false,
  collectDepositsIncidentals: false,
  completeNoShowProcess: false,
  confirmPreAuditReadiness: false,
  completeNightAudit: false,
  verifyBusinessDateRolled: false,
  reviewRequiredReports: false,
  issuesNotes: "",
  prepareAMHandoff: false,
  handoffNotes: "",
  confirmAllTasksComplete: false,
  confirmHandoffReady: false,
}

export function StreamlinedNightForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { submit, isSubmitting, result } = useChecklistSubmit()

  const form = useForm<NightStreamlinedFormData>({
    resolver: zodResolver(nightStreamlinedSchema),
    defaultValues,
  })

  const { control, handleSubmit, watch, setValue, reset } = form
  const autosave = useChecklistAutosave({
    checklistType: "night",
    storageKey: STORAGE_KEY,
    form,
    tasks: nightTasks,
  })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        Object.keys(parsed).forEach((key) => {
          setValue(key as keyof NightStreamlinedFormData, parsed[key])
        })
      } catch (e) {
        console.error("Failed to load saved progress", e)
      }
    }
  }, [setValue])

  const saveProgress = () => {
    const data = form.getValues()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    autosave.saveNow()
    setSaveMessage("Progress saved!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const clearSavedProgress = () => { localStorage.removeItem(STORAGE_KEY); autosave.clearDraft() }
  const nextStep = () => { if (currentStep < STREAMLINED_STEPS.length - 1) setCurrentStep(currentStep + 1) }
  const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1) }

  const getCompletedTaskLabels = (): string[] => {
    const completed: string[] = []
    const values = form.getValues()
    Object.keys(nightTasks).forEach((key) => {
      if (values[key as keyof NightStreamlinedFormData] === true) {
        completed.push(nightTasks[key].label)
      }
    })
    return completed
  }

  const getIncompleteTaskLabels = (): string[] => {
    const incomplete: string[] = []
    const values = form.getValues()
    Object.keys(nightTasks).forEach((key) => {
      if (values[key as keyof NightStreamlinedFormData] !== true) {
        incomplete.push(nightTasks[key].label)
      }
    })
    return incomplete
  }

  const onSubmit = async (data: NightStreamlinedFormData) => {
    setSubmitError(null)
    const result = await submit({
      checklistType: "night",
      associateName: data.associateName,
      date: data.date,
      shiftStartTime: data.shiftStartTime || "",
      shiftEndTime: data.shiftEndTime || "",
      managerOnDuty: data.managerOnDuty || "",
      data,
    })
    if (result.success) {
      clearSavedProgress()
      setIsSubmitted(true)
    } else {
      setSubmitError(result.error || "Failed to submit checklist")
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Checklist Submitted</h2>
          <p className="text-muted-foreground max-w-md">
            Your Night Audit Checklist has been successfully submitted. The AM shift team has been notified.
          </p>
          {result?.oneDrive?.fileUrl && (
            <p className="text-sm text-muted-foreground">A copy has been saved to OneDrive.</p>
          )}
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => { setIsSubmitted(false); setCurrentStep(0); reset(defaultValues) }}>
              Submit Another Checklist
            </Button>
            <Button asChild>
              <Link href="/"><Home className="w-4 h-4 mr-2" />Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Night Audit Checklist</h1>
          <p className="text-muted-foreground">Night shift operations and audit checklist</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && <span className="text-sm text-green-600 font-medium">{saveMessage}</span>}
          <Button type="button" variant="outline" size="sm" onClick={saveProgress}>
            <Save className="w-4 h-4 mr-2" />Save Progress
          </Button>
          <ChecklistActions
            checklistType="night"
            associateName={watch("associateName")}
            date={watch("date")}
            shiftStartTime={watch("shiftStartTime") || ""}
            shiftEndTime={watch("shiftEndTime") || ""}
            managerOnDuty={watch("managerOnDuty") || ""}
            completedTasks={getCompletedTaskLabels()}
            incompleteTasks={getIncompleteTaskLabels()}
            notes={watch("handoffNotes")}
            onClearAll={() => reset(defaultValues)}
          />
        </div>
      </div>

      <FormProgress currentStep={currentStep} totalSteps={STREAMLINED_STEPS.length} stepLabels={STREAMLINED_STEPS} />
      <ChecklistCompletionProgress
        title="Night Audit Checklist"
        completed={autosave.completedTasks.length}
        total={Object.keys(nightTasks).length}
      />

      {/* Step 0: Snapshot */}
      {currentStep === 0 && (
        <>
          <QuickReferenceCard />
          <ChecklistSection title="Snapshot" description="Start of shift overview and status check">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-card border border-border rounded-lg">
              <div>
                <Label htmlFor="associateName">Associate Name *</Label>
                <Controller name="associateName" control={control} render={({ field }) => (
                  <Input id="associateName" {...field} placeholder="Your name" className="mt-1" />
                )} />
              </div>
              <div>
                <Label htmlFor="date">Date *</Label>
                <Controller name="date" control={control} render={({ field }) => (
                  <Input id="date" type="date" {...field} className="mt-1" />
                )} />
              </div>
              <div>
                <Label htmlFor="shiftStartTime">Shift Start</Label>
                <Controller name="shiftStartTime" control={control} render={({ field }) => (
                  <Input id="shiftStartTime" type="time" {...field} className="mt-1" />
                )} />
              </div>
              <div>
                <Label htmlFor="managerOnDuty">Manager on Duty</Label>
                <Controller name="managerOnDuty" control={control} render={({ field }) => (
                  <Input id="managerOnDuty" {...field} placeholder="MOD name" className="mt-1" />
                )} />
              </div>
            </div>

            <Controller name="reviewPMHandoff" control={control} render={({ field }) => (
              <ChecklistTask id={nightTasks.reviewPMHandoff.id} label={nightTasks.reviewPMHandoff.label} instruction={nightTasks.reviewPMHandoff.instruction} systems={nightTasks.reviewPMHandoff.systems} checked={field.value} onCheckedChange={field.onChange} />
            )} />

            <Controller name="reviewLateArrivalsNoShow" control={control} render={({ field }) => (
              <ChecklistTask id={nightTasks.reviewLateArrivalsNoShow.id} label={nightTasks.reviewLateArrivalsNoShow.label} instruction={nightTasks.reviewLateArrivalsNoShow.instruction} systems={nightTasks.reviewLateArrivalsNoShow.systems} checked={field.value} onCheckedChange={field.onChange} />
            )} />

            <Controller name="reviewRoomInventory" control={control} render={({ field }) => (
              <ChecklistTask id={nightTasks.reviewRoomInventory.id} label={nightTasks.reviewRoomInventory.label} instruction={nightTasks.reviewRoomInventory.instruction} systems={nightTasks.reviewRoomInventory.systems} checked={field.value} onCheckedChange={field.onChange} />
            )} />
          </ChecklistSection>
        </>
      )}

      {/* Step 1: Priority Review */}
      {currentStep === 1 && (
        <ChecklistSection title="Priority Review" description="Review payments, folios, and GXP cases">
          <Controller name="reviewPaymentsFoliosCash" control={control} render={({ field }) => (
            <ChecklistTask id={nightTasks.reviewPaymentsFoliosCash.id} label={nightTasks.reviewPaymentsFoliosCash.label} instruction={nightTasks.reviewPaymentsFoliosCash.instruction} systems={nightTasks.reviewPaymentsFoliosCash.systems} checked={field.value} onCheckedChange={field.onChange} />
          )} />

          <Controller name="reviewGXPOvernight" control={control} render={({ field }) => (
            <ChecklistTask id={nightTasks.reviewGXPOvernight.id} label={nightTasks.reviewGXPOvernight.label} instruction={nightTasks.reviewGXPOvernight.instruction} systems={nightTasks.reviewGXPOvernight.systems} checked={field.value} onCheckedChange={field.onChange} />
          )} />

          <Controller name="collectDepositsIncidentals" control={control} render={({ field }) => (
            <ChecklistTask id={nightTasks.collectDepositsIncidentals.id} label={nightTasks.collectDepositsIncidentals.label} instruction={nightTasks.collectDepositsIncidentals.instruction} systems={nightTasks.collectDepositsIncidentals.systems} checked={field.value} onCheckedChange={field.onChange} />
          )} />
        </ChecklistSection>
      )}

      {/* Step 2: Critical Tasks */}
      {currentStep === 2 && (
        <ChecklistSection title="Critical Tasks" description="Complete night audit and required reports">
          <Controller name="completeNoShowProcess" control={control} render={({ field }) => (
            <ChecklistTask id={nightTasks.completeNoShowProcess.id} label={nightTasks.completeNoShowProcess.label} instruction={nightTasks.completeNoShowProcess.instruction} systems={nightTasks.completeNoShowProcess.systems} checked={field.value} onCheckedChange={field.onChange} />
          )} />

          <Controller name="confirmPreAuditReadiness" control={control} render={({ field }) => (
            <ChecklistTask id={nightTasks.confirmPreAuditReadiness.id} label={nightTasks.confirmPreAuditReadiness.label} instruction={nightTasks.confirmPreAuditReadiness.instruction} systems={nightTasks.confirmPreAuditReadiness.systems} checked={field.value} onCheckedChange={field.onChange} />
          )} />

          <Controller name="completeNightAudit" control={control} render={({ field }) => (
            <ChecklistTask id={nightTasks.completeNightAudit.id} label={nightTasks.completeNightAudit.label} instruction={nightTasks.completeNightAudit.instruction} systems={nightTasks.completeNightAudit.systems} checked={field.value} onCheckedChange={field.onChange} />
          )} />

          <Controller name="verifyBusinessDateRolled" control={control} render={({ field }) => (
            <ChecklistTask id={nightTasks.verifyBusinessDateRolled.id} label={nightTasks.verifyBusinessDateRolled.label} instruction={nightTasks.verifyBusinessDateRolled.instruction} systems={nightTasks.verifyBusinessDateRolled.systems} checked={field.value} onCheckedChange={field.onChange} />
          )} />

          <Controller name="reviewRequiredReports" control={control} render={({ field }) => (
            <ChecklistTask id={nightTasks.reviewRequiredReports.id} label={nightTasks.reviewRequiredReports.label} instruction={nightTasks.reviewRequiredReports.instruction} systems={nightTasks.reviewRequiredReports.systems} checked={field.value} onCheckedChange={field.onChange} />
          )} />
        </ChecklistSection>
      )}

      {/* Step 3: Issues / Exceptions */}
      {currentStep === 3 && (
        <ChecklistSection title="Issues / Exceptions" description="Document any issues, exceptions, or concerns">
          <div className="p-4 bg-card border border-border rounded-lg">
            <Label htmlFor="issuesNotes">Issues, Exceptions, or Concerns</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">
              Document any unresolved issues, no-show exceptions, billing problems, room concerns, or items requiring follow-up.
            </p>
            <Controller name="issuesNotes" control={control} render={({ field }) => (
              <Textarea id="issuesNotes" {...field} placeholder="Document any issues, exceptions, or concerns..." className="min-h-[150px]" />
            )} />
          </div>
        </ChecklistSection>
      )}

      {/* Step 4: Handoff / Summary */}
      {currentStep === 4 && (
        <ChecklistSection title="Handoff / Summary" description="Prepare handoff for the AM shift">
          <Controller name="prepareAMHandoff" control={control} render={({ field }) => (
            <ChecklistTask id={nightTasks.prepareAMHandoff.id} label={nightTasks.prepareAMHandoff.label} instruction={nightTasks.prepareAMHandoff.instruction} systems={nightTasks.prepareAMHandoff.systems} checked={field.value} onCheckedChange={field.onChange} />
          )} />

          <div className="p-4 bg-card border border-border rounded-lg">
            <Label htmlFor="handoffNotes">Handoff Notes</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">
              Summarize key information for AM shift: audit status, business date, arrivals, departures, VIPs, early arrivals, payment issues, GXP cases, no-show exceptions.
            </p>
            <Controller name="handoffNotes" control={control} render={({ field }) => (
              <Textarea id="handoffNotes" {...field} placeholder="Enter handoff notes for AM shift..." className="min-h-[150px]" />
            )} />
          </div>
        </ChecklistSection>
      )}

      {/* Step 5: Final Confirmation */}
      {currentStep === 5 && (
        <ChecklistSection title="Final Confirmation" description="Confirm all tasks are complete and handoff is ready">
          <Controller name="confirmAllTasksComplete" control={control} render={({ field }) => (
            <ChecklistTask id="confirmAllTasksComplete" label="I confirm all required tasks have been completed" instruction="Review the checklist and confirm that all snapshot, priority review, and critical tasks have been completed for this shift." systems={[]} checked={field.value} onCheckedChange={field.onChange} />
          )} />

          <Controller name="confirmHandoffReady" control={control} render={({ field }) => (
            <ChecklistTask id="confirmHandoffReady" label="I confirm the AM shift handoff is ready" instruction="Confirm that handoff notes are complete and the AM shift has all information needed to continue operations." systems={[]} checked={field.value} onCheckedChange={field.onChange} />
          )} />
        </ChecklistSection>
      )}

      {submitError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Submission Failed</p>
            <p className="text-sm text-destructive/80">{submitError}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting} className="gap-2">
          <ChevronLeft className="w-4 h-4" />Previous
        </Button>
        {currentStep === STREAMLINED_STEPS.length - 1 ? (
          <Button type="submit" className="gap-2" disabled={isSubmitting}>
            {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>) : (<><Send className="w-4 h-4" />Submit Checklist</>)}
          </Button>
        ) : (
          <Button type="button" onClick={nextStep} className="gap-2">Next<ChevronRight className="w-4 h-4" /></Button>
        )}
      </div>
    </form>
  )
}



