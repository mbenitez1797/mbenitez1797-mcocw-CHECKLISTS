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
  gmFormSchema,
  type GMFormValues,
  morningGMReviewOptions,
  guestExperienceRecoveryOptions,
  financialOversightOptions,
  groupsEventsRevenueRiskOptions,
  peopleProcessAccountabilityOptions,
  endOfDaySummaryOptions,
  gmFinalConfirmationOptions,
} from "@/lib/gm-form-schema"

const STORAGE_KEY = "gm-checklist-draft"

const steps = [
  "Daily Overview",
  "Morning GM Review",
  "Guest Experience",
  "Financial Oversight",
  "Groups & Revenue",
  "People & Process",
  "End-of-Day Summary",
  "Final Confirmation",
]

export function GMChecklistForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { submit, isSubmitting, result } = useChecklistSubmit()

  const form = useForm<GMFormValues>({
    resolver: zodResolver(gmFormSchema),
    defaultValues: {
      gmName: "",
      date: new Date().toISOString().split("T")[0],
      currentOccupancy: "",
      expectedOccupancy: "",
      totalArrivals: "",
      totalDepartures: "",
      outOfOrderRooms: "",
      sellOutRisk: "No",
      majorGuestIssues: "No",
      majorFinancialIssues: "No",
      staffingConcerns: "No",
      maintenanceRoomReadinessConcerns: "No",
      concernsExplanation: "",
      morningGMReview: [],
      guestExperienceRecovery: [],
      gmGuestFollowUp: "No",
      gmGuestFollowUpDetails: "",
      financialOversight: [],
      gmFinancialConcerns: "No",
      gmFinancialDetails: "",
      groupsEventsRevenueRisk: [],
      gmGroupConcerns: "No",
      gmGroupDetails: "",
      peopleProcessAccountability: [],
      endOfDaySummary: [],
      gmDailySummary: "",
      supportingSystemsSummary: defaultSupportingSystemsData,
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
          setValue(key as keyof GMFormValues, parsed[key])
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

  const onSubmit = async (data: GMFormValues) => {
    setSubmitError(null)
    
    const result = await submit({
      checklistType: 'gm',
      associateName: data.gmName,
      date: data.date,
      shiftStartTime: '',
      shiftEndTime: '',
      managerOnDuty: '',
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
              Your GM Daily Checklist has been submitted successfully.
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
        <Card className="mb-6 bg-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              GM Daily Checklist
            </CardTitle>
            <p className="text-center text-slate-300">
              General Manager
            </p>
          </CardHeader>
        </Card>

        {/* Progress */}
        <FormProgress currentStep={currentStep} totalSteps={steps.length} stepLabels={steps.map(s => s.title)} />

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 0: Daily Overview */}
          {currentStep === 0 && (
            <>
              <QuickReferenceCard />
              <FormSection title="Daily Overview">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="gmName">GM Name *</Label>
                  <Input
                    id="gmName"
                    {...form.register("gmName")}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" {...form.register("date")} />
                </div>
              </div>

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
                  <Label htmlFor="outOfOrderRooms">Out of Order Rooms</Label>
                  <Input
                    id="outOfOrderRooms"
                    {...form.register("outOfOrderRooms")}
                    placeholder="e.g., 3"
                  />
                </div>
              </div>

              {/* Risk Questions */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
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
                  <Label>Any Major Guest Issues?</Label>
                  <RadioGroup
                    value={watchedValues.majorGuestIssues}
                    onValueChange={(value) =>
                      setValue("majorGuestIssues", value as "Yes" | "No")
                    }
                    className="mt-2 flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="guestIssuesYes" />
                      <Label htmlFor="guestIssuesYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="guestIssuesNo" />
                      <Label htmlFor="guestIssuesNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label>Any Major Financial Issues?</Label>
                  <RadioGroup
                    value={watchedValues.majorFinancialIssues}
                    onValueChange={(value) =>
                      setValue("majorFinancialIssues", value as "Yes" | "No")
                    }
                    className="mt-2 flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="financialIssuesYes" />
                      <Label htmlFor="financialIssuesYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="financialIssuesNo" />
                      <Label htmlFor="financialIssuesNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label>Any Staffing Concerns?</Label>
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
                <div>
                  <Label>Any Maintenance / Room Readiness Concerns?</Label>
                  <RadioGroup
                    value={watchedValues.maintenanceRoomReadinessConcerns}
                    onValueChange={(value) =>
                      setValue("maintenanceRoomReadinessConcerns", value as "Yes" | "No")
                    }
                    className="mt-2 flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="maintenanceYes" />
                      <Label htmlFor="maintenanceYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="maintenanceNo" />
                      <Label htmlFor="maintenanceNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {(watchedValues.sellOutRisk === "Yes" ||
                watchedValues.majorGuestIssues === "Yes" ||
                watchedValues.majorFinancialIssues === "Yes" ||
                watchedValues.staffingConcerns === "Yes" ||
                watchedValues.maintenanceRoomReadinessConcerns === "Yes") && (
                <div className="mt-4">
                  <Label htmlFor="concernsExplanation">
                    Explain concerns
                  </Label>
                  <Textarea
                    id="concernsExplanation"
                    {...form.register("concernsExplanation")}
                    placeholder="Describe the concerns..."
                    rows={4}
                  />
                </div>
              )}
            </FormSection>
          </>
          )}

          {/* Step 1: Morning GM Review */}
          {currentStep === 1 && (
            <FormSection title="Morning GM Review - Daily Business & House Snapshot">
              <CheckboxGroup
                options={morningGMReviewOptions}
                selectedValues={watchedValues.morningGMReview || []}
                onChange={(values) => setValue("morningGMReview", values)}
              />
            </FormSection>
          )}

          {/* Step 2: Guest Experience */}
          {currentStep === 2 && (
            <FormSection title="Guest Experience and Service Recovery">
              <CheckboxGroup
                options={guestExperienceRecoveryOptions}
                selectedValues={watchedValues.guestExperienceRecovery || []}
                onChange={(values) => setValue("guestExperienceRecovery", values)}
              />
              <div className="mt-4">
                <Label>Any GM-level guest follow-up needed?</Label>
                <RadioGroup
                  value={watchedValues.gmGuestFollowUp}
                  onValueChange={(value) =>
                    setValue("gmGuestFollowUp", value as "Yes" | "No")
                  }
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="gmGuestYes" />
                    <Label htmlFor="gmGuestYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="gmGuestNo" />
                    <Label htmlFor="gmGuestNo">No</Label>
                  </div>
                </RadioGroup>
              </div>
              {watchedValues.gmGuestFollowUp === "Yes" && (
                <div className="mt-4">
                  <Label htmlFor="gmGuestFollowUpDetails">
                    List guest name / room / issue / owner
                  </Label>
                  <Textarea
                    id="gmGuestFollowUpDetails"
                    {...form.register("gmGuestFollowUpDetails")}
                    placeholder="Guest name, room number, issue description, and assigned owner..."
                    rows={4}
                  />
                </div>
              )}
            </FormSection>
          )}

          {/* Step 3: Financial Oversight */}
          {currentStep === 3 && (
            <FormSection title="Financial and Billing Oversight">
              <CheckboxGroup
                options={financialOversightOptions}
                selectedValues={watchedValues.financialOversight || []}
                onChange={(values) => setValue("financialOversight", values)}
              />
              <div className="mt-4">
                <Label>Any GM-level financial concerns?</Label>
                <RadioGroup
                  value={watchedValues.gmFinancialConcerns}
                  onValueChange={(value) =>
                    setValue("gmFinancialConcerns", value as "Yes" | "No")
                  }
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="gmFinancialYes" />
                    <Label htmlFor="gmFinancialYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="gmFinancialNo" />
                    <Label htmlFor="gmFinancialNo">No</Label>
                  </div>
                </RadioGroup>
              </div>
              {watchedValues.gmFinancialConcerns === "Yes" && (
                <div className="mt-4">
                  <Label htmlFor="gmFinancialDetails">
                    List issue, amount, and owner
                  </Label>
                  <Textarea
                    id="gmFinancialDetails"
                    {...form.register("gmFinancialDetails")}
                    placeholder="Issue description, amount, guest/account, and assigned owner..."
                    rows={4}
                  />
                </div>
              )}
            </FormSection>
          )}

          {/* Step 4: Groups & Revenue */}
          {currentStep === 4 && (
            <FormSection title="Groups, Events, and Revenue Risk">
              <CheckboxGroup
                options={groupsEventsRevenueRiskOptions}
                selectedValues={watchedValues.groupsEventsRevenueRisk || []}
                onChange={(values) => setValue("groupsEventsRevenueRisk", values)}
              />
              <div className="mt-4">
                <Label>Any GM-level group concerns?</Label>
                <RadioGroup
                  value={watchedValues.gmGroupConcerns}
                  onValueChange={(value) =>
                    setValue("gmGroupConcerns", value as "Yes" | "No")
                  }
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="gmGroupYes" />
                    <Label htmlFor="gmGroupYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="gmGroupNo" />
                    <Label htmlFor="gmGroupNo">No</Label>
                  </div>
                </RadioGroup>
              </div>
              {watchedValues.gmGroupConcerns === "Yes" && (
                <div className="mt-4">
                  <Label htmlFor="gmGroupDetails">
                    Describe issue and action plan
                  </Label>
                  <Textarea
                    id="gmGroupDetails"
                    {...form.register("gmGroupDetails")}
                    placeholder="Group concern, impact, and action plan..."
                    rows={4}
                  />
                </div>
              )}
            </FormSection>
          )}

          {/* Step 5: People & Process */}
          {currentStep === 5 && (
            <FormSection title="People, Process, and Accountability">
              <CheckboxGroup
                options={peopleProcessAccountabilityOptions}
                selectedValues={watchedValues.peopleProcessAccountability || []}
                onChange={(values) => setValue("peopleProcessAccountability", values)}
              />
            </FormSection>
          )}

          {/* Step 6: End-of-Day Summary */}
          {currentStep === 6 && (
            <FormSection title="End-of-Day GM Summary">
              <CheckboxGroup
                options={endOfDaySummaryOptions}
                selectedValues={watchedValues.endOfDaySummary || []}
                onChange={(values) => setValue("endOfDaySummary", values)}
              />
              <div className="mt-4">
                <Label htmlFor="gmDailySummary">GM Daily Summary</Label>
                <Textarea
                  id="gmDailySummary"
                  {...form.register("gmDailySummary")}
                  placeholder={`Occupancy today:
Expected occupancy tonight:
Arrivals:
Departures:
VIP / guest recovery:
Inventory risks:
OOO / maintenance:
Financial concerns:
Group concerns:
Staffing concerns:
Training/coaching:
Owners assigned:
Tomorrow's risks:`}
                  rows={16}
                />
              </div>
            </FormSection>
          )}

          {/* Step 7: Final Confirmation */}
          {currentStep === 7 && (
            <FormSection title="Final GM Confirmation">
              <CheckboxGroup
                options={gmFinalConfirmationOptions}
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
              <Button type="submit" className="bg-slate-800 hover:bg-slate-900">
                Submit Checklist
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}



