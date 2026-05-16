"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Home, Save, CheckCircle2, Send, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react"
import { useChecklistSubmit } from "@/hooks/use-checklist-submit"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

import { FormSection } from "@/components/form-section"
import { CheckboxGroup } from "@/components/checkbox-group"
import { FormProgress } from "@/components/form-progress"
import { QuickReferenceCard } from "@/components/quick-reference-card"
import { SupportingSystemsSummary, defaultSupportingSystemsData, type SupportingSystemsData } from "@/components/supporting-systems-summary"

import {
  adminFormSchema,
  type AdminFormValues,
  dailySystemReviewOptions,
  arrivalProfileCleanupOptions,
  billingFolioLedgerReviewOptions,
  adminGroupsEventsReviewOptions,
  reportingFollowUpOptions,
  adminFinalConfirmationOptions,
} from "@/lib/admin-form-schema"

const STORAGE_KEY = "admin-checklist-draft"

const steps = [
  "Shift Info & Bank Count",
  "System Review",
  "Reservation Quality",
  "Financial Review",
  "Groups & Events",
  "Reports & Follow-Up",
  "Final Confirmation",
]

export function AdminChecklistForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { submit, isSubmitting, result } = useChecklistSubmit()

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      adminName: "",
      date: new Date().toISOString().split("T")[0],
      shiftStartTime: "",
      shiftEndTime: "",
      managerOnDuty: "",
      startBankCount: "",
      startBankVerified: "Yes",
      startBankDiscrepancy: "",
      currentOccupancy: "",
      totalArrivals: "",
      totalDepartures: "",
      totalInHouseRooms: "",
      vacantReadyRooms: "",
      dirtyRooms: "",
      outOfOrderRooms: "",
      sellOutRisk: "No",
      sellOutRiskExplanation: "",
      dailySystemReview: [],
      arrivalProfileCleanup: [],
      reservationCleanupNotes: "",
      billingFolioLedgerReview: [],
      unresolvedBillingIssues: "No",
      unresolvedBillingDetails: "",
      groupsEventsReview: [],
      groupIssues: "No issues",
      groupIssueDetails: "",
      reportingFollowUp: [],
      adminSummaryNotes: "",
      supportingSystemsSummary: defaultSupportingSystemsData,
      endBankCount: "",
      endBankVerified: "Yes",
      endBankDiscrepancy: "",
      finalConfirmation: [],
    },
  })

  const { watch, setValue, handleSubmit } = form
  const watchedValues = watch()

  // Load saved draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        Object.keys(parsed).forEach((key) => {
          setValue(key as keyof AdminFormValues, parsed[key])
        })
      } catch (e) {
        console.error("Failed to load saved draft:", e)
      }
    }
  }, [setValue])

  const saveProgress = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedValues))
    setSaveMessage("Progress saved!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const onSubmit = async (data: AdminFormValues) => {
    setSubmitError(null)
    
    const result = await submit({
      checklistType: 'admin',
      associateName: data.adminName,
      date: data.date,
      shiftStartTime: data.shiftStartTime,
      shiftEndTime: data.shiftEndTime,
      managerOnDuty: data.managerOnDuty,
      data,
    })
    
    if (result.success) {
      localStorage.removeItem(STORAGE_KEY)
      setIsSubmitted(true)
    } else {
      setSubmitError(result.error || 'Failed to submit checklist')
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
            <h2 className="mb-2 text-2xl font-bold">Checklist Submitted!</h2>
            <p className="mb-6 text-center text-muted-foreground">
              Your Admin Daily Checklist has been submitted successfully.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => setIsSubmitted(false)}>
                Submit Another Checklist
              </Button>
              <Link href="/">
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {saveMessage && (
              <span className="text-sm text-green-600">{saveMessage}</span>
            )}
            <Button variant="outline" size="sm" onClick={saveProgress}>
              <Save className="mr-2 h-4 w-4" />
              Save Progress
            </Button>
          </div>
        </div>

        {/* Title */}
        <Card className="mb-6 bg-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Admin Daily Checklist
            </CardTitle>
            <p className="text-center text-purple-100">
              Front Office Admin / Rooms Admin / Operations Admin
            </p>
          </CardHeader>
        </Card>

        {/* Progress */}
        <FormProgress currentStep={currentStep} totalSteps={steps.length} stepLabels={steps.map(s => s.title)} />

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 0: Shift Info & Bank Count */}
          {currentStep === 0 && (
            <>
              <QuickReferenceCard />
              <FormSection title="Shift Information & Bank Count">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="adminName">Admin Name *</Label>
                  <Input
                    id="adminName"
                    {...form.register("adminName")}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" {...form.register("date")} />
                </div>
                <div>
                  <Label htmlFor="shiftStartTime">Shift Start Time *</Label>
                  <Input
                    id="shiftStartTime"
                    type="time"
                    {...form.register("shiftStartTime")}
                  />
                </div>
                <div>
                  <Label htmlFor="shiftEndTime">Shift End Time *</Label>
                  <Input
                    id="shiftEndTime"
                    type="time"
                    {...form.register("shiftEndTime")}
                  />
                </div>
                <div>
                  <Label htmlFor="managerOnDuty">Manager on Duty *</Label>
                  <Input
                    id="managerOnDuty"
                    {...form.register("managerOnDuty")}
                    placeholder="Enter MOD name"
                  />
                </div>
              </div>

              {/* Bank Count - Start */}
              <Card className="mt-6 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">
                    Bank Count - Start of Shift
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="startBankCount">Starting Bank Count ($) *</Label>
                    <Input
                      id="startBankCount"
                      {...form.register("startBankCount")}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label>Bank Verified with Outgoing Shift? *</Label>
                    <RadioGroup
                      value={watchedValues.startBankVerified}
                      onValueChange={(value) =>
                        setValue("startBankVerified", value as "Yes" | "No")
                      }
                      className="mt-2 flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="startBankYes" />
                        <Label htmlFor="startBankYes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="startBankNo" />
                        <Label htmlFor="startBankNo">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {watchedValues.startBankVerified === "No" && (
                    <div>
                      <Label htmlFor="startBankDiscrepancy">
                        Explain discrepancy
                      </Label>
                      <Textarea
                        id="startBankDiscrepancy"
                        {...form.register("startBankDiscrepancy")}
                        placeholder="Describe the discrepancy..."
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Inventory Info */}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="currentOccupancy">Current Occupancy %</Label>
                  <Input
                    id="currentOccupancy"
                    {...form.register("currentOccupancy")}
                    placeholder="e.g., 85%"
                  />
                </div>
                <div>
                  <Label htmlFor="totalArrivals">Total Arrivals Today</Label>
                  <Input
                    id="totalArrivals"
                    {...form.register("totalArrivals")}
                    placeholder="e.g., 45"
                  />
                </div>
                <div>
                  <Label htmlFor="totalDepartures">Total Departures Today</Label>
                  <Input
                    id="totalDepartures"
                    {...form.register("totalDepartures")}
                    placeholder="e.g., 30"
                  />
                </div>
                <div>
                  <Label htmlFor="totalInHouseRooms">Total In-House Rooms</Label>
                  <Input
                    id="totalInHouseRooms"
                    {...form.register("totalInHouseRooms")}
                    placeholder="e.g., 120"
                  />
                </div>
                <div>
                  <Label htmlFor="vacantReadyRooms">Vacant Ready Rooms</Label>
                  <Input
                    id="vacantReadyRooms"
                    {...form.register("vacantReadyRooms")}
                    placeholder="e.g., 15"
                  />
                </div>
                <div>
                  <Label htmlFor="dirtyRooms">Dirty Rooms</Label>
                  <Input
                    id="dirtyRooms"
                    {...form.register("dirtyRooms")}
                    placeholder="e.g., 25"
                  />
                </div>
                <div>
                  <Label htmlFor="outOfOrderRooms">Out of Order Rooms</Label>
                  <Input
                    id="outOfOrderRooms"
                    {...form.register("outOfOrderRooms")}
                    placeholder="e.g., 3"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label>Sell-Out or Oversell Risk Today?</Label>
                <RadioGroup
                  value={watchedValues.sellOutRisk}
                  onValueChange={(value) =>
                    setValue("sellOutRisk", value as "Yes" | "No")
                  }
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="sellOutYes" />
                    <Label htmlFor="sellOutYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="sellOutNo" />
                    <Label htmlFor="sellOutNo">No</Label>
                  </div>
                </RadioGroup>
              </div>
              {watchedValues.sellOutRisk === "Yes" && (
                <div className="mt-4">
                  <Label htmlFor="sellOutRiskExplanation">
                    Explain the inventory risk
                  </Label>
                  <Textarea
                    id="sellOutRiskExplanation"
                    {...form.register("sellOutRiskExplanation")}
                    placeholder="Describe the sell-out or oversell risk..."
                  />
                </div>
              )}
            </FormSection>
          </>
          )}

          {/* Step 1: System Review */}
          {currentStep === 1 && (
            <FormSection title="Daily System Review">
              <CheckboxGroup
                options={dailySystemReviewOptions}
                selectedValues={watchedValues.dailySystemReview || []}
                onChange={(values) => setValue("dailySystemReview", values)}
              />
            </FormSection>
          )}

          {/* Step 2: Reservation Quality */}
          {currentStep === 2 && (
            <FormSection title="Arrival and Profile Cleanup">
              <CheckboxGroup
                options={arrivalProfileCleanupOptions}
                selectedValues={watchedValues.arrivalProfileCleanup || []}
                onChange={(values) => setValue("arrivalProfileCleanup", values)}
              />
              <div className="mt-4">
                <Label htmlFor="reservationCleanupNotes">
                  Reservation Cleanup Notes
                </Label>
                <Textarea
                  id="reservationCleanupNotes"
                  {...form.register("reservationCleanupNotes")}
                  placeholder="Document guest name, confirmation number, issue, and required action..."
                  rows={4}
                />
              </div>
            </FormSection>
          )}

          {/* Step 3: Financial Review */}
          {currentStep === 3 && (
            <FormSection title="Billing, Folio, and Ledger Review">
              <CheckboxGroup
                options={billingFolioLedgerReviewOptions}
                selectedValues={watchedValues.billingFolioLedgerReview || []}
                onChange={(values) => setValue("billingFolioLedgerReview", values)}
              />
              <div className="mt-4">
                <Label>Any unresolved billing, folio, or ledger issues?</Label>
                <RadioGroup
                  value={watchedValues.unresolvedBillingIssues}
                  onValueChange={(value) =>
                    setValue("unresolvedBillingIssues", value as "Yes" | "No")
                  }
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="billingYes" />
                    <Label htmlFor="billingYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="billingNo" />
                    <Label htmlFor="billingNo">No</Label>
                  </div>
                </RadioGroup>
              </div>
              {watchedValues.unresolvedBillingIssues === "Yes" && (
                <div className="mt-4">
                  <Label htmlFor="unresolvedBillingDetails">
                    List billing issue details
                  </Label>
                  <Textarea
                    id="unresolvedBillingDetails"
                    {...form.register("unresolvedBillingDetails")}
                    placeholder="Guest name, room/confirmation number, amount, issue, and required action..."
                    rows={4}
                  />
                </div>
              )}
            </FormSection>
          )}

          {/* Step 4: Groups & Events */}
          {currentStep === 4 && (
            <FormSection title="Groups and Events Review">
              <CheckboxGroup
                options={adminGroupsEventsReviewOptions}
                selectedValues={watchedValues.groupsEventsReview || []}
                onChange={(values) => setValue("groupsEventsReview", values)}
              />
              <div className="mt-4">
                <Label>Any group issues today?</Label>
                <RadioGroup
                  value={watchedValues.groupIssues}
                  onValueChange={(value) =>
                    setValue("groupIssues", value as "No groups today" | "No issues" | "Yes")
                  }
                  className="mt-2 flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No groups today" id="noGroups" />
                    <Label htmlFor="noGroups">No groups today</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No issues" id="noIssues" />
                    <Label htmlFor="noIssues">No issues</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="groupYes" />
                    <Label htmlFor="groupYes">Yes</Label>
                  </div>
                </RadioGroup>
              </div>
              {watchedValues.groupIssues === "Yes" && (
                <div className="mt-4">
                  <Label htmlFor="groupIssueDetails">
                    Describe group issue
                  </Label>
                  <Textarea
                    id="groupIssueDetails"
                    {...form.register("groupIssueDetails")}
                    placeholder="Describe the group issue..."
                    rows={4}
                  />
                </div>
              )}
            </FormSection>
          )}

          {/* Step 5: Reports & Follow-Up */}
          {currentStep === 5 && (
            <FormSection title="Reporting and Follow-Up">
              <CheckboxGroup
                options={reportingFollowUpOptions}
                selectedValues={watchedValues.reportingFollowUp || []}
                onChange={(values) => setValue("reportingFollowUp", values)}
              />
              <div className="mt-4">
                <Label htmlFor="adminSummaryNotes">Admin Summary Notes</Label>
                <Textarea
                  id="adminSummaryNotes"
                  {...form.register("adminSummaryNotes")}
                  placeholder={`Occupancy:
Arrivals:
Departures:
Inventory risks:
VIP / priority guests:
Billing issues:
Group issues:
Guest issues:
OOO / maintenance:
Reports reviewed:
Follow-up needed:`}
                  rows={12}
                />
              </div>
            </FormSection>
          )}

          {/* Step 6: Final Confirmation */}
          {currentStep === 6 && (
            <FormSection title="Final Confirmation">
              {/* Bank Count - End */}
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg text-red-800">
                    Bank Count - End of Shift
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="endBankCount">Ending Bank Count ($) *</Label>
                    <Input
                      id="endBankCount"
                      {...form.register("endBankCount")}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label>Bank Verified with Incoming Shift? *</Label>
                    <RadioGroup
                      value={watchedValues.endBankVerified}
                      onValueChange={(value) =>
                        setValue("endBankVerified", value as "Yes" | "No")
                      }
                      className="mt-2 flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="endBankYes" />
                        <Label htmlFor="endBankYes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="endBankNo" />
                        <Label htmlFor="endBankNo">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {watchedValues.endBankVerified === "No" && (
                    <div>
                      <Label htmlFor="endBankDiscrepancy">
                        Explain discrepancy
                      </Label>
                      <Textarea
                        id="endBankDiscrepancy"
                        {...form.register("endBankDiscrepancy")}
                        placeholder="Describe the discrepancy..."
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <CheckboxGroup
                options={adminFinalConfirmationOptions}
                selectedValues={watchedValues.finalConfirmation || []}
                onChange={(values) => setValue("finalConfirmation", values)}
              />
            </FormSection>
          )}

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Submit Checklist
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}



