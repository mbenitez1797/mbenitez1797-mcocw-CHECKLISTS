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
import { AMBatchDepositTasks } from "@/components/am-batch-deposit-tasks"
import { useChecklistSubmit } from "@/hooks/use-checklist-submit"
import { ChevronLeft, ChevronRight, CheckCircle2, Send, Save, Home, Loader2, AlertCircle, Monitor, Users, MessageSquare, FileText } from "lucide-react"
import {
  amStreamlinedSchema,
  type AMStreamlinedFormData,
  STREAMLINED_STEPS,
  amTasks,
} from "@/lib/streamlined-schemas"

const STORAGE_KEY = "am-streamlined-checklist-draft"

const coordinatePriorityRoomsTask = {
  id: amTasks.coordinatePriorityRooms.id,
  label: "Mobile check-in and prioritize rooms with housekeeping",
  instruction:
    "Stay PMS > Dashboard > Digital Requests > Total Requests > sort by Status. Review every reservation on that list and check arrival time. Try to assign mobile check-ins with digital keys to VR rooms first. If a VR room is not available, tell housekeeping how many of each room type you need so they can provide a list of rooms that will be ready soon.",
  expandedInstruction:
    "Go to Dashboard, then Digital Requests, then Total Requests. Sort by Status and review each reservation on the list. Check the expected arrival time, prioritize mobile check-ins/digital key requests, and try to assign them to Vacant Ready rooms. If the needed room type is not VR, communicate the exact count by room type to housekeeping so they can identify which rooms will be ready soon.",
  systems: amTasks.coordinatePriorityRooms.systems,
}

const amSystems = [
  { name: "Stay PMS", icon: Monitor, description: "Reservations, rooms, folios" },
  { name: "GXP", icon: MessageSquare, description: "Guest requests & issues" },
  { name: "GPS", icon: Users, description: "Guest profiles & preferences" },
  { name: "Reports", icon: FileText, description: "Operational reports" },
]

function QuickReferenceCard() {
  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-3">Quick Reference - Key Systems</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {amSystems.map((system) => (
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

const defaultValues: AMStreamlinedFormData = {
  associateName: "",
  date: new Date().toISOString().split("T")[0],
  shiftStartTime: "07:00",
  shiftEndTime: "15:00",
  managerOnDuty: "",
  reviewOvernightHandoff: false,
  reviewHouseSnapshot: false,
  reviewDeparturesBalances: false,
  reviewPriorityArrivals: false,
  reviewRoomInventory: false,
  coordinatePriorityRooms: false,
  reviewGXPRequests: false,
  reviewPaymentProfiles: false,
  reviewGroups: false,
  confirmNoUnnecessaryAssignments: false,
  issuesNotes: "",
  preparePMHandoff: false,
  handoffNotes: "",
  confirmAllTasksComplete: false,
  confirmHandoffReady: false,
}

export function StreamlinedAMForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { submit, isSubmitting, result } = useChecklistSubmit()

  const form = useForm<AMStreamlinedFormData>({
    resolver: zodResolver(amStreamlinedSchema),
    defaultValues,
  })

  const { control, handleSubmit, watch, setValue, reset } = form

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        Object.keys(parsed).forEach((key) => {
          setValue(key as keyof AMStreamlinedFormData, parsed[key])
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
    if (currentStep < STREAMLINED_STEPS.length - 1) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const getCompletedTaskLabels = (): string[] => {
    const completed: string[] = []
    const values = form.getValues()
    Object.keys(amTasks).forEach((key) => {
      if (values[key as keyof AMStreamlinedFormData] === true) completed.push(amTasks[key].label)
    })
    return completed
  }

  const getIncompleteTaskLabels = (): string[] => {
    const incomplete: string[] = []
    const values = form.getValues()
    Object.keys(amTasks).forEach((key) => {
      if (values[key as keyof AMStreamlinedFormData] !== true) incomplete.push(amTasks[key].label)
    })
    return incomplete
  }

  const onSubmit = async (data: AMStreamlinedFormData) => {
    setSubmitError(null)

    const result = await submit({
      checklistType: "am",
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
            Your AM Front Desk Checklist has been successfully submitted. The PM shift team has been notified.
          </p>
          {result?.oneDrive?.fileUrl && <p className="text-sm text-muted-foreground">A copy has been saved to OneDrive.</p>}
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false)
                setCurrentStep(0)
                reset(defaultValues)
              }}
            >
              Submit Another Checklist
            </Button>
            <Button asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Link>
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
          <h1 className="text-2xl font-bold text-foreground">AM Front Desk Checklist</h1>
          <p className="text-muted-foreground">Morning shift operations checklist</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && <span className="text-sm text-green-600 font-medium">{saveMessage}</span>}
          <Button type="button" variant="outline" size="sm" onClick={saveProgress}>
            <Save className="w-4 h-4 mr-2" />
            Save Progress
          </Button>
          <ChecklistActions
            checklistType="am"
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

      {currentStep === 0 && (
        <>
          <QuickReferenceCard />
          <ChecklistSection title="Snapshot" description="Start of shift overview and status check">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-card border border-border rounded-lg">
              <div>
                <Label htmlFor="associateName">Associate Name *</Label>
                <Controller name="associateName" control={control} render={({ field }) => <Input id="associateName" {...field} placeholder="Your name" className="mt-1" />} />
              </div>
              <div>
                <Label htmlFor="date">Date *</Label>
                <Controller name="date" control={control} render={({ field }) => <Input id="date" type="date" {...field} className="mt-1" />} />
              </div>
              <div>
                <Label htmlFor="shiftStartTime">Shift Start</Label>
                <Controller name="shiftStartTime" control={control} render={({ field }) => <Input id="shiftStartTime" type="time" {...field} className="mt-1" />} />
              </div>
              <div>
                <Label htmlFor="managerOnDuty">Manager on Duty</Label>
                <Controller name="managerOnDuty" control={control} render={({ field }) => <Input id="managerOnDuty" {...field} placeholder="MOD name" className="mt-1" />} />
              </div>
            </div>

            <Controller
              name="reviewOvernightHandoff"
              control={control}
              render={({ field }) => (
                <ChecklistTask id={amTasks.reviewOvernightHandoff.id} label={amTasks.reviewOvernightHandoff.label} instruction={amTasks.reviewOvernightHandoff.instruction} systems={amTasks.reviewOvernightHandoff.systems} checked={field.value} onCheckedChange={field.onChange} />
              )}
            />

            <Controller
              name="reviewHouseSnapshot"
              control={control}
              render={({ field }) => (
                <ChecklistTask id={amTasks.reviewHouseSnapshot.id} label={amTasks.reviewHouseSnapshot.label} instruction={amTasks.reviewHouseSnapshot.instruction} systems={amTasks.reviewHouseSnapshot.systems} checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </ChecklistSection>
        </>
      )}

      {currentStep === 1 && (
        <>
          <AMBatchDepositTasks />
          <ChecklistSection title="Priority Review" description="Review departures, arrivals, and room inventory">
            <Controller
              name="reviewDeparturesBalances"
              control={control}
              render={({ field }) => (
                <ChecklistTask id={amTasks.reviewDeparturesBalances.id} label={amTasks.reviewDeparturesBalances.label} instruction={amTasks.reviewDeparturesBalances.instruction} systems={amTasks.reviewDeparturesBalances.systems} checked={field.value} onCheckedChange={field.onChange} />
              )}
            />

            <Controller
              name="reviewPriorityArrivals"
              control={control}
              render={({ field }) => (
                <ChecklistTask id={amTasks.reviewPriorityArrivals.id} label={amTasks.reviewPriorityArrivals.label} instruction={amTasks.reviewPriorityArrivals.instruction} systems={amTasks.reviewPriorityArrivals.systems} checked={field.value} onCheckedChange={field.onChange} />
              )}
            />

            <Controller
              name="reviewRoomInventory"
              control={control}
              render={({ field }) => (
                <ChecklistTask id={amTasks.reviewRoomInventory.id} label={amTasks.reviewRoomInventory.label} instruction={amTasks.reviewRoomInventory.instruction} systems={amTasks.reviewRoomInventory.systems} checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </ChecklistSection>
        </>
      )}

      {currentStep === 2 && (
        <ChecklistSection title="Critical Tasks" description="Execute priority tasks for the shift">
          <Controller
            name="coordinatePriorityRooms"
            control={control}
            render={({ field }) => (
              <ChecklistTask
                id={coordinatePriorityRoomsTask.id}
                label={coordinatePriorityRoomsTask.label}
                instruction={coordinatePriorityRoomsTask.instruction}
                expandedInstruction={coordinatePriorityRoomsTask.expandedInstruction}
                systems={coordinatePriorityRoomsTask.systems}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Controller name="reviewGXPRequests" control={control} render={({ field }) => <ChecklistTask id={amTasks.reviewGXPRequests.id} label={amTasks.reviewGXPRequests.label} instruction={amTasks.reviewGXPRequests.instruction} systems={amTasks.reviewGXPRequests.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="reviewPaymentProfiles" control={control} render={({ field }) => <ChecklistTask id={amTasks.reviewPaymentProfiles.id} label={amTasks.reviewPaymentProfiles.label} instruction={amTasks.reviewPaymentProfiles.instruction} systems={amTasks.reviewPaymentProfiles.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="reviewGroups" control={control} render={({ field }) => <ChecklistTask id={amTasks.reviewGroups.id} label={amTasks.reviewGroups.label} instruction={amTasks.reviewGroups.instruction} systems={amTasks.reviewGroups.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="confirmNoUnnecessaryAssignments" control={control} render={({ field }) => <ChecklistTask id={amTasks.confirmNoUnnecessaryAssignments.id} label={amTasks.confirmNoUnnecessaryAssignments.label} instruction={amTasks.confirmNoUnnecessaryAssignments.instruction} systems={amTasks.confirmNoUnnecessaryAssignments.systems} checked={field.value} onCheckedChange={field.onChange} />} />
        </ChecklistSection>
      )}

      {currentStep === 3 && (
        <ChecklistSection title="Issues / Exceptions" description="Document any issues, exceptions, or concerns">
          <div className="p-4 bg-card border border-border rounded-lg">
            <Label htmlFor="issuesNotes">Issues, Exceptions, or Concerns</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">Document any unresolved guest issues, billing problems, room concerns, system errors, or items requiring follow-up.</p>
            <Controller name="issuesNotes" control={control} render={({ field }) => <Textarea id="issuesNotes" {...field} placeholder="Document any issues, exceptions, or concerns..." className="min-h-[150px]" />} />
          </div>
        </ChecklistSection>
      )}

      {currentStep === 4 && (
        <ChecklistSection title="Handoff / Summary" description="Prepare handoff for the PM shift">
          <Controller name="preparePMHandoff" control={control} render={({ field }) => <ChecklistTask id={amTasks.preparePMHandoff.id} label={amTasks.preparePMHandoff.label} instruction={amTasks.preparePMHandoff.instruction} systems={amTasks.preparePMHandoff.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <div className="p-4 bg-card border border-border rounded-lg">
            <Label htmlFor="handoffNotes">Handoff Notes</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">Summarize key information for the PM shift: arrivals remaining, priority arrivals, rooms not ready, billing issues, GXP cases, groups, OOO rooms.</p>
            <Controller name="handoffNotes" control={control} render={({ field }) => <Textarea id="handoffNotes" {...field} placeholder="Enter handoff notes for PM shift..." className="min-h-[150px]" />} />
          </div>
        </ChecklistSection>
      )}

      {currentStep === 5 && (
        <ChecklistSection title="Final Confirmation" description="Confirm all tasks are complete and handoff is ready">
          <Controller name="confirmAllTasksComplete" control={control} render={({ field }) => <ChecklistTask id="confirmAllTasksComplete" label="I confirm all required tasks have been completed" instruction="Review the checklist and confirm that all snapshot, priority review, and critical tasks have been completed for this shift." systems={[]} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="confirmHandoffReady" control={control} render={({ field }) => <ChecklistTask id="confirmHandoffReady" label="I confirm the PM shift handoff is ready" instruction="Confirm that handoff notes are complete and the PM shift has all information needed to continue operations." systems={[]} checked={field.value} onCheckedChange={field.onChange} />} />
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
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep === STREAMLINED_STEPS.length - 1 ? (
          <Button type="submit" className="gap-2" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : <><Send className="w-4 h-4" />Submit Checklist</>}
          </Button>
        ) : (
          <Button type="button" onClick={nextStep} className="gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </form>
  )
}
