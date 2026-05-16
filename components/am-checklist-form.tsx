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
  amFormSchema,
  type AMFormData,
  openingStayPMSReviewOptions,
  overnightFollowUpOptions,
  departureReviewOptions,
  openBalanceLedgerReviewOptions,
  housekeepingAlignmentOptions,
  arrivalReviewOptions,
  amRoomAssignmentStrategyOptions,
  paymentBillingProfileReadinessOptions,
  groupsEventsReviewOptions,
  finalRoomInventoryCheckOptions,
  guestFollowUpCheckOptions,
  pmShiftHandoffOptions,
  amFinalConfirmationOptions,
} from "@/lib/am-form-schema"
import { ChevronLeft, ChevronRight, CheckCircle2, Send, Save, Home, Loader2, AlertCircle } from "lucide-react"
import { useChecklistSubmit } from "@/hooks/use-checklist-submit"
import { ChecklistActions } from "@/components/checklist-actions"

const STORAGE_KEY = "am-checklist-draft"

const STEP_LABELS = [
  "Shift Info",
  "Opening Review",
  "HK + Arrivals",
  "Final Prep",
  "Confirmation",
]

const defaultValues: AMFormData = {
  associateName: "",
  date: new Date().toISOString().split("T")[0],
  shiftStartTime: "07:00",
  shiftEndTime: "15:00",
  managerOnDuty: "",
  startBankCount: "",
  startBankVerified: "No",
  startBankDiscrepancy: "",
  currentOccupancy: "",
  totalArrivals: "",
  totalDepartures: "",
  vacantReadyRooms: "",
  outOfOrderRooms: "",
  sellOutRisk: "No",
  sellOutRiskExplanation: "",
  openingStayPMSReview: [],
  overnightFollowUp: [],
  unresolvedOvernightIssues: "No",
  unresolvedOvernightExplanation: "",
  departureReview: [],
  departureNotes: "",
  openBalanceLedgerReview: [],
  openBalanceIssues: "No",
  openBalanceIssuesDetails: "",
  housekeepingAlignment: [],
  priorityRoomsCommunicated: "",
  arrivalReview: [],
  roomAssignmentStrategy: [],
  standardArrivalsPreAssigned: "No",
  preAssignedExplanation: "",
  vipPriorityArrivals: "",
  paymentBillingProfileReadiness: [],
  paymentBillingProfileIssues: "No",
  paymentBillingProfileIssuesDetails: "",
  groupsEventsReview: [],
  groupIssues: "No issues",
  groupIssuesDetails: "",
  finalRoomInventoryCheck: [],
  roomInventoryConcerns: "No",
  roomInventoryConcernsDetails: "",
  guestFollowUpCheck: [],
  guestFollowUpsCompleted: "Yes",
  guestFollowUpsDetails: "",
  pmShiftHandoff: [],
  pmHandoffNotes: "",
  supportingSystemsSummary: defaultSupportingSystemsData,
  endBankCount: "",
  endBankVerified: "No",
  endBankDiscrepancy: "",
  finalConfirmation: [],
}

export function AMChecklistForm() {
  const [shuffleRecommendations, setShuffleRecommendations] = useState<any[]>([]); useEffect(() => { try { setShuffleRecommendations(JSON.parse(localStorage.getItem("shuffle-recommendations") || "[]")) } catch { setShuffleRecommendations([]) } }, []);
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { submit, isSubmitting, result } = useChecklistSubmit()

  const form = useForm<AMFormData>({
    resolver: zodResolver(amFormSchema),
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
    ...openingStayPMSReviewOptions,
    ...overnightFollowUpOptions,
    ...departureReviewOptions,
    ...openBalanceLedgerReviewOptions,
    ...housekeepingAlignmentOptions,
    ...arrivalReviewOptions,
    ...amRoomAssignmentStrategyOptions,
    ...paymentBillingProfileReadinessOptions,
    ...groupsEventsReviewOptions,
    ...finalRoomInventoryCheckOptions,
    ...guestFollowUpCheckOptions,
    ...pmShiftHandoffOptions,
    ...amFinalConfirmationOptions,
  ]

  const getCompletedTaskLabels = (): string[] => {
    const allChecked = [
      ...(watch("openingStayPMSReview") || []),
      ...(watch("overnightFollowUp") || []),
      ...(watch("departureReview") || []),
      ...(watch("openBalanceLedgerReview") || []),
      ...(watch("housekeepingAlignment") || []),
      ...(watch("arrivalReview") || []),
      ...(watch("amRoomAssignmentStrategy") || []),
      ...(watch("paymentBillingProfileReadiness") || []),
      ...(watch("groupsEventsReview") || []),
      ...(watch("finalRoomInventoryCheck") || []),
      ...(watch("guestFollowUpCheck") || []),
      ...(watch("pmShiftHandoff") || []),
      ...(watch("amFinalConfirmation") || []),
    ]
    return allChecked.map(id => {
      const option = allCheckboxOptions.find(opt => opt.id === id)
      return option?.label || id
    })
  }

  const getIncompleteTaskLabels = (): string[] => {
    const allChecked = [
      ...(watch("openingStayPMSReview") || []),
      ...(watch("overnightFollowUp") || []),
      ...(watch("departureReview") || []),
      ...(watch("openBalanceLedgerReview") || []),
      ...(watch("housekeepingAlignment") || []),
      ...(watch("arrivalReview") || []),
      ...(watch("amRoomAssignmentStrategy") || []),
      ...(watch("paymentBillingProfileReadiness") || []),
      ...(watch("groupsEventsReview") || []),
      ...(watch("finalRoomInventoryCheck") || []),
      ...(watch("guestFollowUpCheck") || []),
      ...(watch("pmShiftHandoff") || []),
      ...(watch("amFinalConfirmation") || []),
    ]
    return allCheckboxOptions
      .filter(opt => !allChecked.includes(opt.id))
      .map(opt => opt.label)
  }

  const onSubmit = async (data: AMFormData) => {
    setSubmitError(null)
    
    const result = await submit({
      checklistType: 'am',
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
            Your AM Front Desk Daily Checklist has been successfully submitted. The PM shift team has been notified via email.
          </p>
          {result?.oneDrive?.fileUrl && (
            <p className="text-sm text-muted-foreground">
              A copy has been saved to OneDrive.
            </p>
          )}
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
            checklistType="am"
            associateName={watch("associateName")}
            date={watch("date")}
            shiftStartTime={watch("shiftStartTime")}
            shiftEndTime={watch("shiftEndTime")}
            managerOnDuty={watch("managerOnDuty")}
            completedTasks={getCompletedTaskLabels()}
            incompleteTasks={getIncompleteTaskLabels()}
            notes={watch("pmHandoffNotes")}
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
                <Label htmlFor="managerOnDuty">Manager on Duty *</Label>
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

          <FormSection title="Room Inventory at Start of AM Shift">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="currentOccupancy">Current Occupancy %</Label>
                <Input
                  id="currentOccupancy"
                  {...register("currentOccupancy")}
                  placeholder="e.g., 85%"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="totalArrivals">Total Arrivals Today</Label>
                <Input
                  id="totalArrivals"
                  {...register("totalArrivals")}
                  placeholder="e.g., 40"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="totalDepartures">Total Departures Today</Label>
                <Input
                  id="totalDepartures"
                  {...register("totalDepartures")}
                  placeholder="e.g., 35"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="vacantReadyRooms">Vacant Ready Rooms</Label>
                <Input
                  id="vacantReadyRooms"
                  {...register("vacantReadyRooms")}
                  placeholder="e.g., 10"
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
            </div>
            <div className="flex flex-col gap-2">
              <Label>Sell-Out or Oversell Risk Today? *</Label>
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
        </div>
      )}

      {/* Step 1: Opening Review (Part 1) */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-6">
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-1">Part 1: 7:00 AM - 9:00 AM</h3>
            <p className="text-sm text-muted-foreground">Opening Review + Departures</p>
          </div>

          <FormSection title="Section 1: Opening Stay PMS Review">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Opening Stay PMS Review Tasks"
              options={openingStayPMSReviewOptions}
              value={watch("openingStayPMSReview") || []}
              onChange={(value) => setValue("openingStayPMSReview", value)}
            />
          </FormSection>

          <FormSection title="Section 2: Overnight Follow-Up">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Overnight Follow-Up Tasks"
              options={overnightFollowUpOptions}
              value={watch("overnightFollowUp") || []}
              onChange={(value) => setValue("overnightFollowUp", value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Any unresolved overnight issues?</Label>
              <RadioGroup
                value={watch("unresolvedOvernightIssues")}
                onValueChange={(value) => setValue("unresolvedOvernightIssues", value as "Yes" | "No")}
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
            {watch("unresolvedOvernightIssues") === "Yes" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="unresolvedOvernightExplanation">Explain what still needs follow-up:</Label>
                <Textarea
                  id="unresolvedOvernightExplanation"
                  {...register("unresolvedOvernightExplanation")}
                  placeholder="Describe unresolved overnight issues..."
                  rows={3}
                />
              </div>
            )}
          </FormSection>

          <FormSection title="Section 3: Departure Review">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Departure Review Tasks"
              options={departureReviewOptions}
              value={watch("departureReview") || []}
              onChange={(value) => setValue("departureReview", value)}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="departureNotes">Departure notes or issues:</Label>
              <Textarea
                id="departureNotes"
                {...register("departureNotes")}
                placeholder="Document any departure notes or issues..."
                rows={3}
              />
            </div>
          </FormSection>

          <FormSection title="Section 4: Open Balance / Ledger Review">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Open Balance / Ledger Review Tasks"
              options={openBalanceLedgerReviewOptions}
              value={watch("openBalanceLedgerReview") || []}
              onChange={(value) => setValue("openBalanceLedgerReview", value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Any open balance issues remaining?</Label>
              <RadioGroup
                value={watch("openBalanceIssues")}
                onValueChange={(value) => setValue("openBalanceIssues", value as "Yes" | "No")}
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
            {watch("openBalanceIssues") === "Yes" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="openBalanceIssuesDetails">Guest name / room / issue:</Label>
                <Textarea
                  id="openBalanceIssuesDetails"
                  {...register("openBalanceIssuesDetails")}
                  placeholder="List open balance issues..."
                  rows={3}
                />
              </div>
            )}
          </FormSection>
        </div>
      )}

      {/* Step 2: HK + Arrivals (Part 2) */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-6">
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-1">Part 2: 9:00 AM - 1:00 PM</h3>
            <p className="text-sm text-muted-foreground">Housekeeping Coordination + Arrival Readiness</p>
          </div>

          <FormSection title="Section 5: Housekeeping Alignment">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Housekeeping Alignment Tasks"
              options={housekeepingAlignmentOptions}
              value={watch("housekeepingAlignment") || []}
              onChange={(value) => setValue("housekeepingAlignment", value)}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="priorityRoomsCommunicated">Priority rooms communicated to housekeeping:</Label>
              <Textarea
                id="priorityRoomsCommunicated"
                {...register("priorityRoomsCommunicated")}
                placeholder="List only true priority rooms: VIPs, accessibility needs, connecting/adjoining rooms, suites, early arrivals, service recovery rooms, or operational needs."
                rows={3}
              />
            </div>
          </FormSection>

          <FormSection
            title="Section 6: Arrival Review"
            description="Do Not Pre-Assign Standard Arrivals"
          >
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Arrival Review Tasks"
              options={arrivalReviewOptions}
              value={watch("arrivalReview") || []}
              onChange={(value) => setValue("arrivalReview", value)}
            />
          </FormSection>

          <FormSection
            title="Section 7: Room Assignment Strategy"
            description="Room Assignment Rule: Do not pre-assign all arrivals. Standard arrivals should remain unassigned so the desk has flexibility based on who arrives first."
          >
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Room Assignment Strategy Tasks"
              options={amRoomAssignmentStrategyOptions}
              value={watch("roomAssignmentStrategy") || []}
              onChange={(value) => setValue("roomAssignmentStrategy", value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Were any standard arrivals pre-assigned?</Label>
              <RadioGroup
                value={watch("standardArrivalsPreAssigned")}
                onValueChange={(value) => setValue("standardArrivalsPreAssigned", value as "Yes" | "No")}
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
            {watch("standardArrivalsPreAssigned") === "Yes" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="preAssignedExplanation">If yes, explain why:</Label>
                <Textarea
                  id="preAssignedExplanation"
                  {...register("preAssignedExplanation")}
                  placeholder="Explain the reason for pre-assigning standard arrivals..."
                  rows={3}
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="vipPriorityArrivals">VIP / priority arrivals intentionally pre-assigned:</Label>
              <Textarea
                id="vipPriorityArrivals"
                {...register("vipPriorityArrivals")}
                placeholder="List guest name, room type, reason for priority assignment, and room number if assigned."
                rows={4}
              />
            </div>
          </FormSection>

          <FormSection title="Section 8: Payment, Billing, and Profile Readiness">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Payment, Billing, and Profile Readiness Tasks"
              options={paymentBillingProfileReadinessOptions}
              value={watch("paymentBillingProfileReadiness") || []}
              onChange={(value) => setValue("paymentBillingProfileReadiness", value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Any payment, billing, or profile issues remaining?</Label>
              <RadioGroup
                value={watch("paymentBillingProfileIssues")}
                onValueChange={(value) => setValue("paymentBillingProfileIssues", value as "Yes" | "No")}
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
            {watch("paymentBillingProfileIssues") === "Yes" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="paymentBillingProfileIssuesDetails">List details:</Label>
                <Textarea
                  id="paymentBillingProfileIssuesDetails"
                  {...register("paymentBillingProfileIssuesDetails")}
                  placeholder="List payment, billing, or profile issues..."
                  rows={3}
                />
              </div>
            )}
          </FormSection>

          <FormSection title="Section 9: Groups and Events Review">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Groups and Events Review Tasks"
              options={groupsEventsReviewOptions}
              value={watch("groupsEventsReview") || []}
              onChange={(value) => setValue("groupsEventsReview", value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Any group issues today?</Label>
              <RadioGroup
                value={watch("groupIssues")}
                onValueChange={(value) => setValue("groupIssues", value as "No groups today" | "No issues" | "Yes")}
                className="flex flex-wrap gap-4"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="No groups today" />
                  <span className="text-sm">No groups today</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="No issues" />
                  <span className="text-sm">No issues</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="Yes" />
                  <span className="text-sm">Yes</span>
                </label>
              </RadioGroup>
            </div>
            {watch("groupIssues") === "Yes" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="groupIssuesDetails">Describe group issue:</Label>
                <Textarea
                  id="groupIssuesDetails"
                  {...register("groupIssuesDetails")}
                  placeholder="Describe the group issue..."
                  rows={3}
                />
              </div>
            )}
          </FormSection>
        </div>
      )}

      {/* Step 3: Final Prep (Part 3) */}
      {currentStep === 3 && (
        <div className="flex flex-col gap-6">
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-1">Part 3: 1:00 PM - 3:00 PM</h3>
            <p className="text-sm text-muted-foreground">Final Arrival Prep + PM Handoff</p>
          </div>

          <FormSection title="Section 10: Final Room Inventory Check">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Final Room Inventory Check Tasks"
              options={finalRoomInventoryCheckOptions}
              value={watch("finalRoomInventoryCheck") || []}
              onChange={(value) => setValue("finalRoomInventoryCheck", value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Any room inventory concerns for PM shift?</Label>
              <RadioGroup
                value={watch("roomInventoryConcerns")}
                onValueChange={(value) => setValue("roomInventoryConcerns", value as "Yes" | "No")}
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
            {watch("roomInventoryConcerns") === "Yes" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="roomInventoryConcernsDetails">Describe inventory concern:</Label>
                <Textarea
                  id="roomInventoryConcernsDetails"
                  {...register("roomInventoryConcernsDetails")}
                  placeholder="Describe the room inventory concern..."
                  rows={3}
                />
              </div>
            )}
          </FormSection>

          <FormSection title="Section 11: Guest Follow-Up Check">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Guest Follow-Up Check Tasks"
              options={guestFollowUpCheckOptions}
              value={watch("guestFollowUpCheck") || []}
              onChange={(value) => setValue("guestFollowUpCheck", value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Guest follow-ups completed?</Label>
              <RadioGroup
                value={watch("guestFollowUpsCompleted")}
                onValueChange={(value) => setValue("guestFollowUpsCompleted", value as "Yes" | "No" | "NA")}
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
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="NA" />
                  <span className="text-sm">N/A</span>
                </label>
              </RadioGroup>
            </div>
            {watch("guestFollowUpsCompleted") === "No" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="guestFollowUpsDetails">Explain what remains:</Label>
                <Textarea
                  id="guestFollowUpsDetails"
                  {...register("guestFollowUpsDetails")}
                  placeholder="Explain what guest follow-ups remain..."
                  rows={3}
                />
              </div>
            )}
          </FormSection>

          <FormSection title="Section 12: PM Shift Handoff">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="PM Shift Handoff Tasks"
              options={pmShiftHandoffOptions}
              value={watch("pmShiftHandoff") || []}
              onChange={(value) => setValue("pmShiftHandoff", value)}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="pmHandoffNotes">PM Handoff Notes:</Label>
              <Textarea
                id="pmHandoffNotes"
                {...register("pmHandoffNotes")}
                placeholder="Use handoff format provided. Include arrivals remaining, VIPs, early arrivals waiting, rooms not ready, guest issues, billing issues, group notes, OOO rooms, maintenance, inventory risks."
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

          <FormSection title="Section 13: Final AM Confirmation">
<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Shuffle Recommendation:</strong> {shuffleRecommendations.length ? shuffleRecommendations.map((r:any)=>r.title || r.message || JSON.stringify(r)).join("; ") : "No shuffle needed based on uploaded inventory."}</div>
            <CheckboxGroup
              label="Final Confirmation"
              options={amFinalConfirmationOptions}
              value={watch("finalConfirmation") || []}
              onChange={(value) => setValue("finalConfirmation", value)}
            />
            {errors.finalConfirmation && (
              <p className="text-sm text-destructive">{errors.finalConfirmation.message}</p>
            )}
          </FormSection>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Submission Failed</p>
            <p className="text-sm text-destructive/80">{submitError}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0 || isSubmitting}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep === STEP_LABELS.length - 1 ? (
          <Button type="submit" className="gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Checklist
              </>
            )}
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




