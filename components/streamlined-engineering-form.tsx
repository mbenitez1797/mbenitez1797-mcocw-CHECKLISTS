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
import { ChevronLeft, ChevronRight, CheckCircle2, Send, Save, Home, Loader2, AlertCircle, Monitor, MessageSquare, Building2, Wrench } from "lucide-react"
import { engineeringStreamlinedSchema, type EngineeringStreamlinedFormData, STREAMLINED_STEPS, engineeringTasks } from "@/lib/streamlined-schemas"

const STORAGE_KEY = "engineering-streamlined-checklist-draft"

const engineeringSystems = [
  { name: "Stay PMS", icon: Monitor, description: "OOO rooms & status" },
  { name: "GXP", icon: MessageSquare, description: "Maintenance requests" },
  { name: "Rooms", icon: Building2, description: "Room inventory" },
  { name: "MGS/ServiceNow", icon: Wrench, description: "System tickets" },
]

function QuickReferenceCard() {
  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-3">Quick Reference - Key Systems</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {engineeringSystems.map((system) => (
          <div key={system.name} className="flex items-center gap-2 text-sm">
            <system.icon className="h-4 w-4 text-primary shrink-0" />
            <div><span className="font-medium">{system.name}</span><p className="text-xs text-muted-foreground">{system.description}</p></div>
          </div>
        ))}
      </div>
    </div>
  )
}

const defaultValues: EngineeringStreamlinedFormData = {
  associateName: "", date: new Date().toISOString().split("T")[0], shiftStartTime: "", shiftEndTime: "", managerOnDuty: "",
  reviewGXPMaintenanceRequests: false, reviewOOORooms: false, prioritizeGuestImpactingSafety: false,
  completeUpdateRepairs: false, communicateRoomsReadyInspection: false, escalateUnresolvedIssues: false, completePublicAreaWalkthrough: false,
  issuesNotes: "", prepareEngineeringHandoff: false, handoffNotes: "",
  confirmAllTasksComplete: false, confirmHandoffReady: false,
}

export function StreamlinedEngineeringForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { submit, isSubmitting, result } = useChecklistSubmit()

  const form = useForm<EngineeringStreamlinedFormData>({ resolver: zodResolver(engineeringStreamlinedSchema), defaultValues })
  const { control, handleSubmit, watch, setValue, reset } = form

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { const parsed = JSON.parse(saved); Object.keys(parsed).forEach((key) => setValue(key as keyof EngineeringStreamlinedFormData, parsed[key])) } catch (e) { console.error("Failed to load saved progress", e) }
    }
  }, [setValue])

  const saveProgress = () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(form.getValues())); setSaveMessage("Progress saved!"); setTimeout(() => setSaveMessage(""), 3000) }
  const clearSavedProgress = () => localStorage.removeItem(STORAGE_KEY)
  const nextStep = () => { if (currentStep < STREAMLINED_STEPS.length - 1) setCurrentStep(currentStep + 1) }
  const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1) }

  const getCompletedTaskLabels = (): string[] => { const values = form.getValues(); return Object.keys(engineeringTasks).filter(key => values[key as keyof EngineeringStreamlinedFormData] === true).map(key => engineeringTasks[key].label) }
  const getIncompleteTaskLabels = (): string[] => { const values = form.getValues(); return Object.keys(engineeringTasks).filter(key => values[key as keyof EngineeringStreamlinedFormData] !== true).map(key => engineeringTasks[key].label) }

  const onSubmit = async (data: EngineeringStreamlinedFormData) => {
    setSubmitError(null)
    const result = await submit({ checklistType: "engineering", associateName: data.associateName, date: data.date, shiftStartTime: data.shiftStartTime || "", shiftEndTime: data.shiftEndTime || "", managerOnDuty: data.managerOnDuty || "", data })
    if (result.success) { clearSavedProgress(); setIsSubmitted(true) } else { setSubmitError(result.error || "Failed to submit checklist") }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
          <h2 className="text-2xl font-semibold text-foreground">Checklist Submitted</h2>
          <p className="text-muted-foreground max-w-md">Your Engineering Checklist has been successfully submitted.</p>
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
          <h1 className="text-2xl font-bold text-foreground">Engineering Checklist</h1>
          <p className="text-muted-foreground">Engineering daily checklist</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && <span className="text-sm text-green-600 font-medium">{saveMessage}</span>}
          <Button type="button" variant="outline" size="sm" onClick={saveProgress}><Save className="w-4 h-4 mr-2" />Save Progress</Button>
          <ChecklistActions checklistType="engineering" associateName={watch("associateName")} date={watch("date")} shiftStartTime={watch("shiftStartTime") || ""} shiftEndTime={watch("shiftEndTime") || ""} managerOnDuty={watch("managerOnDuty") || ""} completedTasks={getCompletedTaskLabels()} incompleteTasks={getIncompleteTaskLabels()} notes={watch("handoffNotes")} onClearAll={() => reset(defaultValues)} />
        </div>
      </div>

      <FormProgress currentStep={currentStep} totalSteps={STREAMLINED_STEPS.length} stepLabels={STREAMLINED_STEPS} />

      {currentStep === 0 && (
        <>
          <QuickReferenceCard />
          <ChecklistSection title="Snapshot" description="Start of day maintenance overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-card border border-border rounded-lg">
              <div><Label htmlFor="associateName">Engineer Name *</Label><Controller name="associateName" control={control} render={({ field }) => <Input id="associateName" {...field} placeholder="Your name" className="mt-1" />} /></div>
              <div><Label htmlFor="date">Date *</Label><Controller name="date" control={control} render={({ field }) => <Input id="date" type="date" {...field} className="mt-1" />} /></div>
              <div><Label htmlFor="shiftStartTime">Shift Start</Label><Controller name="shiftStartTime" control={control} render={({ field }) => <Input id="shiftStartTime" type="time" {...field} className="mt-1" />} /></div>
              <div><Label htmlFor="managerOnDuty">MOD / Chief Engineer</Label><Controller name="managerOnDuty" control={control} render={({ field }) => <Input id="managerOnDuty" {...field} placeholder="Name" className="mt-1" />} /></div>
            </div>
            <Controller name="reviewGXPMaintenanceRequests" control={control} render={({ field }) => <ChecklistTask id={engineeringTasks.reviewGXPMaintenanceRequests.id} label={engineeringTasks.reviewGXPMaintenanceRequests.label} instruction={engineeringTasks.reviewGXPMaintenanceRequests.instruction} systems={engineeringTasks.reviewGXPMaintenanceRequests.systems} checked={field.value} onCheckedChange={field.onChange} />} />
            <Controller name="reviewOOORooms" control={control} render={({ field }) => <ChecklistTask id={engineeringTasks.reviewOOORooms.id} label={engineeringTasks.reviewOOORooms.label} instruction={engineeringTasks.reviewOOORooms.instruction} systems={engineeringTasks.reviewOOORooms.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          </ChecklistSection>
        </>
      )}

      {currentStep === 1 && (
        <ChecklistSection title="Priority Review" description="Prioritize guest-impacting and safety issues">
          <Controller name="prioritizeGuestImpactingSafety" control={control} render={({ field }) => <ChecklistTask id={engineeringTasks.prioritizeGuestImpactingSafety.id} label={engineeringTasks.prioritizeGuestImpactingSafety.label} instruction={engineeringTasks.prioritizeGuestImpactingSafety.instruction} systems={engineeringTasks.prioritizeGuestImpactingSafety.systems} checked={field.value} onCheckedChange={field.onChange} />} />
        </ChecklistSection>
      )}

      {currentStep === 2 && (
        <ChecklistSection title="Critical Tasks" description="Repairs, communication, escalation, and walkthroughs">
          <Controller name="completeUpdateRepairs" control={control} render={({ field }) => <ChecklistTask id={engineeringTasks.completeUpdateRepairs.id} label={engineeringTasks.completeUpdateRepairs.label} instruction={engineeringTasks.completeUpdateRepairs.instruction} systems={engineeringTasks.completeUpdateRepairs.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="communicateRoomsReadyInspection" control={control} render={({ field }) => <ChecklistTask id={engineeringTasks.communicateRoomsReadyInspection.id} label={engineeringTasks.communicateRoomsReadyInspection.label} instruction={engineeringTasks.communicateRoomsReadyInspection.instruction} systems={engineeringTasks.communicateRoomsReadyInspection.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="escalateUnresolvedIssues" control={control} render={({ field }) => <ChecklistTask id={engineeringTasks.escalateUnresolvedIssues.id} label={engineeringTasks.escalateUnresolvedIssues.label} instruction={engineeringTasks.escalateUnresolvedIssues.instruction} systems={engineeringTasks.escalateUnresolvedIssues.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="completePublicAreaWalkthrough" control={control} render={({ field }) => <ChecklistTask id={engineeringTasks.completePublicAreaWalkthrough.id} label={engineeringTasks.completePublicAreaWalkthrough.label} instruction={engineeringTasks.completePublicAreaWalkthrough.instruction} systems={engineeringTasks.completePublicAreaWalkthrough.systems} checked={field.value} onCheckedChange={field.onChange} />} />
        </ChecklistSection>
      )}

      {currentStep === 3 && (
        <ChecklistSection title="Issues / Exceptions" description="Document any issues or concerns">
          <div className="p-4 bg-card border border-border rounded-lg">
            <Label htmlFor="issuesNotes">Issues, Exceptions, or Concerns</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">Document unresolved repairs, safety issues, OOO rooms, parts/vendor needs, or items requiring follow-up.</p>
            <Controller name="issuesNotes" control={control} render={({ field }) => <Textarea id="issuesNotes" {...field} placeholder="Document any issues..." className="min-h-[150px]" />} />
          </div>
        </ChecklistSection>
      )}

      {currentStep === 4 && (
        <ChecklistSection title="Handoff / Summary" description="Prepare engineering handoff">
          <Controller name="prepareEngineeringHandoff" control={control} render={({ field }) => <ChecklistTask id={engineeringTasks.prepareEngineeringHandoff.id} label={engineeringTasks.prepareEngineeringHandoff.label} instruction={engineeringTasks.prepareEngineeringHandoff.instruction} systems={engineeringTasks.prepareEngineeringHandoff.systems} checked={field.value} onCheckedChange={field.onChange} />} />
          <div className="p-4 bg-card border border-border rounded-lg">
            <Label htmlFor="handoffNotes">Handoff Notes</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">Document open GXP cases, guest-impacting issues, OOO rooms, rooms returned to service, safety issues, and system tickets.</p>
            <Controller name="handoffNotes" control={control} render={({ field }) => <Textarea id="handoffNotes" {...field} placeholder="Enter handoff notes..." className="min-h-[150px]" />} />
          </div>
        </ChecklistSection>
      )}

      {currentStep === 5 && (
        <ChecklistSection title="Final Confirmation" description="Confirm all tasks are complete">
          <Controller name="confirmAllTasksComplete" control={control} render={({ field }) => <ChecklistTask id="confirmAllTasksComplete" label="I confirm all required tasks have been completed" instruction="Review the checklist and confirm that all tasks have been completed." systems={[]} checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller name="confirmHandoffReady" control={control} render={({ field }) => <ChecklistTask id="confirmHandoffReady" label="I confirm the engineering handoff is ready" instruction="Confirm that handoff notes are complete and the next shift has all information needed." systems={[]} checked={field.value} onCheckedChange={field.onChange} />} />
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



