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
import { ChevronLeft, ChevronRight, CheckCircle2, Send, Save, Home, Loader2, AlertCircle, Monitor, MessageSquare, CreditCard, FileText, Building2, Wrench } from "lucide-react"
import { gmStreamlinedSchema, type GMStreamlinedFormData, STREAMLINED_STEPS, gmTasks } from "@/lib/streamlined-schemas"
import { HouseBalancerSection } from "@/components/house-balancer-section"

const STORAGE_KEY = "gm-streamlined-checklist-draft"

const gmSystems = [
  { name: "Stay PMS", icon: Monitor, description: "Full hotel operations" },
  { name: "GXP", icon: MessageSquare, description: "Guest escalations" },
  { name: "Ledger", icon: CreditCard, description: "Financial risks" },
  { name: "Reports", icon: FileText, description: "Accountability" },
  { name: "Rooms", icon: Building2, description: "Inventory & OOO" },
  { name: "MGS/ServiceNow", icon: Wrench, description: "System issues" },
]

function QuickReferenceCard() {
  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-3">Quick Reference - Key Systems</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {gmSystems.map((system) => (
          <div key={system.name} className="flex items-center gap-2 text-sm">
            <system.icon className="h-4 w-4 text-primary shrink-0" />
            <div><span className="font-medium">{system.name}</span><p className="text-xs text-muted-foreground">{system.description}</p></div>
          </div>
        ))}
      </div>
    </div>
  )
}

const defaultValues: GMStreamlinedFormData = {
  associateName: "", date: new Date().toISOString().split("T")[0], shiftStartTime: "", shiftEndTime: "", managerOnDuty: "",
  reviewDailySnapshot: false, reviewInventoryOOO: false, reviewVIPsRecoveryGXP: false, reviewFinancialRisks: false,
  reviewGroupEventRevenue: false, reviewChecklistCompletion: false, assignOwnersUnresolved: false,
  issuesNotes: "", prepareLeadershipSummary: false, summaryNotes: "",
  confirmAllTasksComplete: false, confirmSummaryReady: false,
}

export function StreamlinedGMForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { submit, isSubmitting, result } = useChecklistSubmit()

  const form = useForm<GMStreamlinedFormData>({ resolver: zodResolver(gmStreamlinedSchema), defaultValues })
  const { control, handleSubmit, watch, setValue, reset } = form

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { const parsed = JSON.parse(saved); Object.keys(parsed).forEach((key) => setValue(key as keyof GMStreamlinedFormData, parsed[key])) } catch (e) { console.error("Failed to load saved progress", e) }
    }
  }, [setValue])

  const saveProgress = () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(form.getValues())); setSaveMessage("Progress saved!"); setTimeout(() => setSaveMessage(""), 3000) }
  const clearSavedProgress = () => localStorage.removeItem(STORAGE_KEY)
  const nextStep = () => { if (currentStep < STREAMLINED_STEPS.length - 1) setCurrentStep(currentStep + 1) }
  const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1) }

  const getCompletedTaskLabels = (): string[] => { const values = form.getValues(); return Object.keys(gmTasks).filter(key => values[key as keyof GMStreamlinedFormData] === true).map(key => gmTasks[key].label) }
  const getIncompleteTaskLabels = (): string[] => { const values = form.getValues(); return Object.keys(gmTasks).filter(key => values[key as keyof GMStreamlinedFormData] !== true).map(key => gmTasks[key].label) }

  const onSubmit = async (data: GMStreamlinedFormData) => {
    setSubmitError(null)
    const result = await submit({ checklistType: "gm", associateName: data.associateName, date: data.date, shiftStartTime: "", shiftEndTime: "", managerOnDuty: "", data })
    if (result.success) { clearSavedProgress(); setIsSubmitted(true) } else { setSubmitError(result.error || "Failed to submit checklist") }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
          <h2 className="text-2xl font-semibold text-foreground">Checklist Submitted</h2>
          <p className="text-muted-foreground max-w-md">Your GM Checklist has been successfully submitted.</p>
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
          <h1 className="text-2xl font-bold text-foreground">GM Checklist</h1>
          <p className="text-muted-foreground">General Manager daily checklist</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && <span className="text-sm text-green-600 font-medium">{saveMessage}</span>}
          <Button type="button" variant="outline" size="sm" onClick={saveProgress}><Save className="w-4 h-4 mr-2" />Save Progress</Button>
          <ChecklistActions checklistType="gm" associateName={watch("associateName")} date={watch("date")} shiftStartTime="" shiftEndTime="" managerOnDuty="" completedTasks={getCompletedTaskLabels()} incompleteTasks={getIncompleteTaskLabels()} notes={watch("summaryNotes")} onClearAll={() => reset(defaultValues)} />
        </div>
      </div>

      <FormProgress currentStep={currentStep} totalSteps={STREAMLINED_STEPS.length} stepLabels={STREAMLINED_STEPS} />

      {currentStep === 0 && (
        <>
          <QuickReferenceCard />
          <ChecklistSection title="Snapshot" description="Daily business overview">
            <HouseBalancerSection />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-card border border-border rounded-lg">
              <div><Label htmlFor="associateName">GM Name *</Label><Controller name="associateName" control={control} render={({ field }) => <Input id="associateName" {...field} placeholder="Your name" className="mt-1" />} /></div>
              <div><Label htmlFor="date">Date *</Label><Controller name="date" control={control} render={({ field }) => <Input id="date" type="date" {...field} className="mt-1" />} /></div>
            </div>
            <Controller name="reviewDailySnapshot" control={control} render={({ field }) => <ChecklistTask id={gmTasks.reviewDailySnapshot.id} label={gmTasks.reviewDailySnapshot.label} instruction={gmTasks.reviewDailySnapshot.instruction} systems={gmTasks.reviewDailySnapshot.systems} checked={field.value} onCheckedChange={field.onChange} />} />
            <Controller name="reviewInventoryOOO" control={control} render={({ field }) => <ChecklistTask id={gmTasks.reviewInventoryOOO.id} label={gmTasks.reviewInventoryOOO.label} instruction={gmTasks.reviewInventoryOOO.instruction} systems={gmTasks.reviewInventoryOOO.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          </ChecklistSection>
        </>
      )}

      {currentStep === 1 && (
        <ChecklistSection title="Priority Review" description="Review VIPs, guest recovery, and financial risks">
          <Controller name="reviewVIPsRecoveryGXP" control={control} render={({ field }) => <ChecklistTask id={gmTasks.reviewVIPsRecoveryGXP.id} label={gmTasks.reviewVIPsRecoveryGXP.label} instruction={gmTasks.reviewVIPsRecoveryGXP.instruction} systems={gmTasks.reviewVIPsRecoveryGXP.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="reviewFinancialRisks" control={control} render={({ field }) => <ChecklistTask id={gmTasks.reviewFinancialRisks.id} label={gmTasks.reviewFinancialRisks.label} instruction={gmTasks.reviewFinancialRisks.instruction} systems={gmTasks.reviewFinancialRisks.systems} checked={field.value} onCheckedChange={field.onChange} />} />
        </ChecklistSection>
      )}

      {currentStep === 2 && (
        <ChecklistSection title="Critical Tasks" description="Groups, accountability, and owner assignment">
          <Controller name="reviewGroupEventRevenue" control={control} render={({ field }) => <ChecklistTask id={gmTasks.reviewGroupEventRevenue.id} label={gmTasks.reviewGroupEventRevenue.label} instruction={gmTasks.reviewGroupEventRevenue.instruction} systems={gmTasks.reviewGroupEventRevenue.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="reviewChecklistCompletion" control={control} render={({ field }) => <ChecklistTask id={gmTasks.reviewChecklistCompletion.id} label={gmTasks.reviewChecklistCompletion.label} instruction={gmTasks.reviewChecklistCompletion.instruction} systems={gmTasks.reviewChecklistCompletion.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="assignOwnersUnresolved" control={control} render={({ field }) => <ChecklistTask id={gmTasks.assignOwnersUnresolved.id} label={gmTasks.assignOwnersUnresolved.label} instruction={gmTasks.assignOwnersUnresolved.instruction} systems={gmTasks.assignOwnersUnresolved.systems} checked={field.value} onCheckedChange={field.onChange} />} />
        </ChecklistSection>
      )}

      {currentStep === 3 && (
        <ChecklistSection title="Issues / Exceptions" description="Document any issues or concerns">
          <div className="p-4 bg-card border border-border rounded-lg">
            <Label htmlFor="issuesNotes">Issues, Exceptions, or Concerns</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">Document major guest issues, financial risks, inventory concerns, staffing gaps, or items requiring action.</p>
            <Controller name="issuesNotes" control={control} render={({ field }) => <Textarea id="issuesNotes" {...field} placeholder="Document any issues..." className="min-h-[150px]" />} />
          </div>
        </ChecklistSection>
      )}

      {currentStep === 4 && (
        <ChecklistSection title="Handoff / Summary" description="Prepare daily leadership summary">
          <Controller name="prepareLeadershipSummary" control={control} render={({ field }) => <ChecklistTask id={gmTasks.prepareLeadershipSummary.id} label={gmTasks.prepareLeadershipSummary.label} instruction={gmTasks.prepareLeadershipSummary.instruction} systems={gmTasks.prepareLeadershipSummary.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <div className="p-4 bg-card border border-border rounded-lg">
            <Label htmlFor="summaryNotes">Leadership Summary Notes</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">Summarize occupancy, guest recovery, inventory risk, financial concerns, groups/events, staffing, coaching, and tomorrow&apos;s risks.</p>
            <Controller name="summaryNotes" control={control} render={({ field }) => <Textarea id="summaryNotes" {...field} placeholder="Enter leadership summary notes..." className="min-h-[150px]" />} />
          </div>
        </ChecklistSection>
      )}

      {currentStep === 5 && (
        <ChecklistSection title="Final Confirmation" description="Confirm all tasks are complete">
          <Controller name="confirmAllTasksComplete" control={control} render={({ field }) => <ChecklistTask id="confirmAllTasksComplete" label="I confirm all required tasks have been completed" instruction="Review the checklist and confirm that all tasks have been completed." systems={[]} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="confirmSummaryReady" control={control} render={({ field }) => <ChecklistTask id="confirmSummaryReady" label="I confirm the leadership summary is ready" instruction="Confirm that summary notes are complete and documented for future reference." systems={[]} checked={field.value} onCheckedChange={field.onChange} />} />
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
        {currentStep === STREAMLINED_STEPS.length - 1 ? (
          <Button type="submit" className="gap-2" disabled={isSubmitting}>{isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>) : (<><Send className="w-4 h-4" />Submit Checklist</>)}</Button>
        ) : (
          <Button type="button" onClick={nextStep} className="gap-2">Next<ChevronRight className="w-4 h-4" /></Button>
        )}
      </div>
    </form>
  )
}



