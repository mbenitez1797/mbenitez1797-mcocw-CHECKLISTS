"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FormSection } from "@/components/form-section"
import { FormProgress } from "@/components/form-progress"
import { SalesQuickReferenceCard } from "@/components/sales-quick-reference-card"
import { SupportingSystemsSummary } from "@/components/supporting-systems-summary"
import {
  salesFormSchema,
  type SalesFormValues,
  salesDefaultValues,
  SALES_STEP_LABELS,
  startOfDaySalesReviewOptions,
  groupBookingManagementOptions,
  resLinkSupportOptions,
  functionSpaceEventsOptions,
  groupBillingOptions,
  dataQualityOptions,
  guestExperienceOptions,
  systemIssuesOptions,
  operationsHandoffOptions,
  salesFinalConfirmationOptions,
} from "@/lib/sales-form-schema"
import { Home, Save, CheckCircle2, Send, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react"
import { useChecklistSubmit } from "@/hooks/use-checklist-submit"
import { ChecklistActions } from "@/components/checklist-actions"

const STORAGE_KEY = "sales-checklist-progress"

const steps = SALES_STEP_LABELS.map((title, index) => ({ id: index, title }))

export function SalesChecklistForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { submit, isSubmitting, result } = useChecklistSubmit()

  const form = useForm<SalesFormValues>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: salesDefaultValues,
  })

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = form

  // Load saved progress on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        Object.keys(parsed).forEach((key) => {
          setValue(key as keyof SalesFormValues, parsed[key])
        })
      } catch {
        // Invalid saved data
      }
    }
  }, [setValue])

  // Auto-save on form change
  useEffect(() => {
    const subscription = watch((data) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const saveProgress = () => {
    const data = form.getValues()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setSaveMessage("Progress saved!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const nextStep = () => {
    if (currentStep < SALES_STEP_LABELS.length - 1) {
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

  // Helper to get all checkbox options for task labels
  const allCheckboxOptions = [
    ...startOfDaySalesReviewOptions,
    ...groupBookingManagementOptions,
    ...resLinkSupportOptions,
    ...functionSpaceEventsOptions,
    ...groupBillingOptions,
    ...dataQualityOptions,
    ...guestExperienceOptions,
    ...systemIssuesOptions,
    ...operationsHandoffOptions,
    ...salesFinalConfirmationOptions,
  ]

  const getCompletedTaskLabels = (): string[] => {
    const allChecked = [
      ...(watch("startOfDaySalesReview") || []),
      ...(watch("groupBookingManagement") || []),
      ...(watch("resLinkSupport") || []),
      ...(watch("functionSpaceEvents") || []),
      ...(watch("groupBilling") || []),
      ...(watch("dataQuality") || []),
      ...(watch("guestExperience") || []),
      ...(watch("systemIssues") || []),
      ...(watch("operationsHandoff") || []),
      ...(watch("salesFinalConfirmation") || []),
    ]
    return allChecked.map(id => {
      const option = allCheckboxOptions.find(opt => opt.id === id)
      return option?.label || id
    })
  }

  const getIncompleteTaskLabels = (): string[] => {
    const allChecked = [
      ...(watch("startOfDaySalesReview") || []),
      ...(watch("groupBookingManagement") || []),
      ...(watch("resLinkSupport") || []),
      ...(watch("functionSpaceEvents") || []),
      ...(watch("groupBilling") || []),
      ...(watch("dataQuality") || []),
      ...(watch("guestExperience") || []),
      ...(watch("systemIssues") || []),
      ...(watch("operationsHandoff") || []),
      ...(watch("salesFinalConfirmation") || []),
    ]
    return allCheckboxOptions
      .filter(opt => !allChecked.includes(opt.id))
      .map(opt => opt.label)
  }

  const onSubmit = async (data: SalesFormValues) => {
    setSubmitError(null)
    
    const result = await submit({
      checklistType: 'sales',
      associateName: data.salesManagerName,
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

  if (isSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Checklist Submitted</h2>
          <p className="text-muted-foreground max-w-md">
            Your Sales Manager Daily Checklist has been successfully submitted. The operations team and leadership have been notified.
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
                reset(salesDefaultValues)
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
      {/* Header with Save */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Manager Daily Checklist</h1>
          <p className="text-muted-foreground">
            Manage leads, groups, events, room blocks, ResLink needs, billing/routing, data quality, and operational handoff.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="text-sm text-green-600 font-medium">{saveMessage}</span>
          )}
          <Button type="button" variant="outline" size="sm" onClick={saveProgress}>
            <Save className="w-4 h-4 mr-2" />
            Save Progress
          </Button>
          <ChecklistActions
            checklistType="sales"
            associateName={watch("salesManagerName")}
            date={watch("date")}
            shiftStartTime={watch("shiftStartTime")}
            shiftEndTime={watch("shiftEndTime")}
            managerOnDuty={watch("managerOnDuty")}
            completedTasks={getCompletedTaskLabels()}
            incompleteTasks={getIncompleteTaskLabels()}
            notes={watch("salesManagerDailySummary")}
            supportingSystemsSummary={watch("supportingSystemsSummary")}
            onClearAll={() => reset(salesDefaultValues)}
          />
        </div>
      </div>

      <FormProgress currentStep={currentStep} totalSteps={steps.length} stepLabels={steps.map(s => s.title)} />

      {/* Step 0: Shift Info */}
      {currentStep === 0 && (
        <>
          <SalesQuickReferenceCard />
          <FormSection title="Shift Information & Daily Overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salesManagerName">Sales Manager Name *</Label>
                <Input id="salesManagerName" {...register("salesManagerName")} placeholder="Enter your name" />
                {errors.salesManagerName && <p className="text-sm text-destructive">{errors.salesManagerName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" {...register("date")} />
                {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="shiftStartTime">Shift Start Time *</Label>
                <Input id="shiftStartTime" type="time" {...register("shiftStartTime")} />
                {errors.shiftStartTime && <p className="text-sm text-destructive">{errors.shiftStartTime.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="shiftEndTime">Shift End Time *</Label>
                <Input id="shiftEndTime" type="time" {...register("shiftEndTime")} />
                {errors.shiftEndTime && <p className="text-sm text-destructive">{errors.shiftEndTime.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyCode">Property / Hotel Code *</Label>
                <Input id="propertyCode" {...register("propertyCode")} placeholder="e.g., ABCDE" />
                {errors.propertyCode && <p className="text-sm text-destructive">{errors.propertyCode.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerOnDuty">Manager on Duty *</Label>
                <Input id="managerOnDuty" {...register("managerOnDuty")} placeholder="MOD name" />
                {errors.managerOnDuty && <p className="text-sm text-destructive">{errors.managerOnDuty.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="totalGroupArrivalsToday">Total Group Arrivals Today</Label>
                <Input id="totalGroupArrivalsToday" {...register("totalGroupArrivalsToday")} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalGroupDeparturesToday">Total Group Departures Today</Label>
                <Input id="totalGroupDeparturesToday" {...register("totalGroupDeparturesToday")} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalInHouseGroupsToday">Total In-House Groups Today</Label>
                <Input id="totalInHouseGroupsToday" {...register("totalInHouseGroupsToday")} placeholder="0" />
              </div>
            </div>
          </FormSection>

          <FormSection title="Quick Status Check">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label>Any New Leads Today?</Label>
                <RadioGroup
                  value={watch("anyNewLeadsToday")}
                  onValueChange={(v) => setValue("anyNewLeadsToday", v as "yes" | "no")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="newLeads-yes" />
                    <Label htmlFor="newLeads-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="newLeads-no" />
                    <Label htmlFor="newLeads-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Any Groups Arriving Within 7 Days?</Label>
                <RadioGroup
                  value={watch("anyGroupsWithin7Days")}
                  onValueChange={(v) => setValue("anyGroupsWithin7Days", v as "yes" | "no")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="groups7days-yes" />
                    <Label htmlFor="groups7days-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="groups7days-no" />
                    <Label htmlFor="groups7days-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Any ResLink Needed Today?</Label>
                <RadioGroup
                  value={watch("anyResLinkNeeded")}
                  onValueChange={(v) => setValue("anyResLinkNeeded", v as "yes" | "no")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="reslink-yes" />
                    <Label htmlFor="reslink-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="reslink-no" />
                    <Label htmlFor="reslink-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Any Group Billing or Routing Concerns?</Label>
                <RadioGroup
                  value={watch("anyBillingConcerns")}
                  onValueChange={(v) => setValue("anyBillingConcerns", v as "yes" | "no")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="billing-yes" />
                    <Label htmlFor="billing-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="billing-no" />
                    <Label htmlFor="billing-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Any Function/Event Space Today?</Label>
                <RadioGroup
                  value={watch("anyFunctionSpaceToday")}
                  onValueChange={(v) => setValue("anyFunctionSpaceToday", v as "yes" | "no")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="function-yes" />
                    <Label htmlFor="function-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="function-no" />
                    <Label htmlFor="function-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Any System Issues Today?</Label>
                <RadioGroup
                  value={watch("anySystemIssues")}
                  onValueChange={(v) => setValue("anySystemIssues", v as "yes" | "no")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="sysIssues-yes" />
                    <Label htmlFor="sysIssues-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="sysIssues-no" />
                    <Label htmlFor="sysIssues-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {(watch("anyNewLeadsToday") === "yes" || watch("anyGroupsWithin7Days") === "yes" || 
              watch("anyResLinkNeeded") === "yes" || watch("anyBillingConcerns") === "yes" || 
              watch("anyFunctionSpaceToday") === "yes" || watch("anySystemIssues") === "yes") && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="concernsExplanation">If yes to any concern, explain</Label>
                <Textarea
                  id="concernsExplanation"
                  {...register("concernsExplanation")}
                  placeholder="Describe the concerns or issues..."
                  rows={4}
                />
              </div>
            )}
          </FormSection>
        </>
      )}

      {/* Step 1: Sales Review */}
      {currentStep === 1 && (
        <FormSection title="Part 1: Start of Day Sales Review" description="Leads, Groups, and Daily Priorities">
          <div className="space-y-3">
            {startOfDaySalesReviewOptions.map((option) => (
              <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={option.id}
                  checked={watch("startOfDaySalesReview")?.includes(option.id)}
                  onCheckedChange={(checked) => {
                    const current = watch("startOfDaySalesReview") || []
                    if (checked) {
                      setValue("startOfDaySalesReview", [...current, option.id])
                    } else {
                      setValue("startOfDaySalesReview", current.filter((id) => id !== option.id))
                    }
                  }}
                />
                <Label htmlFor={option.id} className="font-normal cursor-pointer leading-relaxed">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="space-y-2 mt-6">
            <Label htmlFor="topSalesPriorities">Top Sales Priorities Today</Label>
            <Textarea
              id="topSalesPriorities"
              {...register("topSalesPriorities")}
              placeholder={`New leads:
Urgent leads:
Groups arriving today:
Groups arriving within 7 days:
ResLink needs:
Billing/routing concerns:
Event/function space concerns:
Customer follow-ups:
System issues:`}
              rows={12}
            />
          </div>
        </FormSection>
      )}

      {/* Step 2: Group Booking */}
      {currentStep === 2 && (
        <>
          <FormSection title="Part 2: Group Booking and Block Management" description="Stay PMS, CI/SFAWeb, Amadeus CRS">
            <div className="space-y-3">
              {groupBookingManagementOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={option.id}
                    checked={watch("groupBookingManagement")?.includes(option.id)}
                    onCheckedChange={(checked) => {
                      const current = watch("groupBookingManagement") || []
                      if (checked) {
                        setValue("groupBookingManagement", [...current, option.id])
                      } else {
                        setValue("groupBookingManagement", current.filter((id) => id !== option.id))
                      }
                    }}
                  />
                  <Label htmlFor={option.id} className="font-normal cursor-pointer leading-relaxed">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="Group Setup Issues">
            <div className="space-y-3">
              <Label>Any group setup or interface issues?</Label>
              <RadioGroup
                value={watch("anyGroupSetupIssues")}
                onValueChange={(v) => setValue("anyGroupSetupIssues", v as "yes" | "no")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="groupSetup-yes" />
                  <Label htmlFor="groupSetup-yes" className="font-normal">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="groupSetup-no" />
                  <Label htmlFor="groupSetup-no" className="font-normal">No</Label>
                </div>
              </RadioGroup>
            </div>

            {watch("anyGroupSetupIssues") === "yes" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="groupSetupIssuesDetails">List group name, issue, system, and next action</Label>
                <Textarea
                  id="groupSetupIssuesDetails"
                  {...register("groupSetupIssuesDetails")}
                  placeholder="Group name, issue description, system affected, next action..."
                  rows={4}
                />
              </div>
            )}
          </FormSection>
        </>
      )}

      {/* Step 3: ResLink */}
      {currentStep === 3 && (
        <>
          <FormSection title="Part 3: ResLink and Guest Booking Support" description="ResLink, Stay PMS, Amadeus CRS, Empower ResApp">
            <div className="space-y-3">
              {resLinkSupportOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={option.id}
                    checked={watch("resLinkSupport")?.includes(option.id)}
                    onCheckedChange={(checked) => {
                      const current = watch("resLinkSupport") || []
                      if (checked) {
                        setValue("resLinkSupport", [...current, option.id])
                      } else {
                        setValue("resLinkSupport", current.filter((id) => id !== option.id))
                      }
                    }}
                  />
                  <Label htmlFor={option.id} className="font-normal cursor-pointer leading-relaxed">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="ResLink Issues">
            <div className="space-y-3">
              <Label>Any ResLink or reservation support issues?</Label>
              <RadioGroup
                value={watch("anyResLinkIssues")}
                onValueChange={(v) => setValue("anyResLinkIssues", v as "yes" | "no")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="resLinkIssue-yes" />
                  <Label htmlFor="resLinkIssue-yes" className="font-normal">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="resLinkIssue-no" />
                  <Label htmlFor="resLinkIssue-no" className="font-normal">No</Label>
                </div>
              </RadioGroup>
            </div>

            {watch("anyResLinkIssues") === "yes" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="resLinkIssuesDetails">Describe issue and action taken</Label>
                <Textarea
                  id="resLinkIssuesDetails"
                  {...register("resLinkIssuesDetails")}
                  placeholder="Issue description and action taken..."
                  rows={4}
                />
              </div>
            )}
          </FormSection>
        </>
      )}

      {/* Step 4: Events */}
      {currentStep === 4 && (
        <>
          <FormSection title="Part 4: Function Space and Events" description="Stay PMS, CI/SFAWeb, Event Communication">
            <div className="space-y-3">
              {functionSpaceEventsOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={option.id}
                    checked={watch("functionSpaceEvents")?.includes(option.id)}
                    onCheckedChange={(checked) => {
                      const current = watch("functionSpaceEvents") || []
                      if (checked) {
                        setValue("functionSpaceEvents", [...current, option.id])
                      } else {
                        setValue("functionSpaceEvents", current.filter((id) => id !== option.id))
                      }
                    }}
                  />
                  <Label htmlFor={option.id} className="font-normal cursor-pointer leading-relaxed">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="Function/Event Issues">
            <div className="space-y-3">
              <Label>Any function/event issues today?</Label>
              <RadioGroup
                value={watch("anyFunctionIssues")}
                onValueChange={(v) => setValue("anyFunctionIssues", v as "no_events" | "no_issues" | "yes")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no_events" id="functionIssue-none" />
                  <Label htmlFor="functionIssue-none" className="font-normal">No events today</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no_issues" id="functionIssue-noIssues" />
                  <Label htmlFor="functionIssue-noIssues" className="font-normal">No issues</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="functionIssue-yes" />
                  <Label htmlFor="functionIssue-yes" className="font-normal">Yes</Label>
                </div>
              </RadioGroup>
            </div>

            {watch("anyFunctionIssues") === "yes" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="functionIssuesDetails">Describe issue and owner</Label>
                <Textarea
                  id="functionIssuesDetails"
                  {...register("functionIssuesDetails")}
                  placeholder="Issue description and owner..."
                  rows={4}
                />
              </div>
            )}
          </FormSection>
        </>
      )}

      {/* Step 5: Billing */}
      {currentStep === 5 && (
        <>
          <FormSection title="Part 5: Group Billing, Routing, Commission" description="Stay PMS, CI/SFAWeb, Leadership Handoff">
            <div className="space-y-3">
              {groupBillingOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={option.id}
                    checked={watch("groupBilling")?.includes(option.id)}
                    onCheckedChange={(checked) => {
                      const current = watch("groupBilling") || []
                      if (checked) {
                        setValue("groupBilling", [...current, option.id])
                      } else {
                        setValue("groupBilling", current.filter((id) => id !== option.id))
                      }
                    }}
                  />
                  <Label htmlFor={option.id} className="font-normal cursor-pointer leading-relaxed">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="Billing/Routing Concerns">
            <div className="space-y-3">
              <Label>Any group billing/routing/commission concerns?</Label>
              <RadioGroup
                value={watch("anyBillingRoutingConcerns")}
                onValueChange={(v) => setValue("anyBillingRoutingConcerns", v as "yes" | "no")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="billingConcern-yes" />
                  <Label htmlFor="billingConcern-yes" className="font-normal">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="billingConcern-no" />
                  <Label htmlFor="billingConcern-no" className="font-normal">No</Label>
                </div>
              </RadioGroup>
            </div>

            {watch("anyBillingRoutingConcerns") === "yes" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="billingConcernsDetails">List details</Label>
                <Textarea
                  id="billingConcernsDetails"
                  {...register("billingConcernsDetails")}
                  placeholder="Group name, billing issue, expected routing, owner, next action..."
                  rows={4}
                />
              </div>
            )}
          </FormSection>
        </>
      )}

      {/* Step 6: Data Quality */}
      {currentStep === 6 && (
        <>
          <FormSection title="Part 6: Data Quality and Sales Process Discipline" description="CI/SFAWeb, Reporting, Follow-Up">
            <div className="space-y-3">
              {dataQualityOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={option.id}
                    checked={watch("dataQuality")?.includes(option.id)}
                    onCheckedChange={(checked) => {
                      const current = watch("dataQuality") || []
                      if (checked) {
                        setValue("dataQuality", [...current, option.id])
                      } else {
                        setValue("dataQuality", current.filter((id) => id !== option.id))
                      }
                    }}
                  />
                  <Label htmlFor={option.id} className="font-normal cursor-pointer leading-relaxed">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="Data Quality Issues">
            <div className="space-y-3">
              <Label>Any data quality or sales process issues?</Label>
              <RadioGroup
                value={watch("anyDataQualityIssues")}
                onValueChange={(v) => setValue("anyDataQualityIssues", v as "yes" | "no")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="dataQuality-yes" />
                  <Label htmlFor="dataQuality-yes" className="font-normal">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="dataQuality-no" />
                  <Label htmlFor="dataQuality-no" className="font-normal">No</Label>
                </div>
              </RadioGroup>
            </div>

            {watch("anyDataQualityIssues") === "yes" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="dataQualityIssuesDetails">List issue and next action</Label>
                <Textarea
                  id="dataQualityIssuesDetails"
                  {...register("dataQualityIssuesDetails")}
                  placeholder="Opportunity/quote name, field issue, system, error message, next action..."
                  rows={4}
                />
              </div>
            )}
          </FormSection>
        </>
      )}

      {/* Step 7: Guest Experience */}
      {currentStep === 7 && (
        <>
          <FormSection title="Part 7: Guest, VIP, and Group Experience" description="GXP, GPS, Stay PMS, Operations">
            <div className="space-y-3">
              {guestExperienceOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={option.id}
                    checked={watch("guestExperience")?.includes(option.id)}
                    onCheckedChange={(checked) => {
                      const current = watch("guestExperience") || []
                      if (checked) {
                        setValue("guestExperience", [...current, option.id])
                      } else {
                        setValue("guestExperience", current.filter((id) => id !== option.id))
                      }
                    }}
                  />
                  <Label htmlFor={option.id} className="font-normal cursor-pointer leading-relaxed">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="GXP/GPS Follow-up">
            <div className="space-y-3">
              <Label>Any GXP/GPS guest experience follow-up?</Label>
              <RadioGroup
                value={watch("anyGxpGpsFollowup")}
                onValueChange={(v) => setValue("anyGxpGpsFollowup", v as "yes" | "no")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="gxpGps-yes" />
                  <Label htmlFor="gxpGps-yes" className="font-normal">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="gxpGps-no" />
                  <Label htmlFor="gxpGps-no" className="font-normal">No</Label>
                </div>
              </RadioGroup>
            </div>

            {watch("anyGxpGpsFollowup") === "yes" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="gxpGpsFollowupDetails">List guest/group, issue, owner, and next action</Label>
                <Textarea
                  id="gxpGpsFollowupDetails"
                  {...register("gxpGpsFollowupDetails")}
                  placeholder="Guest/group name, issue, owner, next action..."
                  rows={4}
                />
              </div>
            )}
          </FormSection>

          <SupportingSystemsSummary
            value={watch("supportingSystemsSummary")}
            onChange={(summary) => setValue("supportingSystemsSummary", summary)}
          />
        </>
      )}

      {/* Step 8: System Issues */}
      {currentStep === 8 && (
        <>
          <FormSection title="Part 8: System Issues and Escalations" description="MGS / ServiceNow">
            <div className="space-y-3">
              {systemIssuesOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={option.id}
                    checked={watch("systemIssues")?.includes(option.id)}
                    onCheckedChange={(checked) => {
                      const current = watch("systemIssues") || []
                      if (checked) {
                        setValue("systemIssues", [...current, option.id])
                      } else {
                        setValue("systemIssues", current.filter((id) => id !== option.id))
                      }
                    }}
                  />
                  <Label htmlFor={option.id} className="font-normal cursor-pointer leading-relaxed">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="Unresolved System Issues">
            <div className="space-y-3">
              <Label>Any unresolved system issues?</Label>
              <RadioGroup
                value={watch("anyUnresolvedSystemIssues")}
                onValueChange={(v) => setValue("anyUnresolvedSystemIssues", v as "yes" | "no")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="sysUnresolved-yes" />
                  <Label htmlFor="sysUnresolved-yes" className="font-normal">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="sysUnresolved-no" />
                  <Label htmlFor="sysUnresolved-no" className="font-normal">No</Label>
                </div>
              </RadioGroup>
            </div>

            {watch("anyUnresolvedSystemIssues") === "yes" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="systemIssuesDetails">List ticket number, system, issue, and owner</Label>
                <Textarea
                  id="systemIssuesDetails"
                  {...register("systemIssuesDetails")}
                  placeholder="Ticket number, system name, issue description, owner, next action..."
                  rows={4}
                />
              </div>
            )}
          </FormSection>
        </>
      )}

      {/* Step 9: Handoff */}
      {currentStep === 9 && (
        <>
          <FormSection title="Part 9: Operations Handoff" description="Front Desk, Housekeeping, AGM, GM">
            <div className="space-y-3">
              {operationsHandoffOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={option.id}
                    checked={watch("operationsHandoff")?.includes(option.id)}
                    onCheckedChange={(checked) => {
                      const current = watch("operationsHandoff") || []
                      if (checked) {
                        setValue("operationsHandoff", [...current, option.id])
                      } else {
                        setValue("operationsHandoff", current.filter((id) => id !== option.id))
                      }
                    }}
                  />
                  <Label htmlFor={option.id} className="font-normal cursor-pointer leading-relaxed">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="Sales Manager Daily Summary">
            <div className="space-y-2">
              <Label htmlFor="salesManagerDailySummary">Daily Summary</Label>
              <Textarea
                id="salesManagerDailySummary"
                {...register("salesManagerDailySummary")}
                placeholder={`New leads reviewed:
Urgent leads:
Groups arriving today:
Groups arriving within 7 days:
In-house groups:
Group departures:
ResLink needs:
Group setup/interface issues:
Billing/routing concerns:
Function/event notes:
GXP/GPS guest follow-up:
Data quality issues:
System tickets:
Front desk handoff:
Housekeeping handoff:
AGM/GM follow-up:
Owners assigned:
Next actions:`}
                rows={20}
              />
            </div>
          </FormSection>
        </>
      )}

      {/* Step 10: Final Confirmation */}
      {currentStep === 10 && (
        <FormSection title="Final Sales Manager Confirmation">
          <div className="space-y-3">
            {salesFinalConfirmationOptions.map((option) => (
              <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-amber-200 bg-amber-50/30">
                <Checkbox
                  id={option.id}
                  checked={watch("salesFinalConfirmation")?.includes(option.id)}
                  onCheckedChange={(checked) => {
                    const current = watch("salesFinalConfirmation") || []
                    if (checked) {
                      setValue("salesFinalConfirmation", [...current, option.id])
                    } else {
                      setValue("salesFinalConfirmation", current.filter((id) => id !== option.id))
                    }
                  }}
                />
                <Label htmlFor={option.id} className="font-normal cursor-pointer leading-relaxed">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              By submitting this checklist, you confirm that all required sales systems have been reviewed and all information is accurate. 
              This checklist will be sent to leadership and saved for records.
            </p>
          </div>
        </FormSection>
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

        {currentStep === SALES_STEP_LABELS.length - 1 ? (
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



