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
  agmFormSchema,
  type AGMFormValues,
  houseReadinessOptions,
  checkInReadinessOptions,
  financialControlsOptions,
  agmHousekeepingAlignmentOptions,
  groupsInventoryRiskOptions,
  leadershipFollowUpOptions,
  agmFinalConfirmationOptions,
} from "@/lib/agm-form-schema"

const STORAGE_KEY = "agm-checklist-draft"

const steps = [
  "Shift Info & Bank Count",
  "House Readiness",
  "Check-In Readiness",
  "Financial Controls",
  "Housekeeping Alignment",
  "Groups & Inventory",
  "Leadership Follow-Up",
  "Final Confirmation",
]

export function AGMChecklistForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { submit, isSubmitting, result } = useChecklistSubmit()

  const form = useForm<AGMFormValues>({
    resolver: zodResolver(agmFormSchema),
    defaultValues: {
      agmName: "",
      date: new Date().toISOString().split("T")[0],
      shiftStartTime: "",
      shiftEndTime: "",
      managerOnDuty: "",
      startBankCount: "",
      startBankVerified: "Yes",
      startBankDiscrepancy: "",
      currentOccupancy: "",
      expectedOccupancy: "",
      totalArrivals: "",
      totalDepartures: "",
      vacantReadyRooms: "",
      dirtyRooms: "",
      outOfOrderRooms: "",
      sellOutRisk: "No",
      majorGuestRecoveryIssues: "No",
      staffingConcerns: "No",
      concernsExplanation: "",
      houseReadiness: [],
      checkInReadiness: [],
      financialControls: [],
      unresolvedFinancialIssues: "No",
      unresolvedFinancialDetails: "",
      housekeepingAlignment: [],
      roomReadinessConcerns: "No",
      roomReadinessDetails: "",
      groupsInventoryRisk: [],
      groupInventoryConcerns: "No",
      groupInventoryDetails: "",
      leadershipFollowUp: [],
      agmSummaryNotes: "",
      supportingSystemsSummary: defaultSupportingSystemsData,
      endBankCount: "",
      endBankVerified: "Yes",
      endBankDiscrepancy: "",
      finalConfirmation: [],
    },
  })

  const { watch, setValue, handleSubmit } = form
  const watchedValues = watch()

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        Object.keys(parsed).forEach((key) => {
          setValue(key as keyof AGMFormValues, parsed[key])
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

  const onSubmit = async (data: AGMFormValues) => {
    setSubmitError(null)
    
    const result = await submit({
      checklistType: 'agm',
      associateName: data.agmName,
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
              Your AGM Daily Checklist has been submitted successfully.
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
        <Card className="mb-6 bg-teal-600 text-white">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              AGM Daily Checklist
            </CardTitle>
            <p className="text-center text-teal-100">
              Assistant General Manager
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
                  <Label htmlFor="agmName">AGM Name *</Label>
                  <Input
                    id="agmName"
                    {...form.register("agmName")}
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
                  <Label htmlFor="expectedOccupancy">Expected Occupancy Tonight</Label>
                  <Input
                    id="expectedOccupancy"
                    {...form.register("expectedOccupancy")}
                    placeholder="e.g., 92%"
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

              {/* Risk Questions */}
              <div className="mt-4 space-y-4">
                <div>
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
                <div>
                  <Label>Any Major Guest Recovery Issues Today?</Label>
                  <RadioGroup
                    value={watchedValues.majorGuestRecoveryIssues}
                    onValueChange={(value) =>
                      setValue("majorGuestRecoveryIssues", value as "Yes" | "No")
                    }
                    className="mt-2 flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="guestRecoveryYes" />
                      <Label htmlFor="guestRecoveryYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="guestRecoveryNo" />
                      <Label htmlFor="guestRecoveryNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label>Any Staffing Concerns Today?</Label>
                  <RadioGroup
                    value={watchedValues.staffingConcerns}
                    onValueChange={(value) =>
                      setValue("staffingConcerns", value as "Yes" | "No")
                    }
                    className="mt-2 flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="staffingYes" />
                      <Label htmlFor="staffingYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="staffingNo" />
                      <Label htmlFor="staffingNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              {(watchedValues.sellOutRisk === "Yes" ||
                watchedValues.majorGuestRecoveryIssues === "Yes" ||
                watchedValues.staffingConcerns === "Yes") && (
                <div className="mt-4">
                  <Label htmlFor="concernsExplanation">
                    Explain concerns
                  </Label>
                  <Textarea
                    id="concernsExplanation"
                    {...form.register("concernsExplanation")}
                    placeholder="Describe the concerns..."
                  />
                </div>
              )}
            </FormSection>
          </>
          )}

          {/* Step 1: House Readiness */}
          {currentStep === 1 && (
            <FormSection title="House Readiness">
              <CheckboxGroup
                options={houseReadinessOptions}
                selectedValues={watchedValues.houseReadiness || []}
                onChange={(values) => setValue("houseReadiness", values)}
              />
            </FormSection>
          )}

          {/* Step 2: Check-In Readiness */}
          {currentStep === 2 && (
            <FormSection title="Check-In Readiness">
              <CheckboxGroup
                options={checkInReadinessOptions}
                selectedValues={watchedValues.checkInReadiness || []}
                onChange={(values) => setValue("checkInReadiness", values)}
              />
            </FormSection>
          )}

          {/* Step 3: Financial Controls */}
          {currentStep === 3 && (
            <FormSection title="Billing, Ledger, and Financial Controls">
              <CheckboxGroup
                options={financialControlsOptions}
                selectedValues={watchedValues.financialControls || []}
                onChange={(values) => setValue("financialControls", values)}
              />
              <div className="mt-4">
                <Label>Any unresolved financial issues?</Label>
                <RadioGroup
                  value={watchedValues.unresolvedFinancialIssues}
                  onValueChange={(value) =>
                    setValue("unresolvedFinancialIssues", value as "Yes" | "No")
                  }
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="financialYes" />
                    <Label htmlFor="financialYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="financialNo" />
                    <Label htmlFor="financialNo">No</Label>
                  </div>
                </RadioGroup>
              </div>
              {watchedValues.unresolvedFinancialIssues === "Yes" && (
                <div className="mt-4">
                  <Label htmlFor="unresolvedFinancialDetails">
                    List issue, amount, and owner
                  </Label>
                  <Textarea
                    id="unresolvedFinancialDetails"
                    {...form.register("unresolvedFinancialDetails")}
                    placeholder="Guest name, room/confirmation number, issue, amount, and owner..."
                    rows={4}
                  />
                </div>
              )}
            </FormSection>
          )}

          {/* Step 4: Housekeeping Alignment */}
          {currentStep === 4 && (
            <FormSection title="Housekeeping and Maintenance Alignment">
              <CheckboxGroup
                options={agmHousekeepingAlignmentOptions}
                selectedValues={watchedValues.housekeepingAlignment || []}
                onChange={(values) => setValue("housekeepingAlignment", values)}
              />
              <div className="mt-4">
                <Label>Any room readiness concerns?</Label>
                <RadioGroup
                  value={watchedValues.roomReadinessConcerns}
                  onValueChange={(value) =>
                    setValue("roomReadinessConcerns", value as "Yes" | "No")
                  }
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="readinessYes" />
                    <Label htmlFor="readinessYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="readinessNo" />
                    <Label htmlFor="readinessNo">No</Label>
                  </div>
                </RadioGroup>
              </div>
              {watchedValues.roomReadinessConcerns === "Yes" && (
                <div className="mt-4">
                  <Label htmlFor="roomReadinessDetails">
                    Describe concern and action plan
                  </Label>
                  <Textarea
                    id="roomReadinessDetails"
                    {...form.register("roomReadinessDetails")}
                    placeholder="Describe the room readiness concern and action plan..."
                    rows={4}
                  />
                </div>
              )}
            </FormSection>
          )}

          {/* Step 5: Groups & Inventory */}
          {currentStep === 5 && (
            <FormSection title="Groups, Events, and Inventory Risk">
              <CheckboxGroup
                options={groupsInventoryRiskOptions}
                selectedValues={watchedValues.groupsInventoryRisk || []}
                onChange={(values) => setValue("groupsInventoryRisk", values)}
              />
              <div className="mt-4">
                <Label>Any group or inventory concerns?</Label>
                <RadioGroup
                  value={watchedValues.groupInventoryConcerns}
                  onValueChange={(value) =>
                    setValue("groupInventoryConcerns", value as "Yes" | "No")
                  }
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="groupInventoryYes" />
                    <Label htmlFor="groupInventoryYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="groupInventoryNo" />
                    <Label htmlFor="groupInventoryNo">No</Label>
                  </div>
                </RadioGroup>
              </div>
              {watchedValues.groupInventoryConcerns === "Yes" && (
                <div className="mt-4">
                  <Label htmlFor="groupInventoryDetails">
                    Describe concern and action plan
                  </Label>
                  <Textarea
                    id="groupInventoryDetails"
                    {...form.register("groupInventoryDetails")}
                    placeholder="Describe the group or inventory concern and action plan..."
                    rows={4}
                  />
                </div>
              )}
            </FormSection>
          )}

          {/* Step 6: Leadership Follow-Up */}
          {currentStep === 6 && (
            <FormSection title="Leadership Follow-Up and Handoff">
              <CheckboxGroup
                options={leadershipFollowUpOptions}
                selectedValues={watchedValues.leadershipFollowUp || []}
                onChange={(values) => setValue("leadershipFollowUp", values)}
              />
              <div className="mt-4">
                <Label htmlFor="agmSummaryNotes">AGM Leadership Summary</Label>
                <Textarea
                  id="agmSummaryNotes"
                  {...form.register("agmSummaryNotes")}
                  placeholder={`Occupancy:
Arrivals:
Departures:
Inventory risks:
VIP / service recovery:
Guest issues:
Billing issues:
Group issues:
Housekeeping / maintenance:
Staffing concerns:
Training opportunities:
GM follow-up needed:`}
                  rows={14}
                />
              </div>
            </FormSection>
          )}

          {/* Step 7: Final Confirmation */}
          {currentStep === 7 && (
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
                options={agmFinalConfirmationOptions}
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
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                Submit Checklist
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}



