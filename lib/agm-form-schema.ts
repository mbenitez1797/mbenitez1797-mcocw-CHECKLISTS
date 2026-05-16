import { z } from "zod"

export const agmFormSchema = z.object({
  // Top-of-form fields
  agmName: z.string().min(1, "AGM name is required"),
  date: z.string().min(1, "Date is required"),
  shiftStartTime: z.string().min(1, "Shift start time is required"),
  shiftEndTime: z.string().min(1, "Shift end time is required"),
  managerOnDuty: z.string().min(1, "Manager on duty is required"),
  
  // Bank Count - Start of Shift
  startBankCount: z.string().min(1, "Start bank count is required"),
  startBankVerified: z.enum(["Yes", "No"]),
  startBankDiscrepancy: z.string().optional(),
  
  currentOccupancy: z.string().optional(),
  expectedOccupancy: z.string().optional(),
  totalArrivals: z.string().optional(),
  totalDepartures: z.string().optional(),
  vacantReadyRooms: z.string().optional(),
  dirtyRooms: z.string().optional(),
  outOfOrderRooms: z.string().optional(),
  sellOutRisk: z.enum(["Yes", "No"]),
  majorGuestRecoveryIssues: z.enum(["Yes", "No"]),
  staffingConcerns: z.enum(["Yes", "No"]),
  concernsExplanation: z.string().optional(),

  // Part 1: House Readiness
  houseReadiness: z.array(z.string()),

  // Part 2: Check-In Readiness
  checkInReadiness: z.array(z.string()),

  // Part 3: Financial Controls
  financialControls: z.array(z.string()),
  unresolvedFinancialIssues: z.enum(["Yes", "No"]),
  unresolvedFinancialDetails: z.string().optional(),

  // Part 4: Housekeeping Alignment
  housekeepingAlignment: z.array(z.string()),
  roomReadinessConcerns: z.enum(["Yes", "No"]),
  roomReadinessDetails: z.string().optional(),

  // Part 5: Groups and Inventory Risk
  groupsInventoryRisk: z.array(z.string()),
  groupInventoryConcerns: z.enum(["Yes", "No"]),
  groupInventoryDetails: z.string().optional(),

  // Part 6: Leadership Follow-Up
  leadershipFollowUp: z.array(z.string()),
  agmSummaryNotes: z.string().optional(),

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

  // Bank Count - End of Shift
  endBankCount: z.string().min(1, "End bank count is required"),
  endBankVerified: z.enum(["Yes", "No"]),
  endBankDiscrepancy: z.string().optional(),

  // Final Confirmation
  finalConfirmation: z.array(z.string()).min(1, "Please confirm all items"),
})

export type AGMFormValues = z.infer<typeof agmFormSchema>

// Part 1: House Readiness
export const houseReadinessOptions = [
  { id: "agmReviewedHouseStatus", label: "Reviewed overall house status in Stay PMS" },
  { id: "agmReviewedArrivals", label: "Reviewed arrivals for the day" },
  { id: "agmReviewedDepartures", label: "Reviewed departures for the day" },
  { id: "agmReviewedInHouseGuests", label: "Reviewed in-house guest list" },
  { id: "agmReviewedRoomAvailability", label: "Reviewed room availability by room type" },
  { id: "agmReviewedSoldOutRooms", label: "Reviewed sold-out or oversold room types" },
  { id: "agmReviewedVacantDirtyOOO", label: "Reviewed Vacant Ready, Dirty, and Out of Order rooms" },
  { id: "agmConfirmedRoomAssignmentStrategy", label: "Confirmed front desk understands room assignment strategy" },
]

// Part 2: Check-In Readiness
export const checkInReadinessOptions = [
  { id: "agmReviewedVIPElite", label: "Reviewed VIP and elite arrivals" },
  { id: "agmReviewedEarlyArrivals", label: "Reviewed early arrivals" },
  { id: "agmReviewedAccessibility", label: "Reviewed accessibility room needs" },
  { id: "agmReviewedConnecting", label: "Reviewed connecting or adjoining room requests" },
  { id: "agmReviewedSuites", label: "Reviewed suites and specialty room arrivals" },
  { id: "agmReviewedServiceRecovery", label: "Reviewed service recovery guests" },
  { id: "agmReviewedMobileKey", label: "Reviewed mobile key issues if any" },
  { id: "agmReviewedUnresolvedIssues", label: "Reviewed unresolved guest issues from prior shifts" },
  { id: "agmConfirmedPMPlan", label: "Confirmed PM check-in plan is ready" },
  { id: "agmReviewedGXPServiceRecovery", label: "Reviewed GXP service recovery and complaint cases", system: "GXP" as const },
  { id: "agmReviewedGPSVIPNotes", label: "Reviewed GPS notes for VIP and high-touch guests", system: "GPS" as const },
  { id: "agmConfirmedEmpowerResAppUsage", label: "Confirmed front desk is using Empower ResApp correctly for future reservation work", system: "EmpowerResApp" as const },
]

// Part 3: Financial Controls
export const financialControlsOptions = [
  { id: "agmReviewedDeparturesBalances", label: "Reviewed departures with balances" },
  { id: "agmReviewedInHouseBalances", label: "Reviewed in-house balances with concerns" },
  { id: "agmReviewedCheckedOutBalances", label: "Reviewed checked-out reservations with open balances" },
  { id: "agmReviewedDirectBillRouting", label: "Reviewed direct bill and routing exceptions" },
  { id: "agmReviewedTaxExempt", label: "Reviewed tax-exempt exceptions" },
  { id: "agmReviewedCashPayment", label: "Reviewed cash or payment concerns from prior shifts" },
  { id: "agmReviewedFolioCorrections", label: "Reviewed folio corrections needing approval" },
  { id: "agmDocumentedFinancialConcerns", label: "Documented unresolved financial concerns for GM" },
]

// Part 4: Housekeeping Alignment
export const agmHousekeepingAlignmentOptions = [
  { id: "agmConfirmedDepartureCount", label: "Confirmed housekeeping has departure count" },
  { id: "agmConfirmedStayoverCount", label: "Confirmed housekeeping has stayover count" },
  { id: "agmConfirmedPriorityList", label: "Confirmed housekeeping has priority room list" },
  { id: "agmReviewedDirtyRooms", label: "Reviewed rooms still dirty during the day" },
  { id: "agmReviewedOOORooms", label: "Reviewed out-of-order rooms with maintenance or engineering" },
  { id: "agmReviewedRoomMoves", label: "Reviewed room move needs" },
  { id: "agmConfirmedMaintenanceAssigned", label: "Confirmed maintenance issues affecting guest experience are assigned" },
  { id: "agmEscalatedRoomReadiness", label: "Escalated room readiness risks before check-in rush" },
]

// Part 5: Groups and Inventory Risk
export const groupsInventoryRiskOptions = [
  { id: "agmReviewedGroupArrivals", label: "Reviewed group arrivals" },
  { id: "agmReviewedGroupDepartures", label: "Reviewed group departures" },
  { id: "agmReviewedInHouseGroups", label: "Reviewed in-house groups" },
  { id: "agmReviewedGroupPickup", label: "Reviewed group pickup and remaining rooms" },
  { id: "agmReviewedGroupBilling", label: "Reviewed group billing/routing concerns" },
  { id: "agmConfirmedGroupTiming", label: "Confirmed group arrival timing with operations" },
  { id: "agmReviewedInventoryRisk", label: "Reviewed inventory risk caused by groups or OOO rooms" },
  { id: "agmEscalatedGroupIssues", label: "Escalated major group or inventory issues to GM" },
]

// Part 6: Leadership Follow-Up
export const leadershipFollowUpOptions = [
  { id: "agmReviewedChecklistCompletion", label: "Reviewed front desk checklist completion for AM, PM, or Night Audit" },
  { id: "agmReviewedUnresolvedGuestIssues", label: "Reviewed unresolved guest issues before leaving" },
  { id: "agmReviewedStaffingTraining", label: "Reviewed staffing or training concerns" },
  { id: "agmReviewedWinsMisses", label: "Reviewed operational wins and misses" },
  { id: "agmPreparedSummary", label: "Prepared AGM leadership summary" },
  { id: "agmCommunicatedToGM", label: "Communicated critical issues to GM" },
  { id: "agmReviewedUnresolvedGXPBeforeLeaving", label: "Reviewed unresolved GXP cases before leaving", system: "GXP" as const },
  { id: "agmReviewedUnresolvedMGSBeforeLeaving", label: "Reviewed unresolved MGS/ServiceNow tickets before leaving", system: "MGS" as const },
  { id: "agmReviewedGXPGPSCoaching", label: "Reviewed GXP/GPS usage for coaching opportunities", system: "GXP" as const },
]

// Final Confirmation
export const agmFinalConfirmationOptions = [
  { id: "agmConfirmChecklist", label: "I confirm that I reviewed Stay PMS and completed the AGM checklist accurately" },
  { id: "agmConfirmReviewed", label: "I confirm that front desk execution, inventory, billing, and guest issues were reviewed" },
  { id: "agmConfirmOwnerAssigned", label: "I confirm that unresolved issues were assigned to an owner" },
  { id: "agmConfirmGMUpdated", label: "I confirm that GM was updated on critical issues" },
]



