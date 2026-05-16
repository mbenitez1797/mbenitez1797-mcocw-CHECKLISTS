"use client"

import { useState, useEffect } from "react"
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
  formSchema,
  type FormData,
  shiftStartInventoryOptions,
  priorityArrivalOptions,
  roomAssignmentOptions,
  checkInExecutionOptions,
  mobileKeyOptions,
  housekeepingOptions,
  guestIssuesOptions,
  lateArrivalOptions,
  paymentFolioOptions,
  roomInventoryOptions,
  nightShiftHandoffOptions,
  finalConfirmationOptions,
} from "@/lib/form-schema"
import { ChevronLeft, ChevronRight, CheckCircle2, Send, Save, Home, Loader2, AlertCircle } from "lucide-react"
import { useChecklistSubmit } from "@/hooks/use-checklist-submit"
import { ChecklistActions } from "@/components/checklist-actions"

const STORAGE_KEY = "pm-checklist-draft"

const STEP_LABELS = [
  "Shift Info",
  "Inventory Review",
  "Check-In Execution",
  "Night Handoff",
  "Confirmation",
]

const defaultValues: FormData = {
  associateName: "",
  date: new Date().toISOString().split("T")[0],
  shiftStartTime: "15:00",
  shiftEndTime: "23:00",
  managerOnDuty: "",
  startBankCount: "",
  startBankVerified: "No",
  startBankDiscrepancy: "",
  currentOccupancy: "",
  arrivalsRemaining: "",
  departuresRemaining: "",
  vacantReadyRooms: "",
  dirtyRoomsNeeded: "",
  outOfOrderRooms: "",
  sellOutRisk: "No",
  shiftStartInventoryReview: [],
  priorityArrivalReview: [],
  roomAssignmentStrategy: [],
  standardArrivalsPreAssigned: "No",
  preAssignedExplanation: "",
  vipPriorityArrivals: "",
  checkInExecution: [],
  mobileKeyTasks: [],
  housekeepingCoordination: [],
  guestIssuesTasks: [],
  unresolvedGuestIssues: "No",
  unresolvedGuestIssuesDetails: "",
  lateArrivalReview: [],
  paymentFolioReview: [],
  unresolvedPaymentIssues: "No",
  unresolvedPaymentIssuesDetails: "",
  roomInventoryReview: [],
  inventoryConcerns: "No",
  inventoryConcernsDetails: "",
  nightShiftHandoff: [],
  nightShiftHandoffNotes: "",
  supportingSystemsSummary: defaultSupportingSystemsData,
  endBankCount: "",
  endBankVerified: "No",
  endBankDiscrepancy: "",
  finalConfirmation: [],
}

export function ChecklistForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { submit, isSubmitting, result } = useChecklistSubmit()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
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
    ...shiftStartInventoryOptions,
    ...priorityArrivalOptions,
    ...roomAssignmentOptions,
    ...checkInExecutionOptions,
    ...mobileKeyOptions,
    ...housekeepingOptions,
    ...guestIssuesOptions,
    ...lateArrivalOptions,
    ...paymentFolioOptions,
    ...roomInventoryOptions,
    ...nightShiftHandoffOptions,
    ...finalConfirmationOptions,
  ]

  const getCompletedTaskLabels = (): string[] => {
    const allChecked = [
      ...(watch("shiftStartInventoryReview") || []),
      ...(watch("priorityArrivalReview") || []),
      ...(watch("roomAssignmentStrategy") || []),
      ...(watch("checkInExecution") || []),
      ...(watch("mobileKeyTasks") || []),
      ...(watch("housekeepingCoordination") || []),
      ...(watch("guestIssuesTasks") || []),
      ...(watch("lateArrivalReview") || []),
      ...(watch("paymentFolioReview") || []),
      ...(watch("roomInventoryReview") || []),
      ...(watch("nightShiftHandoff") || []),
      ...(watch("finalConfirmation") || []),
    ]
    return allChecked.map(id => {
      const option = allCheckboxOptions.find(opt => opt.id === id)
      return option?.label || id
    })
  }

  const getIncompleteTaskLabels = (): string[] => {
    const allChecked = [
      ...(watch("shiftStartInventoryReview") || []),
      ...(watch("priorityArrivalReview") || []),
      ...(watch("roomAssignmentStrategy") || []),
      ...(watch("checkInExecution") || []),
      ...(watch("mobileKeyTasks") || []),
      ...(watch("housekeepingCoordination") || []),
      ...(watch("guestIssuesTasks") || []),
      ...(watch("lateArrivalReview") || []),
      ...(watch("paymentFolioReview") || []),
      ...(watch("roomInventoryReview") || []),
      ...(watch("nightShiftHandoff") || []),
      ...(watch("finalConfirmation") || []),
    ]
    return allCheckboxOptions
      .filter(opt => !allChecked.includes(opt.id))
      .map(opt => opt.label)
  }

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    
    const result = await submit({
      checklistType: 'pm',
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
            Your PM Front Desk Daily Checklist has been successfully submitted. The night shift team has been notified via email.
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
            checklistType="pm"
            associateName={watch("associateName")}
            date={watch("date")}
            shiftStartTime={watch("shiftStartTime")}
            shiftEndTime={watch("shiftEndTime")}
            managerOnDuty={watch("managerOnDuty")}
            completedTasks={getCompletedTaskLabels()}
            incompleteTasks={getIncompleteTaskLabels()}
            notes={watch("nightShiftHandoffNotes")}
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

      {/* Step 0: Shift Info */}
      {currentStep === 0 && (
        <div className="flex flex-col gap-6">
          <QuickReferenceCard />
          <FormSection title="Associate Information">
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

          <FormSection title="Room Inventory at Start of PM Shift">
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
                <Label htmlFor="arrivalsRemaining">Arrivals Remaining</Label>
                <Input
                  id="arrivalsRemaining"
                  {...register("arrivalsRemaining")}
                  placeholder="e.g., 25"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="departuresRemaining">Departures Remaining</Label>
                <Input
                  id="departuresRemaining"
                  {...register("departuresRemaining")}
                  placeholder="e.g., 5"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="vacantReadyRooms">Vacant Ready Rooms</Label>
                <Input
                  id="vacantReadyRooms"
                  {...register("vacantReadyRooms")}
                  placeholder="e.g., 15"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="dirtyRoomsNeeded">Dirty Rooms Still Needed</Label>
                <Input
                  id="dirtyRoomsNeeded"
                  {...register("dirtyRoomsNeeded")}
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
              <Label>Sell-Out or Oversell Risk Tonight? *</Label>
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
          </FormSection>
        </div>
      )}

      {/* Step 1: Inventory Review (Part 1) */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-6">
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-1">Part 1: 3:00 PM - 5:00 PM</h3>
            <p className="text-sm text-muted-foreground">Shift Start + Priority Arrivals</p>
          </div>

          <FormSection title="Section 1: Shift Start Inventory Review">
            <CheckboxGroup
              label="Shift Start Inventory Review Tasks"
              options={shiftStartInventoryOptions}
              value={watch("shiftStartInventoryReview") || []}
              onChange={(value) => setValue("shiftStartInventoryReview", value)}
            />
          </FormSection>

          <FormSection title="Section 2: Priority Arrival Review">
            <CheckboxGroup
              label="Priority Arrival Review Tasks"
              options={priorityArrivalOptions}
              value={watch("priorityArrivalReview") || []}
              onChange={(value) => setValue("priorityArrivalReview", value)}
            />
          </FormSection>

          <FormSection
            title="Section 3: PM Room Assignment Strategy"
            description="Room Assignment Rule: Do not pre-assign all remaining arrivals. Standard arrivals should remain unassigned so desk has flexibility based on who arrives first."
          >
            <CheckboxGroup
              label="Room Assignment Strategy Tasks"
              options={roomAssignmentOptions}
              value={watch("roomAssignmentStrategy") || []}
              onChange={(value) => setValue("roomAssignmentStrategy", value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Were any standard arrivals pre-assigned during PM shift?</Label>
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
              <Label htmlFor="vipPriorityArrivals">VIP / Priority Arrivals Intentionally Assigned or Protected</Label>
              <Textarea
                id="vipPriorityArrivals"
                {...register("vipPriorityArrivals")}
                placeholder="List guest name, room type, reason for priority assignment, and room number if assigned"
                rows={4}
              />
            </div>
          </FormSection>
        </div>
      )}

      {/* Step 2: Check-In Execution (Part 2) */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-6">
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-1">Part 2: 5:00 PM - 8:00 PM</h3>
            <p className="text-sm text-muted-foreground">Peak Check-In Execution + Guest Recovery</p>
          </div>

          <FormSection title="Section 4: Check-In Execution">
            <CheckboxGroup
              label="Check-In Execution Tasks"
              helpText="For credit card authorization: use the attached Lane or SRED device. Do not manually enter an authorization. Confirm authorization posts successfully."
              options={checkInExecutionOptions}
              value={watch("checkInExecution") || []}
              onChange={(value) => setValue("checkInExecution", value)}
            />
          </FormSection>

          <FormSection title="Section 5: Mobile Key / Digital Key">
            <CheckboxGroup
              label="Mobile Key / Digital Key Tasks"
              options={mobileKeyOptions}
              value={watch("mobileKeyTasks") || []}
              onChange={(value) => setValue("mobileKeyTasks", value)}
            />
          </FormSection>

          <FormSection title="Section 6: Housekeeping Coordination">
            <CheckboxGroup
              label="Housekeeping Coordination Tasks"
              options={housekeepingOptions}
              value={watch("housekeepingCoordination") || []}
              onChange={(value) => setValue("housekeepingCoordination", value)}
            />
          </FormSection>

          <FormSection title="Section 7: Guest Issues and Service Recovery">
            <CheckboxGroup
              label="Guest Issues and Service Recovery Tasks"
              options={guestIssuesOptions}
              value={watch("guestIssuesTasks") || []}
              onChange={(value) => setValue("guestIssuesTasks", value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Any unresolved guest issues for night shift?</Label>
              <RadioGroup
                value={watch("unresolvedGuestIssues")}
                onValueChange={(value) => setValue("unresolvedGuestIssues", value as "Yes" | "No")}
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
            {watch("unresolvedGuestIssues") === "Yes" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="unresolvedGuestIssuesDetails">Guest name / room / issue / next action:</Label>
                <Textarea
                  id="unresolvedGuestIssuesDetails"
                  {...register("unresolvedGuestIssuesDetails")}
                  placeholder="List unresolved guest issues for night shift..."
                  rows={4}
                />
              </div>
            )}
          </FormSection>
        </div>
      )}

      {/* Step 3: Night Handoff (Part 3) */}
      {currentStep === 3 && (
        <div className="flex flex-col gap-6">
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-1">Part 3: 8:00 PM - 11:00 PM</h3>
            <p className="text-sm text-muted-foreground">Late Arrivals + Night Audit Handoff Prep</p>
          </div>

          <FormSection title="Section 8: Late Arrival Review">
            <CheckboxGroup
              label="Late Arrival Review Tasks"
              options={lateArrivalOptions}
              value={watch("lateArrivalReview") || []}
              onChange={(value) => setValue("lateArrivalReview", value)}
            />
          </FormSection>

          <FormSection title="Section 9: Payment / Folio / Cash Review">
            <CheckboxGroup
              label="Payment / Folio / Cash Review Tasks"
              options={paymentFolioOptions}
              value={watch("paymentFolioReview") || []}
              onChange={(value) => setValue("paymentFolioReview", value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Any unresolved payment, folio, or cash issues for night shift?</Label>
              <RadioGroup
                value={watch("unresolvedPaymentIssues")}
                onValueChange={(value) => setValue("unresolvedPaymentIssues", value as "Yes" | "No")}
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
            {watch("unresolvedPaymentIssues") === "Yes" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="unresolvedPaymentIssuesDetails">Describe the unresolved payment, folio, or cash issue:</Label>
                <Textarea
                  id="unresolvedPaymentIssuesDetails"
                  {...register("unresolvedPaymentIssuesDetails")}
                  placeholder="Describe unresolved payment issues..."
                  rows={4}
                />
              </div>
            )}
          </FormSection>

          <FormSection title="Section 10: Room Inventory Review">
            <CheckboxGroup
              label="Room Inventory Review Tasks"
              options={roomInventoryOptions}
              value={watch("roomInventoryReview") || []}
              onChange={(value) => setValue("roomInventoryReview", value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Any inventory concerns for night shift?</Label>
              <RadioGroup
                value={watch("inventoryConcerns")}
                onValueChange={(value) => setValue("inventoryConcerns", value as "Yes" | "No")}
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
            {watch("inventoryConcerns") === "Yes" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="inventoryConcernsDetails">Describe inventory concern:</Label>
                <Textarea
                  id="inventoryConcernsDetails"
                  {...register("inventoryConcernsDetails")}
                  placeholder="Describe inventory concerns..."
                  rows={3}
                />
              </div>
            )}
          </FormSection>

          <FormSection title="Section 11: Night Shift Handoff">
            <CheckboxGroup
              label="Night Shift Handoff Tasks"
              helpText="Maintenance: document room number, issue, status. Inventory: document sold-out types, oversell risk. MOD: verbally or digitally update before leaving."
              options={nightShiftHandoffOptions}
              value={watch("nightShiftHandoff") || []}
              onChange={(value) => setValue("nightShiftHandoff", value)}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="nightShiftHandoffNotes">Night Shift Handoff Notes</Label>
              <Textarea
                id="nightShiftHandoffNotes"
                {...register("nightShiftHandoffNotes")}
                placeholder="Enter handoff notes in requested format..."
                rows={6}
              />
            </div>
          </FormSection>
        </div>
      )}

      {/* Step 4: Final Confirmation */}
      {currentStep === 4 && (
        <div className="flex flex-col gap-6">
          <SupportingSystemsSummary
            value={watch("supportingSystemsSummary") || defaultSupportingSystemsData}
            onChange={(value: SupportingSystemsData) => setValue("supportingSystemsSummary", value)}
          />

          <FormSection title="Bank Count - End of Shift">
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

          <FormSection
            title="Section 12: Final PM Confirmation"
            description="Please confirm all items below before submitting the checklist."
          >
            <CheckboxGroup
              label="Final PM Confirmation *"
              options={finalConfirmationOptions}
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

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
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

        {currentStep < STEP_LABELS.length - 1 ? (
          <Button type="button" onClick={nextStep} className="gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
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
        )}
      </div>
    </form>
  )
}



