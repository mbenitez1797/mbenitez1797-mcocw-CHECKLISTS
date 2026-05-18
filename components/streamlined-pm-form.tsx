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
import { useChecklistSubmit } from "@/hooks/use-checklist-submit"
import { ChevronLeft, ChevronRight, CheckCircle2, Send, Save, Home, Loader2, AlertCircle, Monitor, Users, MessageSquare, FileText } from "lucide-react"
import {
  pmStreamlinedSchema,
  type PMStreamlinedFormData,
  STREAMLINED_STEPS,
  pmTasks,
} from "@/lib/streamlined-schemas"

const STORAGE_KEY = "pm-streamlined-checklist-draft"

const gxpCaseManagementTask = {
  id: pmTasks.createUpdateGXP.id,
  label: "Manage GXP/GPS cases, recognition, and unresolved requests",
  instruction:
    "Open GXP and GPS during PM operations. Review open guest and associate-facing cases, requests, defects, CEC items, amenities, mobile/chat requests, and arrivals with prior issues or preferences. Create/update cases, assign owners, manage response times, close resolved items within priority standards, and keep CEC cases on track for 72-hour resolution. Use GXP reports/dashboards to identify repeat defects or service trends for handoff.",
  expandedInstruction:
    "Minimum GXP/GPS standard: manage guest-related cases such as amenities, service requests, guest-identified defects, and problem resolution; manage property-related cases such as Bonvoy support, associate-reported requests, product defects, security incidents, and work orders; review GPS Highly Actionable arrivals, repeat guest history, preferences, previous service opportunities, and negative case history; use reports and dashboards to identify recurring issues and include unresolved trends in night audit handoff.",
  systems: pmTasks.createUpdateGXP.systems,
}

const pmSystems = [
  { name: "Stay PMS", icon: Monitor, description: "Reservations, rooms, folios" },
  { name: "GXP", icon: MessageSquare, description: "Guest requests & issues" },
  { name: "GPS", icon: Users, description: "Guest profiles & preferences" },
  { name: "Reports", icon: FileText, description: "GXP dashboards & trends" },
]

function QuickReferenceCard() {
  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-3">Quick Reference - Key Systems</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {pmSystems.map((system) => (
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

const defaultValues: PMStreamlinedFormData = {
  associateName: "",
  date: new Date().toISOString().split("T")[0],
  shiftStartTime: "15:00",
  shiftEndTime: "23:00",
  managerOnDuty: "",
  reviewAMHandoff: false,
  reviewRemainingArrivals: false,
  reviewPriorityArrivals: false,
  reviewMobileKeyVAL: false,
  completeCheckIns: false,
  monitorRoomStatus: false,
  createUpdateGXP: false,
  reviewPaymentFolio: false,
  reviewLateArrivals: false,
  confirmNoUnnecessaryAssignments: false,
  issuesNotes: "",
  prepareNightHandoff: false,
  handoffNotes: "",
  confirmAllTasksComplete: false,
  confirmHandoffReady: false,
}

export function StreamlinedPMForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { submit, isSubmitting, result } = useChecklistSubmit()

  const form = useForm<PMStreamlinedFormData>({
    resolver: zodResolver(pmStreamlinedSchema),
    defaultValues,
  })

  const { control, handleSubmit, watch, setValue, reset } = form

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        Object.keys(parsed).forEach((key) => {
          setValue(key as keyof PMStreamlinedFormData, parsed[key])
        })
      } catch (e) {
        console.error("Failed to load saved progress", e)
      }
    }
  }, [setValue])

  const saveProgress = () => {
    const data = form.getValues()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setSaveMessage("Progress saved!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const clearSavedProgress = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  const nextStep = () => {
    if (currentStep < STREAMLINED_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getCompletedTaskLabels = (): string[] => {
    const completed: string[] = []
    const values = form.getValues()
    Object.keys(pmTasks).forEach((key) => {
      if (values[key as keyof PMStreamlinedFormData] === true) {
        completed.push(pmTasks[key].label)
      }
    })
    return completed
  }

  const getIncompleteTaskLabels = (): string[] => {
    const incomplete: string[] = []
    const values = form.getValues()
    Object.keys(pmTasks).forEach((key) => {
      if (values[key as keyof PMStreamlinedFormData] !== true) {
        incomplete.push(pmTasks[key].label)
      }
    })
    return incomplete
  }

  const onSubmit = async (data: PMStreamlinedFormData) => {
    setSubmitError(null)
    const result = await submit({
      checklistType: "pm",
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
            Your PM Front Desk Checklist has been successfully submitted. The night shift team has been notified.
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
          <h1 className="text-2xl font-bold text-foreground">PM Front Desk Checklist</h1>
          <p className="text-muted-foreground">Afternoon/evening shift operations checklist</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && <span className="text-sm text-green-600 font-medium">{saveMessage}</span>}
          <Button type="button" variant="outline" size="sm" onClick={saveProgress}>
            <Save className="w-4 h-4 mr-2" />Save Progress
          </Button>
          <ChecklistActions
            checklistType="pm"
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

            <Controller name="reviewAMHandoff" control={control} render={({ field }) => (
              <ChecklistTask
                id={pmTasks.reviewAMHandoff.id}
                label={pmTasks.reviewAMHandoff.label}
                instruction={pmTasks.reviewAMHandoff.instruction}
                systems={pmTasks.reviewAMHandoff.systems}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )} />

            <Controller name="reviewRemainingArrivals" control={control} render={({ field }) => (
              <ChecklistTask
                id={pmTasks.reviewRemainingArrivals.id}
                label={pmTasks.reviewRemainingArrivals.label}
                instruction={pmTasks.reviewRemainingArrivals.instruction}
                systems={pmTasks.reviewRemainingArrivals.systems}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )} />
          </ChecklistSection>
        </>
      )}

      {/* Step 1: Priority Review */}
      {currentStep === 1 && (
        <ChecklistSection title="Priority Review" description="Review priority arrivals and mobile key requests">
          <Controller name="reviewPriorityArrivals" control={control} render={({ field }) => (
            <ChecklistTask
              id={pmTasks.reviewPriorityArrivals.id}
              label={pmTasks.reviewPriorityArrivals.label}
              instruction={pmTasks.reviewPriorityArrivals.instruction}
              systems={pmTasks.reviewPriorityArrivals.systems}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )} />

          <Controller name="reviewMobileKeyVAL" control={control} render={({ field }) => (
            <ChecklistTask
              id={pmTasks.reviewMobileKeyVAL.id}
              label={pmTasks.reviewMobileKeyVAL.label}
              instruction={pmTasks.reviewMobileKeyVAL.instruction}
              systems={pmTasks.reviewMobileKeyVAL.systems}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )} />
        </ChecklistSection>
      )}

      {/* Step 2: Critical Tasks */}
      {currentStep === 2 && (
        <ChecklistSection title="Critical Tasks" description="Execute priority tasks for the shift">
          <Controller name="completeCheckIns" control={control} render={({ field }) => (
            <ChecklistTask
              id={pmTasks.completeCheckIns.id}
              label={pmTasks.completeCheckIns.label}
              instruction={pmTasks.completeCheckIns.instruction}
              systems={pmTasks.completeCheckIns.systems}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )} />

          <Controller name="monitorRoomStatus" control={control} render={({ field }) => (
            <ChecklistTask
              id={pmTasks.monitorRoomStatus.id}
              label={pmTasks.monitorRoomStatus.label}
              instruction={pmTasks.monitorRoomStatus.instruction}
              systems={pmTasks.monitorRoomStatus.systems}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )} />

          <Controller name="createUpdateGXP" control={control} render={({ field }) => (
            <ChecklistTask
              id={gxpCaseManagementTask.id}
              label={gxpCaseManagementTask.label}
              instruction={gxpCaseManagementTask.instruction}
              expandedInstruction={gxpCaseManagementTask.expandedInstruction}
              systems={gxpCaseManagementTask.systems}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )} />

          <Controller name="reviewPaymentFolio" control={control} render={({ field }) => (
            <ChecklistTask
              id={pmTasks.reviewPaymentFolio.id}
              label={pmTasks.reviewPaymentFolio.label}
              instruction={pmTasks.reviewPaymentFolio.instruction}
              systems={pmTasks.reviewPaymentFolio.systems}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )} />

          <Controller name="reviewLateArrivals" control={control} render={({ field }) => (
            <ChecklistTask
              id={pmTasks.reviewLateArrivals.id}
              label={pmTasks.reviewLateArrivals.label}
              instruction={pmTasks.reviewLateArrivals.instruction}
              systems={pmTasks.reviewLateArrivals.systems}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )} />

          <Controller name="confirmNoUnnecessaryAssignments" control={control} render={({ field }) => (
            <ChecklistTask
              id={pmTasks.confirmNoUnnecessaryAssignments.id}
              label={pmTasks.confirmNoUnnecessaryAssignments.label}
              instruction={pmTasks.confirmNoUnnecessaryAssignments.instruction}
              systems={pmTasks.confirmNoUnnecessaryAssignments.systems}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )} />
        </ChecklistSection>
      )}

      {/* Step 3: Issues / Exceptions */}
      {currentStep === 3 && (
        <ChecklistSection title="Issues / Exceptions" description="Document any issues, exceptions, or concerns">
          <div className="p-4 bg-card border border-border rounded-lg">
            <Label htmlFor="issuesNotes">Issues, Exceptions, or Concerns</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">
              Document any unresolved guest issues, billing problems, room concerns, system errors, or items requiring follow-up.
            </p>
            <Controller name="issuesNotes" control={control} render={({ field }) => (
              <Textarea id="issuesNotes" {...field} placeholder="Document any issues, exceptions, or concerns..." className="min-h-[150px]" />
            )} />
          </div>
        </ChecklistSection>
      )}

      {/* Step 4: Handoff / Summary */}
      {currentStep === 4 && (
        <ChecklistSection title="Handoff / Summary" description="Prepare handoff for the night audit shift">
          <Controller name="prepareNightHandoff" control={control} render={({ field }) => (
            <ChecklistTask
              id={pmTasks.prepareNightHandoff.id}
              label={pmTasks.prepareNightHandoff.label}
              instruction={pmTasks.prepareNightHandoff.instruction}
              systems={pmTasks.prepareNightHandoff.systems}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )} />

          <div className="p-4 bg-card border border-border rounded-lg">
            <Label htmlFor="handoffNotes">Handoff Notes</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">
              Summarize key information for night audit: arrivals remaining, guaranteed late arrivals, payment issues, GXP cases, groups, OOO rooms.
            </p>
            <Controller name="handoffNotes" control={control} render={({ field }) => (
              <Textarea id="handoffNotes" {...field} placeholder="Enter handoff notes for night shift..." className="min-h-[150px]" />
            )} />
          </div>
        </ChecklistSection>
      )}

      {/* Step 5: Final Confirmation */}
      {currentStep === 5 && (
        <ChecklistSection title="Final Confirmation" description="Confirm all tasks are complete and handoff is ready">
          <Controller name="confirmAllTasksComplete" control={control} render={({ field }) => (
            <ChecklistTask
              id="confirmAllTasksComplete"
              label="I confirm all required tasks have been completed"
              instruction="Review the checklist and confirm that all snapshot, priority review, and critical tasks have been completed for this shift."
              systems={[]}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )} />

          <Controller name="confirmHandoffReady" control={control} render={({ field }) => (
            <ChecklistTask
              id="confirmHandoffReady"
              label="I confirm the night shift handoff is ready"
              instruction="Confirm that handoff notes are complete and the night shift has all information needed to continue operations."
              systems={[]}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
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


