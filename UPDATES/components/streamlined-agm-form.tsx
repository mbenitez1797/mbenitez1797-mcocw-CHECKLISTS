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
import { ChevronLeft, ChevronRight, CheckCircle2, Send, Save, Home, Loader2, AlertCircle, Monitor, Users, CreditCard, MessageSquare, Building2, Scale } from "lucide-react"
import { agmStreamlinedSchema, type AGMStreamlinedFormData, agmTasks } from "@/lib/streamlined-schemas"
import { HouseBalancerSection } from "@/components/house-balancer-section"

// AGM-specific steps (includes House Balancer as first step)
const AGM_STEPS = ["House Balance", "Snapshot", "Priority Review", "Critical Tasks", "Issues", "Handoff", "Final"]

const STORAGE_KEY = "agm-streamlined-checklist-draft"

const agmSystems = [
  { name: "Stay PMS", icon: Monitor, description: "Full hotel operations" },
  { name: "GXP", icon: MessageSquare, description: "Guest recovery & cases" },
  { name: "Ledger", icon: CreditCard, description: "Billing exceptions" },
  { name: "Rooms", icon: Building2, description: "Housekeeping & inventory" },
]

function QuickReferenceCard() {
  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-3">Quick Reference - Key Systems</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {agmSystems.map((system) => (
          <div key={system.name} className="flex items-center gap-2 text-sm">
            <system.icon className="h-4 w-4 text-primary shrink-0" />
            <div><span className="font-medium">{system.name}</span><p className="text-xs text-muted-foreground">{system.description}</p></div>
          </div>
        ))}
      </div>
    </div>
  )
}

const defaultValues: AGMStreamlinedFormData & { houseBalanceComplete: boolean } = {
  associateName: "", date: new Date().toISOString().split("T")[0], shiftStartTime: "", shiftEndTime: "", managerOnDuty: "",
  reviewHouseReadiness: false, reviewFrontDeskExecution: false, reviewGuestRecoveryGXP: false,
  reviewBillingLedgerExceptions: false, reviewHousekeepingReadiness: false, reviewGroupEventInventory: false, reviewStaffingTraining: false,
  issuesNotes: "", prepareGMSummary: false, summaryNotes: "",
  confirmAllTasksComplete: false, confirmSummaryReady: false,
  houseBalanceComplete: false,
}

export function StreamlinedAGMForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [houseBalanceComplete, setHouseBalanceComplete] = useState(false)
  const { submit, isSubmitting, result } = useChecklistSubmit()

  const form = useForm<AGMStreamlinedFormData>({ resolver: zodResolver(agmStreamlinedSchema), defaultValues })
  const { control, handleSubmit, watch, setValue, reset } = form

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        Object.keys(parsed).forEach((key) => setValue(key as keyof AGMStreamlinedFormData, parsed[key]))
      } catch (e) { console.error("Failed to load saved progress", e) }
    }
  }, [setValue])

  const saveProgress = () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(form.getValues())); setSaveMessage("Progress saved!"); setTimeout(() => setSaveMessage(""), 3000) }
  const clearSavedProgress = () => localStorage.removeItem(STORAGE_KEY)
  const nextStep = () => { if (currentStep < AGM_STEPS.length - 1) setCurrentStep(currentStep + 1) }
  const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1) }

  const getCompletedTaskLabels = (): string[] => { const values = form.getValues(); return Object.keys(agmTasks).filter(key => values[key as keyof AGMStreamlinedFormData] === true).map(key => agmTasks[key].label) }
  const getIncompleteTaskLabels = (): string[] => { const values = form.getValues(); return Object.keys(agmTasks).filter(key => values[key as keyof AGMStreamlinedFormData] !== true).map(key => agmTasks[key].label) }

  const onSubmit = async (data: AGMStreamlinedFormData) => {
    setSubmitError(null)
    const result = await submit({ checklistType: "agm", associateName: data.associateName, date: data.date, shiftStartTime: data.shiftStartTime || "", shiftEndTime: data.shiftEndTime || "", managerOnDuty: data.managerOnDuty || "", data })
    if (result.success) { clearSavedProgress(); setIsSubmitted(true) } else { setSubmitError(result.error || "Failed to submit checklist") }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
          <h2 className="text-2xl font-semibold text-foreground">Checklist Submitted</h2>
          <p className="text-muted-foreground max-w-md">Your AGM Checklist has been successfully submitted.</p>
          {result?.oneDrive?.fileUrl && <p className="text-sm text-muted-foreground">A copy has been saved to OneDrive.</p>}
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => { setIsSubmitted(false); setCurrentStep(0); reset(defaultValues) }}>Submit Another Checklist</Button>
            <Button asChild><Link href="/"><Home className="w-4 h-4 mr-2" />Return to Home</Link></Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AGM Checklist</h1>
          <p className="text-muted-foreground">Assistant General Manager daily checklist</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && <span className="text-sm text-green-600 font-medium">{saveMessage}</span>}
          <Button type="button" variant="outline" size="sm" onClick={saveProgress}><Save className="w-4 h-4 mr-2" />Save Progress</Button>
          <ChecklistActions checklistType="agm" associateName={watch("associateName")} date={watch("date")} shiftStartTime={watch("shiftStartTime") || ""} shiftEndTime={watch("shiftEndTime") || ""} managerOnDuty={watch("managerOnDuty") || ""} completedTasks={getCompletedTaskLabels()} incompleteTasks={getIncompleteTaskLabels()} notes={watch("summaryNotes")} onClearAll={() => reset(defaultValues)} />
        </div>
      </div>

      <FormProgress currentStep={currentStep} totalSteps={AGM_STEPS.length} stepLabels={AGM_STEPS} />

      {/* Step 0: House Balance */}
      {currentStep === 0 && (
        <ChecklistSection title="House Balance" description="Manage daily inventory and resolve oversold categories">
          <HouseBalancerSection onBalanceComplete={() => setHouseBalanceComplete(true)} />
          {houseBalanceComplete && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">House balance confirmed - proceed to next step</span>
            </div>
          )}
        </ChecklistSection>
      )}

      {/* Step 1: Snapshot */}
      {currentStep === 1 && (
        <>
          <QuickReferenceCard />
          <ChecklistSection title="Snapshot" description="Start of day overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-card border border-border rounded-lg">
              <div><Label htmlFor="associateName">AGM Name *</Label><Controller name="associateName" control={control} render={({ field }) => <Input id="associateName" {...field} placeholder="Your name" className="mt-1" />} /></div>
              <div><Label htmlFor="date">Date *</Label><Controller name="date" control={control} render={({ field }) => <Input id="date" type="date" {...field} className="mt-1" />} /></div>
            </div>
            <Controller name="reviewHouseReadiness" control={control} render={({ field }) => <ChecklistTask id={agmTasks.reviewHouseReadiness.id} label={agmTasks.reviewHouseReadiness.label} instruction={agmTasks.reviewHouseReadiness.instruction} systems={agmTasks.reviewHouseReadiness.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          </ChecklistSection>
        </>
      )}

      {currentStep === 2 && (
        <ChecklistSection title="Priority Review" description="Review front desk execution and guest recovery">
          <Controller name="reviewFrontDeskExecution" control={control} render={({ field }) => <ChecklistTask id={agmTasks.reviewFrontDeskExecution.id} label={agmTasks.reviewFrontDeskExecution.label} instruction={agmTasks.reviewFrontDeskExecution.instruction} systems={agmTasks.reviewFrontDeskExecution.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="reviewGuestRecoveryGXP" control={control} render={({ field }) => <ChecklistTask id={agmTasks.reviewGuestRecoveryGXP.id} label={agmTasks.reviewGuestRecoveryGXP.label} instruction={agmTasks.reviewGuestRecoveryGXP.instruction} systems={agmTasks.reviewGuestRecoveryGXP.systems} checked={field.value} onCheckedChange={field.onChange} />} />
        </ChecklistSection>
      )}

      {currentStep === 3 && (
        <ChecklistSection title="Critical Tasks" description="Billing, housekeeping, groups, and staffing">
          <Controller name="reviewBillingLedgerExceptions" control={control} render={({ field }) => <ChecklistTask id={agmTasks.reviewBillingLedgerExceptions.id} label={agmTasks.reviewBillingLedgerExceptions.label} instruction={agmTasks.reviewBillingLedgerExceptions.instruction} systems={agmTasks.reviewBillingLedgerExceptions.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="reviewHousekeepingReadiness" control={control} render={({ field }) => <ChecklistTask id={agmTasks.reviewHousekeepingReadiness.id} label={agmTasks.reviewHousekeepingReadiness.label} instruction={agmTasks.reviewHousekeepingReadiness.instruction} systems={agmTasks.reviewHousekeepingReadiness.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="reviewGroupEventInventory" control={control} render={({ field }) => <ChecklistTask id={agmTasks.reviewGroupEventInventory.id} label={agmTasks.reviewGroupEventInventory.label} instruction={agmTasks.reviewGroupEventInventory.instruction} systems={agmTasks.reviewGroupEventInventory.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="reviewStaffingTraining" control={control} render={({ field }) => <ChecklistTask id={agmTasks.reviewStaffingTraining.id} label={agmTasks.reviewStaffingTraining.label} instruction={agmTasks.reviewStaffingTraining.instruction} systems={agmTasks.reviewStaffingTraining.systems} checked={field.value} onCheckedChange={field.onChange} />} />
        </ChecklistSection>
      )}

      {currentStep === 4 && (
        <ChecklistSection title="Issues / Exceptions" description="Document any issues or concerns">
          <div className="p-4 bg-card border border-border rounded-lg">
            <Label htmlFor="issuesNotes">Issues, Exceptions, or Concerns</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">Document unresolved guest issues, billing exceptions, staffing concerns, or items requiring GM attention.</p>
            <Controller name="issuesNotes" control={control} render={({ field }) => <Textarea id="issuesNotes" {...field} placeholder="Document any issues..." className="min-h-[150px]" />} />
          </div>
        </ChecklistSection>
      )}

      {currentStep === 5 && (
        <ChecklistSection title="Handoff / Summary" description="Prepare GM follow-up summary">
          <Controller name="prepareGMSummary" control={control} render={({ field }) => <ChecklistTask id={agmTasks.prepareGMSummary.id} label={agmTasks.prepareGMSummary.label} instruction={agmTasks.prepareGMSummary.instruction} systems={agmTasks.prepareGMSummary.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <div className="p-4 bg-card border border-border rounded-lg">
            <Label htmlFor="summaryNotes">GM Summary Notes</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">Summarize inventory risk, service recovery, billing issues, groups/events, housekeeping, staffing, and GM follow-up needed.</p>
            <Controller name="summaryNotes" control={control} render={({ field }) => <Textarea id="summaryNotes" {...field} placeholder="Enter summary notes for GM..." className="min-h-[150px]" />} />
          </div>
        </ChecklistSection>
      )}

      {currentStep === 6 && (
        <ChecklistSection title="Final Confirmation" description="Confirm all tasks are complete">
          <Controller name="confirmAllTasksComplete" control={control} render={({ field }) => <ChecklistTask id="confirmAllTasksComplete" label="I confirm all required tasks have been completed" instruction="Review the checklist and confirm that all tasks have been completed." systems={[]} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="confirmSummaryReady" control={control} render={({ field }) => <ChecklistTask id="confirmSummaryReady" label="I confirm the GM summary is ready" instruction="Confirm that summary notes are complete and the GM has all information needed." systems={[]} checked={field.value} onCheckedChange={field.onChange} />} />
        </ChecklistSection>
      )}

      {submitError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div><p className="font-medium text-destructive">Submission Failed</p><p className="text-sm text-destructive/80">{submitError}</p></div>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting} className="gap-2"><ChevronLeft className="w-4 h-4" />Previous</Button>
        {currentStep === AGM_STEPS.length - 1 ? (
          <Button type="submit" className="gap-2" disabled={isSubmitting}>{isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>) : (<><Send className="w-4 h-4" />Submit Checklist</>)}</Button>
        ) : (
          <Button type="button" onClick={nextStep} className="gap-2">Next<ChevronRight className="w-4 h-4" /></Button>
        )}
      </div>
    </form>
  )
}



