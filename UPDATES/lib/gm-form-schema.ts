import { z } from "zod"

export const gmFormSchema = z.object({
  // Top-of-form fields
  gmName: z.string().min(1, "GM name is required"),
  date: z.string().min(1, "Date is required"),
  
  currentOccupancy: z.string().optional(),
  expectedOccupancy: z.string().optional(),
  totalArrivals: z.string().optional(),
  totalDepartures: z.string().optional(),
  outOfOrderRooms: z.string().optional(),
  sellOutRisk: z.enum(["Yes", "No"]),
  majorGuestIssues: z.enum(["Yes", "No"]),
  majorFinancialIssues: z.enum(["Yes", "No"]),
  staffingConcerns: z.enum(["Yes", "No"]),
  maintenanceRoomReadinessConcerns: z.enum(["Yes", "No"]),
  concernsExplanation: z.string().optional(),

  // Part 1: Morning GM Review
  morningGMReview: z.array(z.string()),

  // Part 2: Guest Experience and Service Recovery
  guestExperienceRecovery: z.array(z.string()),
  gmGuestFollowUp: z.enum(["Yes", "No"]),
  gmGuestFollowUpDetails: z.string().optional(),

  // Part 3: Financial Oversight
  financialOversight: z.array(z.string()),
  gmFinancialConcerns: z.enum(["Yes", "No"]),
  gmFinancialDetails: z.string().optional(),

  // Part 4: Groups, Events, and Revenue Risk
  groupsEventsRevenueRisk: z.array(z.string()),
  gmGroupConcerns: z.enum(["Yes", "No"]),
  gmGroupDetails: z.string().optional(),

  // Part 5: People, Process, and Accountability
  peopleProcessAccountability: z.array(z.string()),

  // Part 6: End-of-Day GM Summary
  endOfDaySummary: z.array(z.string()),
  gmDailySummary: z.string().optional(),

  // Supporting Systems Follow-Up Summary
  supportingSystemsSummary: z.object({
    gxpOpenCases: z.string().optional(),
    gpsVipFollowUp: z.string().optional(),
    empowerResAppFollowUp: z.string().optional(),
    mgsServiceNowTickets: z.string().optional(),
    paymentDeviceKeyEncoderIssues: z.string().optional(),
    owner: z.string().optional(),
    nextAction: z.string().optional(),
  }).optional(),

  // Final Confirmation
  finalConfirmation: z.array(z.string()).min(1, "Please confirm all items"),
})

export type GMFormValues = z.infer<typeof gmFormSchema>

// Part 1: Morning GM Review
export const morningGMReviewOptions = [
  { id: "gmReviewedHouseStatus", label: "Reviewed overall house status" },
  { id: "gmReviewedExpectedOccupancy", label: "Reviewed expected occupancy for tonight" },
  { id: "gmReviewedArrivals", label: "Reviewed arrivals for today" },
  { id: "gmReviewedDepartures", label: "Reviewed departures for today" },
  { id: "gmReviewedInHouseCount", label: "Reviewed in-house guest count" },
  { id: "gmReviewedRoomAvailability", label: "Reviewed room availability by room type" },
  { id: "gmReviewedSoldOutRooms", label: "Reviewed sold-out or oversold room types" },
  { id: "gmReviewedOOOImpact", label: "Reviewed Out of Order room impact" },
  { id: "gmConfirmedInventoryPlan", label: "Confirmed leadership has a plan for inventory risk" },
]

// Part 2: Guest Experience and Service Recovery
export const guestExperienceRecoveryOptions = [
  { id: "gmReviewedVIPArrivals", label: "Reviewed VIP arrivals" },
  { id: "gmReviewedEliteArrivals", label: "Reviewed elite arrivals and high-touch guests" },
  { id: "gmReviewedServiceRecovery", label: "Reviewed service recovery guests" },
  { id: "gmReviewedUnresolvedComplaints", label: "Reviewed unresolved guest complaints" },
  { id: "gmReviewedRoomMoves", label: "Reviewed room moves or major room issues" },
  { id: "gmReviewedCompensation", label: "Reviewed guest compensation or recovery decisions if applicable" },
  { id: "gmConfirmedRecoveryOwner", label: "Confirmed guest recovery items have an owner" },
  { id: "gmReviewedGXPHighImpactCases", label: "Reviewed high-impact GXP guest complaints and service recovery cases", system: "GXP" as const },
  { id: "gmReviewedGPSVIPEliteInfo", label: "Reviewed GPS information for VIP, elite, repeat, or high-touch guests", system: "GPS" as const },
]

// Part 3: Financial Oversight
export const financialOversightOptions = [
  { id: "gmReviewedOpenBalanceRisks", label: "Reviewed open balance risks" },
  { id: "gmReviewedInHouseBalances", label: "Reviewed major in-house balance concerns" },
  { id: "gmReviewedDeparturesBalances", label: "Reviewed departures with unresolved balances" },
  { id: "gmReviewedDirectBillRouting", label: "Reviewed direct bill or routing exceptions" },
  { id: "gmReviewedTaxExempt", label: "Reviewed tax-exempt exceptions if any" },
  { id: "gmReviewedCashDiscrepancies", label: "Reviewed cash or payment discrepancies if reported" },
  { id: "gmReviewedFolioAdjustments", label: "Reviewed folio adjustments requiring leadership awareness" },
  { id: "gmConfirmedFinancialOwner", label: "Confirmed unresolved financial issues have an owner" },
  { id: "gmReviewedSystemFinancialIssues", label: "Reviewed system issues that may impact financial accuracy", system: "MGS" as const },
]

// Part 4: Groups, Events, and Revenue Risk
export const groupsEventsRevenueRiskOptions = [
  { id: "gmReviewedGroupArrivalsDepartures", label: "Reviewed group arrivals and departures" },
  { id: "gmReviewedGroupPickup", label: "Reviewed group pickup and remaining rooms" },
  { id: "gmReviewedGroupBilling", label: "Reviewed group billing concerns" },
  { id: "gmReviewedGroupSpecialRequests", label: "Reviewed major group special requests" },
  { id: "gmReviewedInventoryImpact", label: "Reviewed inventory impact from groups" },
  { id: "gmConfirmedGroupPlan", label: "Confirmed leadership plan for group execution" },
]

// Part 5: People, Process, and Accountability
export const peopleProcessAccountabilityOptions = [
  { id: "gmReviewedChecklistCompletion", label: "Reviewed AM, PM, and Night Audit checklist completion" },
  { id: "gmReviewedMissedItems", label: "Reviewed missed or incomplete checklist items" },
  { id: "gmReviewedStaffingCoverage", label: "Reviewed staffing coverage for the day" },
  { id: "gmReviewedCoachingOpportunities", label: "Reviewed coaching opportunities" },
  { id: "gmConfirmedRoomAssignmentDiscipline", label: "Confirmed room assignment discipline is being followed" },
  { id: "gmReviewedCommunicationQuality", label: "Reviewed housekeeping and front desk communication quality" },
  { id: "gmReviewedMaintenanceFollowUp", label: "Reviewed maintenance follow-up discipline" },
  { id: "gmAssignedOwners", label: "Assigned owners for unresolved operational issues" },
  { id: "gmReviewedGXPFollowUpDiscipline", label: "Reviewed GXP follow-up discipline", system: "GXP" as const },
  { id: "gmReviewedGPSRecognitionDiscipline", label: "Reviewed GPS usage for guest recognition discipline", system: "GPS" as const },
  { id: "gmReviewedMGSEscalationDiscipline", label: "Reviewed MGS/ServiceNow escalation discipline", system: "MGS" as const },
]

// Part 6: End-of-Day GM Summary
export const endOfDaySummaryOptions = [
  { id: "gmPreparedDailySummary", label: "Prepared GM daily summary" },
  { id: "gmCommunicatedPriorities", label: "Communicated priorities to AGM and MOD" },
  { id: "gmConfirmedTomorrowsRisks", label: "Confirmed tomorrow's known risks" },
  { id: "gmConfirmedAllOwnersAssigned", label: "Confirmed all critical issues have an owner" },
]

// Final Confirmation
export const gmFinalConfirmationOptions = [
  { id: "gmConfirmHouseStatus", label: "I confirm that I reviewed the daily Stay PMS house status and operational risk areas" },
  { id: "gmConfirmAllAreasReviewed", label: "I confirm that guest, financial, inventory, group, staffing, and maintenance concerns were reviewed" },
  { id: "gmConfirmOwnersAssigned", label: "I confirm that unresolved issues have assigned owners" },
  { id: "gmConfirmAGMMODUpdated", label: "I confirm that AGM or MOD received direction on priority items" },
]



