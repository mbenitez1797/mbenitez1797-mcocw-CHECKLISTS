"use client"

import { useState, useEffect, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FormSection } from "@/components/form-section"
import { CheckboxGroup } from "@/components/checkbox-group"
import { FormProgress } from "@/components/form-progress"
import { QuickReferenceCard } from "@/components/quick-reference-card"
import { SupportingSystemsSummary, defaultSupportingSystemsData, type SupportingSystemsData } from "@/components/supporting-systems-summary"
import {
  nightFormSchema,
  type NightFormData,
  nightShiftOpeningReviewOptions,
  lateArrivalReviewOptions,
  overnightRoomAssignmentStrategyOptions,
  paymentAuthorizationReviewOptions,
  folioBalanceReviewOptions,
  noShowCancellationReviewOptions,
  preAuditReadinessOptions,
  nightAuditCompletionOptions,
  requiredReportReviewOptions,
  morningArrivalDeparturePrepOptions,
  amHousekeepingPrepOptions,
  nightFinalConfirmationOptions,
} from "@/lib/night-form-schema"
import { ChevronLeft, ChevronRight, CheckCircle2, Send, Save, Home, Loader2, AlertCircle } from "lucide-react"
import { useChecklistSubmit } from "@/hooks/use-checklist-submit"
import { ChecklistActions } from "@/components/checklist-actions"

const STORAGE_KEY = "night-checklist-draft"

const STEP_LABELS = [
  "Shift Info",
  "Late Arrivals",
  "Payment + Audit",
  "Reports + AM Prep",
  "Confirmation",
]

const defaultValues: NightFormData = {
  associateName: "",
  date: new Date().toISOString().split("T")[0],
  shiftStartTime: "23:00",
  shiftEndTime: "07:00",
  managerOnDuty: "",
  startBankCount: "",
  startBankVerified: "No",
  startBankDiscrepancy: "",
  currentOccupancy: "",
  arrivalsRemaining: "",
  departuresRemaining: "",
  vacantReadyRooms: "",
  dirtyRooms: "",
  outOfOrderRooms: "",
  expectedOccupancyAfterAudit: "",
  sellOutRisk: "No",
  sellOutRiskExplanation: "",
  nightAuditCompleted: "Yes",
  nightAuditNotCompletedExplanation: "",
  nightShiftOpeningReview: [],
  lateArrivalReview: [],
  overnightRoomAssignmentStrategy: [],
  standardLateArrivalsPreAssigned: "No",
  standardLateArrivalsPreAssignedExplanation: "",
  vipPriorityLateArrivals: "",
  paymentAuthorizationReview: [],
  folioBalanceReview: [],
  unresolvedPaymentFolioIssues: "No",
  unresolvedPaymentFolioIssuesDetails: "",
  noShowCancellationReview: [],
  noShowExceptions: "No",
  noShowExceptionsDetails: "",
  preAuditReadiness: [],
  nightAuditCompletion: [],
  requiredReportReview: [],
  morningArrivalDeparturePrep: [],
  amHousekeepingPrep: [],
  amShiftHandoffNotes: "",
  supportingSystemsSummary: defaultSupportingSystemsData,
  endBankCount: "",
  endBankVerified: "No",
  endBankDiscrepancy: "",
  finalConfirmation: [],
}

export function NightChecklistForm() {
  const [shuffleRecommendations, setShuffleRecommendations] = useState<any[]>([]); useEffect(() => { try { setShuffleRecommendations(JSON.parse(localStorage.getItem("shuffle-recommendations") || "[]")) } catch { setShuffleRecommendations([]) } }, []);
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { submit, isSubmitting, result } = useChecklistSubmit()

  const form = useForm<NightFormData>({
    resolver: zodResolver(nightFormSchema),
    defaultValues,
  })

  const { register, watch, setValue, handleSubmit, formState: { errors }, reset } = form

  // Load saved draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        reset(parsed)
      } catch {
        // Invalid saved data, ignore
      }
    }
  }, [reset])

  const saveProgress = () => {
    const data = form.getValues()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setSaveMessage("Progress saved!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const clearSavedProgress = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  // Helper to get all checkbox options for task labels
  const allCheckboxOptions = [
    ...nightShiftOpeningReviewOptions,
    ...lateArrivalReviewOptions,
    ...overnightRoomAssignmentStrategyOptions,
    ...paymentAuthorizationReviewOptions,
    ...folioBalanceReviewOptions,
    ...noShowCancellationReviewOptions,
    ...preAuditReadinessOptions,
    ...nightAuditCompletionOptions,
    ...requiredReportReviewOptions,
    ...morningArrivalDeparturePrepOptions,
    ...amHousekeepingPrepOptions,
    ...nightFinalConfirmationOptions,
  ]

  const getCompletedTaskLabels = (): string[] => {
    const allChecked = [
      ...(watch("nightShiftOpeningReview") || []),
      ...(watch("lateArrivalReview") || []),
      ...(watch("overnightRoomAssignmentStrategy") || []),
      ...(watch("paymentAuthorizationReview") || []),
      ...(watch("folioBalanceReview") || []),
      ...(watch("noShowCancellationReview") || []),
      ...(watch("preAuditReadiness") || []),
      ...(watch("nightAuditCompletion") || []),
      ...(watch("requiredReportReview") || []),
      ...(watch("morningArrivalDeparturePrep") || []),
      ...(watch("amHousekeepingPrep") || []),
      ...(watch("nightFinalConfirmation") || []),
    ]
    return allChecked.map(id => {
      const option = allCheckboxOptions.find(opt => opt.id === id)
      return option?.label || id
    })
  }

  const getIncompleteTaskLabels = (): string[] => {
    const allChecked = [
      ...(watch("nightShiftOpeningReview") || []),
      ...(watch("lateArrivalReview") || []),
      ...(watch("overnightRoomAssignmentStrategy") || []),
      ...(watch("paymentAuthorizationReview") || []),
      ...(watch("folioBalanceReview") || []),
      ...(watch("noShowCancellationReview") || []),
      ...(watch("preAuditReadiness") || []),
      ...(watch("nightAuditCompletion") || []),
      ...(watch("requiredReportReview") || []),
      ...(watch("morningArrivalDeparturePrep") || []),
      ...(watch("amHousekeepingPrep") || []),
      ...(watch("nightFinalConfirmation") || []),
    ]
    return allCheckboxOptions
      .filter(opt => !allChecked.includes(opt.id))
      .map(opt => opt.label)
  }

  const onSubmit = async (data: NightFormData) => {
    setSubmitError(null)
    
    const result = await submit({
      checklistType: 'night',
      associateName: data.associateName,
      date: data.date,
      shiftStartTime: data.shiftStartTime,
      shiftEndTime: data.shiftEndTime,
      managerOnDuty: data.managerOnDuty,
      data,
    })
    
    if (result.success) {
      clearSavedProgress()
      setIsSubmitted(true)
    } else {
      setSubmitError(result.error || 'Failed to submit checklist')
    }
  }

  const nextStep = () => {
    if (currentStep < STEP_LABELS.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
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
            Your Night Audit Daily Checklist has been successfully submitted. The AM shift team has been notified.
          </p>
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
      {/* Header with Save and Home buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="text-sm text-green-600 font-medium">{saveMessage}</span>
          )}
          <Button type="button" variant="outline" size="sm" onClick={saveProgress}>
            <Save className="w-4 h-4 mr-2" />
            Save Progress
          </Button>
          <ChecklistActions
            checklistType="night"
            associateName={watch("associateName")}
            date={watch("date")}
            shiftStartTime={watch("shiftStartTime")}
            shiftEndTime={watch("shiftEndTime")}
            managerOnDuty={watch("managerOnDuty")}
            completedTasks={getCompletedTaskLabels()}
            incompleteTasks={getIncompleteTaskLabels()}
            notes={watch("amShiftHandoffNotes")}
            supportingSystemsSummary={watch("supportingSystemsSummary")}
            onClearAll={() => reset(defaultValues)}
          />
        </div>
      </div>

      <FormProgress
        currentStep={currentStep}
        totalSteps={STEP_LABELS.length}
        stepLabels={STEP_LABELS}
      />
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>

      {/* Step 0: Shift Info */}
      {currentStep === 0 && (
        <div className="flex flex-col gap-6">
          <QuickReferenceCard />
          <FormSection title="Associate Information">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="associateName">Associate Name *</Label>
                <Input
                  id="associateName"
                  {...register("associateName")}
                  placeholder="Enter your name"
                />
                {errors.associateName && (
                  <p className="text-sm text-destructive">{errors.associateName.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="managerOnDuty">Manager on Duty / Overnight Manager *</Label>
                <Input
                  id="managerOnDuty"
                  {...register("managerOnDuty")}
                  placeholder="Enter MOD name"
                />
                {errors.managerOnDuty && (
                  <p className="text-sm text-destructive">{errors.managerOnDuty.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" {...register("date")} />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="shiftStartTime">Shift Start Time *</Label>
                <Input id="shiftStartTime" type="time" {...register("shiftStartTime")} />
                {errors.shiftStartTime && (
                  <p className="text-sm text-destructive">{errors.shiftStartTime.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="shiftEndTime">Shift End Time *</Label>
                <Input id="shiftEndTime" type="time" {...register("shiftEndTime")} />
                {errors.shiftEndTime && (
                  <p className="text-sm text-destructive">{errors.shiftEndTime.message}</p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Bank Count - Start of Shift">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startBankCount">Starting Bank Count ($) *</Label>
                <Input
                  id="startBankCount"
                  {...register("startBankCount")}
                  placeholder="e.g., $300.00"
                />
                {errors.startBankCount && (
                  <p className="text-sm text-destructive">{errors.startBankCount.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label>Bank Verified with Outgoing Shift? *</Label>
                <RadioGroup
                  value={watch("startBankVerified")}
                  onValueChange={(value) => setValue("startBankVerified", value as "Yes" | "No")}
                  className="flex gap-4"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="Yes" />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="No" />
                    <span className="text-sm">No</span>
                  </label>
                </RadioGroup>
              </div>
            </div>
            {watch("startBankVerified") === "No" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="startBankDiscrepancy">Explain discrepancy or issue:</Label>
                <Textarea
                  id="startBankDiscrepancy"
                  {...register("startBankDiscrepancy")}
                  placeholder="Describe any bank count discrepancy..."
                  rows={3}
                />
              </div>
            )}
          </FormSection>

          <FormSection title="Room Inventory at Start of Night Shift">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="currentOccupancy">Current Occupancy %</Label>
                <Input
                  id="currentOccupancy"
                  {...register("currentOccupancy")}
                  placeholder="e.g., 92%"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="arrivalsRemaining">Arrivals Remaining</Label>
                <Input
                  id="arrivalsRemaining"
                  {...register("arrivalsRemaining")}
                  placeholder="e.g., 5"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="departuresRemaining">Departures Remaining</Label>
                <Input
                  id="departuresRemaining"
                  {...register("departuresRemaining")}
                  placeholder="e.g., 2"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="vacantReadyRooms">Vacant Ready Rooms</Label>
                <Input
                  id="vacantReadyRooms"
                  {...register("vacantReadyRooms")}
                  placeholder="e.g., 8"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="dirtyRooms">Dirty Rooms</Label>
                <Input
                  id="dirtyRooms"
                  {...register("dirtyRooms")}
                  placeholder="e.g., 3"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="outOfOrderRooms">Out of Order Rooms</Label>
                <Input
                  id="outOfOrderRooms"
                  {...register("outOfOrderRooms")}
                  placeholder="e.g., 2"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="expectedOccupancyAfterAudit">Expected Occupancy After Audit</Label>
                <Input
                  id="expectedOccupancyAfterAudit"
                  {...register("expectedOccupancyAfterAudit")}
                  placeholder="e.g., 95%"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Sell-Out or Oversell Risk Overnight? *</Label>
              <RadioGroup
                value={watch("sellOutRisk")}
                onValueChange={(value) => setValue("sellOutRisk", value as "Yes" | "No")}
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="Yes" />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="No" />
                  <span className="text-sm">No</span>
                </label>
              </RadioGroup>
            </div>
            {watch("sellOutRisk") === "Yes" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="sellOutRiskExplanation">Explain the sell-out or oversell risk:</Label>
                <Textarea
                  id="sellOutRiskExplanation"
                  {...register("sellOutRiskExplanation")}
                  placeholder="Describe the sell-out or oversell risk..."
                  rows={3}
                />
              </div>
            )}
          </FormSection>

          <FormSection title="Night Audit Status">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <div className="flex flex-col gap-2">
              <Label>Was Night Audit Completed Successfully? *</Label>
              <RadioGroup
                value={watch("nightAuditCompleted")}
                onValueChange={(value) => setValue("nightAuditCompleted", value as "Yes" | "No")}
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="Yes" />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="No" />
                  <span className="text-sm">No</span>
                </label>
              </RadioGroup>
            </div>
            {watch("nightAuditCompleted") === "No" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="nightAuditNotCompletedExplanation">Explain why Night Audit was not completed:</Label>
                <Textarea
                  id="nightAuditNotCompletedExplanation"
                  {...register("nightAuditNotCompletedExplanation")}
                  placeholder="Explain the issue with night audit..."
                  rows={3}
                />
              </div>
            )}
          </FormSection>
        </div>
      )}

      {/* Step 1: Late Arrivals (Part 1) */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-6">
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-1">Part 1: 11:00 PM - 12:30 AM</h3>
            <p className="text-sm text-muted-foreground">Night Opening Review + Late Arrivals</p>
          </div>

          <FormSection title="Section 1: Night Shift Opening Review">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Night Shift Opening Review Tasks"
              options={nightShiftOpeningReviewOptions}
              value={watch("nightShiftOpeningReview") || []}
              onChange={(value) => setValue("nightShiftOpeningReview", value)}
            />
          </FormSection>

          <FormSection title="Section 2: Late Arrival Review">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Late Arrival Review Tasks"
              options={lateArrivalReviewOptions}
              value={watch("lateArrivalReview") || []}
              onChange={(value) => setValue("lateArrivalReview", value)}
            />
          </FormSection>

          <FormSection
            title="Section 3: Overnight Room Assignment Strategy"
            description="Room Assignment Rule: Do not pre-assign all remaining arrivals. Standard late arrivals should remain unassigned unless there is a true operational reason."
          >
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Overnight Room Assignment Strategy Tasks"
              options={overnightRoomAssignmentStrategyOptions}
              value={watch("overnightRoomAssignmentStrategy") || []}
              onChange={(value) => setValue("overnightRoomAssignmentStrategy", value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Were any standard late arrivals pre-assigned or protected overnight?</Label>
              <RadioGroup
                value={watch("standardLateArrivalsPreAssigned")}
                onValueChange={(value) => setValue("standardLateArrivalsPreAssigned", value as "Yes" | "No")}
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="Yes" />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="No" />
                  <span className="text-sm">No</span>
                </label>
              </RadioGroup>
            </div>
            {watch("standardLateArrivalsPreAssigned") === "Yes" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="standardLateArrivalsPreAssignedExplanation">If yes, explain why:</Label>
                <Textarea
                  id="standardLateArrivalsPreAssignedExplanation"
                  {...register("standardLateArrivalsPreAssignedExplanation")}
                  placeholder="Explain the reason for pre-assigning standard late arrivals..."
                  rows={3}
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="vipPriorityLateArrivals">VIP / priority late arrivals intentionally assigned or protected:</Label>
              <Textarea
                id="vipPriorityLateArrivals"
                {...register("vipPriorityLateArrivals")}
                placeholder="List guest name, room type, reason for priority assignment, and room number if assigned."
                rows={4}
              />
            </div>
          </FormSection>
        </div>
      )}

      {/* Step 2: Payment + Audit (Part 2) */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-6">
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-1">Part 2: 12:30 AM - 2:30 AM</h3>
            <p className="text-sm text-muted-foreground">Payment, Folio, Ledger + Audit Readiness</p>
          </div>

          <FormSection title="Section 4: Payment and Authorization Review">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Payment and Authorization Review Tasks"
              helpText="For credit card authorization: use the attached Lane or SRED device. Do not manually enter an authorization."
              options={paymentAuthorizationReviewOptions}
              value={watch("paymentAuthorizationReview") || []}
              onChange={(value) => setValue("paymentAuthorizationReview", value)}
            />
          </FormSection>

          <FormSection title="Section 5: Folio and Balance Review">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Folio and Balance Review Tasks"
              options={folioBalanceReviewOptions}
              value={watch("folioBalanceReview") || []}
              onChange={(value) => setValue("folioBalanceReview", value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Any unresolved payment, folio, cash, or balance issues for AM shift?</Label>
              <RadioGroup
                value={watch("unresolvedPaymentFolioIssues")}
                onValueChange={(value) => setValue("unresolvedPaymentFolioIssues", value as "Yes" | "No")}
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="Yes" />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="No" />
                  <span className="text-sm">No</span>
                </label>
              </RadioGroup>
            </div>
            {watch("unresolvedPaymentFolioIssues") === "Yes" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="unresolvedPaymentFolioIssuesDetails">List details:</Label>
                <Textarea
                  id="unresolvedPaymentFolioIssuesDetails"
                  {...register("unresolvedPaymentFolioIssuesDetails")}
                  placeholder="List unresolved payment, folio, cash, or balance issues..."
                  rows={3}
                />
              </div>
            )}
          </FormSection>

          <FormSection title="Section 6: No-Show / Cancellation Review">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="No-Show / Cancellation Review Tasks"
              options={noShowCancellationReviewOptions}
              value={watch("noShowCancellationReview") || []}
              onChange={(value) => setValue("noShowCancellationReview", value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Any no-show exceptions or concerns?</Label>
              <RadioGroup
                value={watch("noShowExceptions")}
                onValueChange={(value) => setValue("noShowExceptions", value as "Yes" | "No")}
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="Yes" />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="No" />
                  <span className="text-sm">No</span>
                </label>
              </RadioGroup>
            </div>
            {watch("noShowExceptions") === "Yes" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="noShowExceptionsDetails">List details:</Label>
                <Textarea
                  id="noShowExceptionsDetails"
                  {...register("noShowExceptionsDetails")}
                  placeholder="List no-show exceptions or concerns..."
                  rows={3}
                />
              </div>
            )}
          </FormSection>
        </div>
      )}

      {/* Step 3: Reports + AM Prep (Part 3 & 4) */}
      {currentStep === 3 && (
        <div className="flex flex-col gap-6">
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-1">Part 3: 2:30 AM - 5:00 AM</h3>
            <p className="text-sm text-muted-foreground">Night Audit, Reports + Business Date Review</p>
          </div>

          <FormSection title="Section 7: Pre-Audit Readiness">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Pre-Audit Readiness Tasks"
              options={preAuditReadinessOptions}
              value={watch("preAuditReadiness") || []}
              onChange={(value) => setValue("preAuditReadiness", value)}
            />
          </FormSection>

          <FormSection title="Section 8: Night Audit Completion">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Night Audit Completion Tasks"
              options={nightAuditCompletionOptions}
              value={watch("nightAuditCompletion") || []}
              onChange={(value) => setValue("nightAuditCompletion", value)}
            />
          </FormSection>

          <FormSection title="Section 9: Required Report Review">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Required Report Review Tasks"
              options={requiredReportReviewOptions}
              value={watch("requiredReportReview") || []}
              onChange={(value) => setValue("requiredReportReview", value)}
            />
          </FormSection>

          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-1">Part 4: 5:00 AM - 7:00 AM</h3>
            <p className="text-sm text-muted-foreground">Morning Prep + AM Handoff</p>
          </div>

          <FormSection title="Section 10: Morning Arrival and Departure Prep">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Morning Arrival and Departure Prep Tasks"
              options={morningArrivalDeparturePrepOptions}
              value={watch("morningArrivalDeparturePrep") || []}
              onChange={(value) => setValue("morningArrivalDeparturePrep", value)}
            />
          </FormSection>

          <FormSection title="Section 11: AM Housekeeping Prep">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="AM Housekeeping Prep Tasks"
              options={amHousekeepingPrepOptions}
              value={watch("amHousekeepingPrep") || []}
              onChange={(value) => setValue("amHousekeepingPrep", value)}
            />
          </FormSection>

          <FormSection title="Section 12: AM Shift Handoff">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="amShiftHandoffNotes">AM Shift Handoff Notes:</Label>
              <Textarea
                id="amShiftHandoffNotes"
                {...register("amShiftHandoffNotes")}
                placeholder="Use handoff format. Include arrivals for today, VIPs, early arrivals, rooms not ready, guest issues, billing issues, group notes, OOO rooms, maintenance, inventory risks, audit status."
                rows={6}
              />
            </div>
          </FormSection>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {currentStep === 4 && (
        <div className="flex flex-col gap-6">
          <SupportingSystemsSummary
            value={watch("supportingSystemsSummary") || defaultSupportingSystemsData}
            onChange={(value: SupportingSystemsData) => setValue("supportingSystemsSummary", value)}
          />

          <FormSection title="Bank Count - End of Shift">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="endBankCount">Ending Bank Count ($) *</Label>
                <Input
                  id="endBankCount"
                  {...register("endBankCount")}
                  placeholder="e.g., $300.00"
                />
                {errors.endBankCount && (
                  <p className="text-sm text-destructive">{errors.endBankCount.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label>Bank Verified with Incoming Shift? *</Label>
                <RadioGroup
                  value={watch("endBankVerified")}
                  onValueChange={(value) => setValue("endBankVerified", value as "Yes" | "No")}
                  className="flex gap-4"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="Yes" />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="No" />
                    <span className="text-sm">No</span>
                  </label>
                </RadioGroup>
              </div>
            </div>
            {watch("endBankVerified") === "No" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="endBankDiscrepancy">Explain discrepancy or issue:</Label>
                <Textarea
                  id="endBankDiscrepancy"
                  {...register("endBankDiscrepancy")}
                  placeholder="Describe any bank count discrepancy..."
                  rows={3}
                />
              </div>
            )}
          </FormSection>

          <FormSection title="Section 13: Final Night Audit Confirmation">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Final Confirmation"
              options={nightFinalConfirmationOptions}
              value={watch("finalConfirmation") || []}
              onChange={(value) => setValue("finalConfirmation", value)}
            />
            {errors.finalConfirmation && (
              <p className="text-sm text-destructive">{errors.finalConfirmation.message}</p>
            )}
          </FormSection>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep === STEP_LABELS.length - 1 ? (
          <Button type="submit" className="gap-2">
            <Send className="w-4 h-4" />
            Submit Checklist
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




