import { z } from "zod"

export const adminFormSchema = z.object({
  // Top-of-form fields
  adminName: z.string().min(1, "Admin name is required"),
  date: z.string().min(1, "Date is required"),
  shiftStartTime: z.string().min(1, "Shift start time is required"),
  shiftEndTime: z.string().min(1, "Shift end time is required"),
  managerOnDuty: z.string().min(1, "Manager on duty is required"),
  
  // Bank Count - Start of Shift
  startBankCount: z.string().min(1, "Start bank count is required"),
  startBankVerified: z.enum(["Yes", "No"]),
  startBankDiscrepancy: z.string().optional(),
  
  currentOccupancy: z.string().optional(),
  totalArrivals: z.string().optional(),
  totalDepartures: z.string().optional(),
  totalInHouseRooms: z.string().optional(),
  vacantReadyRooms: z.string().optional(),
  dirtyRooms: z.string().optional(),
  outOfOrderRooms: z.string().optional(),
  sellOutRisk: z.enum(["Yes", "No"]),
  sellOutRiskExplanation: z.string().optional(),

  // Section 1: Daily System Review
  dailySystemReview: z.array(z.string()),

  // Section 2: Arrival and Profile Cleanup
  arrivalProfileCleanup: z.array(z.string()),
  reservationCleanupNotes: z.string().optional(),

  // Section 3: Billing, Folio, and Ledger Review
  billingFolioLedgerReview: z.array(z.string()),
  unresolvedBillingIssues: z.enum(["Yes", "No"]),
  unresolvedBillingDetails: z.string().optional(),

  // Section 4: Groups and Events Review
  groupsEventsReview: z.array(z.string()),
  groupIssues: z.enum(["No groups today", "No issues", "Yes"]),
  groupIssueDetails: z.string().optional(),

  // Section 5: Reporting and Follow-Up
  reportingFollowUp: z.array(z.string()),
  adminSummaryNotes: z.string().optional(),

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

export type AdminFormValues = z.infer<typeof adminFormSchema>

// Section 1: Daily System Review
export const dailySystemReviewOptions = [
  { id: "adminReviewedTodaysArrivals", label: "Reviewed today's arrivals in Stay PMS" },
  { id: "adminReviewedTodaysDepartures", label: "Reviewed today's departures in Stay PMS" },
  { id: "adminReviewedInHouseGuests", label: "Reviewed in-house guests in Stay PMS" },
  { id: "adminReviewedRoomAvailability", label: "Reviewed room availability by room type" },
  { id: "adminReviewedSoldRoomTypes", label: "Reviewed sold room types or oversell risk" },
  { id: "adminReviewedVacantDirtyOOO", label: "Reviewed vacant ready, dirty, and out-of-order rooms" },
  { id: "adminReviewedDashboardExceptions", label: "Reviewed dashboard for operational exceptions" },
  { id: "adminConfirmedBusinessDate", label: "Confirmed business date is correct" },
]

// Section 2: Arrival and Profile Cleanup
export const arrivalProfileCleanupOptions = [
  { id: "adminReviewedMissingProfiles", label: "Reviewed arrivals for missing or incorrect guest profiles" },
  { id: "adminReviewedMissingBonvoy", label: "Reviewed arrivals for missing Bonvoy profiles where obvious" },
  { id: "adminReviewedVIPEliteArrivals", label: "Reviewed VIP and elite arrivals" },
  { id: "adminReviewedAccessibilityNeeds", label: "Reviewed accessibility room needs" },
  { id: "adminReviewedConnectingRooms", label: "Reviewed connecting or adjoining room requests" },
  { id: "adminReviewedEarlyArrivals", label: "Reviewed early arrivals" },
  { id: "adminReviewedServiceRecovery", label: "Reviewed service recovery arrivals" },
  { id: "adminConfirmedNoUnnecessaryPreAssign", label: "Confirmed standard arrivals are not unnecessarily pre-assigned" },
  { id: "adminDocumentedReservationCleanup", label: "Documented any reservation cleanup needed" },
  { id: "adminReviewedGPSProfilesVIP", label: "Reviewed GPS profiles for VIP, elite, and high-touch arrivals", system: "GPS" as const },
  { id: "adminReviewedGXPPreArrivalCases", label: "Reviewed GXP pre-arrival requests and open cases", system: "GXP" as const },
  { id: "adminConfirmedEmpowerResAppUsage", label: "Confirmed Empower ResApp is used for future-dated individual reservation work", system: "EmpowerResApp" as const },
]

// Section 3: Billing, Folio, and Ledger Review
export const billingFolioLedgerReviewOptions = [
  { id: "adminReviewedArrivalsPayment", label: "Reviewed arrivals for payment concerns" },
  { id: "adminReviewedInHouseBalances", label: "Reviewed in-house balances" },
  { id: "adminReviewedDeparturesBalances", label: "Reviewed departures with open balances" },
  { id: "adminReviewedCheckedOutBalances", label: "Reviewed checked-out reservations with open balances" },
  { id: "adminReviewedDirectBill", label: "Reviewed direct bill reservations" },
  { id: "adminReviewedRoutedBilling", label: "Reviewed routed billing reservations" },
  { id: "adminReviewedTaxExempt", label: "Reviewed tax-exempt reservations" },
  { id: "adminReviewedFoliosCorrection", label: "Reviewed folios needing correction" },
  { id: "adminCommunicatedBillingIssues", label: "Communicated unresolved billing issues to AGM or GM" },
]

// Section 4: Groups and Events Review
export const adminGroupsEventsReviewOptions = [
  { id: "adminReviewedGroupArrivals", label: "Reviewed group arrivals for today" },
  { id: "adminReviewedGroupDepartures", label: "Reviewed group departures for today" },
  { id: "adminReviewedInHouseGroups", label: "Reviewed in-house groups" },
  { id: "adminReviewedGroupPickup", label: "Reviewed group pickup" },
  { id: "adminReviewedRemainingGroupRooms", label: "Reviewed remaining group rooms" },
  { id: "adminReviewedGroupBillingNotes", label: "Reviewed group billing and routing notes" },
  { id: "adminReviewedGroupSpecialRequests", label: "Reviewed group special requests" },
  { id: "adminConfirmedGroupCommunicated", label: "Confirmed group needs were communicated to operations" },
]

// Section 5: Reporting and Follow-Up
export const reportingFollowUpOptions = [
  { id: "adminReviewedDailyReports", label: "Reviewed required daily reports" },
  { id: "adminReviewedNoShowCancellation", label: "Reviewed no-show or cancellation activity" },
  { id: "adminReviewedDuplicateReservations", label: "Reviewed duplicate reservations if applicable" },
  { id: "adminReviewedOOORoomList", label: "Reviewed out-of-order room list" },
  { id: "adminReviewedRoomMoveTracking", label: "Reviewed room move tracking if applicable" },
  { id: "adminReviewedGuestFollowUp", label: "Reviewed guest follow-up items" },
  { id: "adminUpdatedGuestNotes", label: "Updated guest notes where needed" },
  { id: "adminPreparedSummary", label: "Prepared admin summary for leadership" },
  { id: "adminReviewedGXPAgingCases", label: "Reviewed open GXP cases for aging or missed follow-up", system: "GXP" as const },
  { id: "adminReviewedMGSOpenTickets", label: "Reviewed open MGS/ServiceNow tickets affecting operations", system: "MGS" as const },
  { id: "adminAuditedGXPCompletion", label: "Audited guest request completion accuracy in GXP", system: "GXP" as const },
]

// Final Confirmation
export const adminFinalConfirmationOptions = [
  { id: "adminConfirmChecklist", label: "I confirm that I reviewed Stay PMS and completed the Admin checklist accurately" },
  { id: "adminConfirmDocumented", label: "I confirm that reservation, billing, and inventory concerns were documented" },
  { id: "adminConfirmCommunicated", label: "I confirm that unresolved items were communicated to the MOD, AGM, or GM" },
]



