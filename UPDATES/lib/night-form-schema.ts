import { z } from "zod"

export const nightFormSchema = z.object({
  // Top-of-form fields
  associateName: z.string().min(1, "Associate name is required"),
  date: z.string().min(1, "Date is required"),
  shiftStartTime: z.string().min(1, "Shift start time is required"),
  shiftEndTime: z.string().min(1, "Shift end time is required"),
  managerOnDuty: z.string().min(1, "Manager on duty / Overnight manager is required"),
  
  // Bank Count - Start of Shift
  startBankCount: z.string().min(1, "Start bank count is required"),
  startBankVerified: z.enum(["Yes", "No"]),
  startBankDiscrepancy: z.string().optional(),
  
  currentOccupancy: z.string().optional(),
  arrivalsRemaining: z.string().optional(),
  departuresRemaining: z.string().optional(),
  vacantReadyRooms: z.string().optional(),
  dirtyRooms: z.string().optional(),
  outOfOrderRooms: z.string().optional(),
  expectedOccupancyAfterAudit: z.string().optional(),
  sellOutRisk: z.enum(["Yes", "No"]),
  sellOutRiskExplanation: z.string().optional(),
  nightAuditCompleted: z.enum(["Yes", "No"]),
  nightAuditNotCompletedExplanation: z.string().optional(),

  // Part 1: Night Opening Review + Late Arrivals
  nightShiftOpeningReview: z.array(z.string()).optional(),
  lateArrivalReview: z.array(z.string()).optional(),
  overnightRoomAssignmentStrategy: z.array(z.string()).optional(),
  standardLateArrivalsPreAssigned: z.enum(["Yes", "No"]).optional(),
  standardLateArrivalsPreAssignedExplanation: z.string().optional(),
  vipPriorityLateArrivals: z.string().optional(),

  // Part 2: Payment, Folio, Ledger + Audit Readiness
  paymentAuthorizationReview: z.array(z.string()).optional(),
  folioBalanceReview: z.array(z.string()).optional(),
  unresolvedPaymentFolioIssues: z.enum(["Yes", "No"]).optional(),
  unresolvedPaymentFolioIssuesDetails: z.string().optional(),
  noShowCancellationReview: z.array(z.string()).optional(),
  noShowExceptions: z.enum(["Yes", "No"]).optional(),
  noShowExceptionsDetails: z.string().optional(),

  // Part 3: Night Audit, Reports + Business Date Review
  preAuditReadiness: z.array(z.string()).optional(),
  nightAuditCompletion: z.array(z.string()).optional(),
  requiredReportReview: z.array(z.string()).optional(),

  // Part 4: Morning Prep + AM Handoff
  morningArrivalDeparturePrep: z.array(z.string()).optional(),
  amHousekeepingPrep: z.array(z.string()).optional(),
  amShiftHandoffNotes: z.string().optional(),

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

export type NightFormData = z.infer<typeof nightFormSchema>

// Section 1: Night Shift Opening Review
export const nightShiftOpeningReviewOptions = [
  { id: "reviewedPMHandoffNotes", label: "Reviewed PM shift handoff notes" },
  { id: "confirmedRemainingArrivals", label: "Reviewed arrivals still not checked in" },
  { id: "reviewedDeparturesNotCheckedOut", label: "Reviewed departures still not checked out" },
  { id: "reviewedInHouseGuestsNight", label: "Reviewed in-house guests" },
  { id: "reviewedVacantReadyRoomsNight", label: "Reviewed vacant ready rooms" },
  { id: "reviewedDirtyRoomsNight", label: "Reviewed dirty rooms" },
  { id: "reviewedOOORoomsNight", label: "Reviewed out-of-order rooms" },
  { id: "reviewedRoomAvailabilityNight", label: "Reviewed room availability by room type" },
  { id: "reviewedSoldRoomTypesNight", label: "Reviewed sold room types or oversell risk" },
  { id: "reviewedGXPOpenCasesPM", label: "Reviewed GXP open cases from PM shift", system: "GXP" as const },
  { id: "reviewedGXPWakeUpCalls", label: "Reviewed GXP wake-up calls or overnight requests if applicable", system: "GXP" as const },
  { id: "reviewedMGSOpenIssuesNight", label: "Reviewed open MGS/ServiceNow issues affecting night audit", system: "MGS" as const },
]

// Section 2: Late Arrival Review
export const lateArrivalReviewOptions = [
  { id: "reviewedGuaranteedLateArrivals", label: "Reviewed guaranteed late arrivals" },
  { id: "reviewedNonGuaranteedArrivals", label: "Reviewed non-guaranteed arrivals if applicable" },
  { id: "reviewedVIPLateArrivalsNight", label: "Reviewed VIP or priority arrivals still not checked in" },
  { id: "reviewedAccessibilityLateArrivals", label: "Reviewed accessibility arrivals still not checked in" },
  { id: "reviewedSuiteLateArrivals", label: "Reviewed suite or specialty room arrivals still not checked in" },
  { id: "reviewedGroupLateArrivalsNight", label: "Reviewed group arrivals still not checked in" },
  { id: "reviewedMobileKeyLateArrivalsNight", label: "Reviewed mobile key arrivals still pending" },
  { id: "reviewedPaymentIssueLateArrivals", label: "Reviewed remaining arrivals with payment issues" },
  { id: "reviewedAssignedRoomsLateArrivals", label: "Reviewed assigned rooms for guests still not checked in" },
]

// Section 3: Overnight Room Assignment Strategy
export const overnightRoomAssignmentStrategyOptions = [
  { id: "standardLateArrivalsLeftUnassigned", label: "Standard late arrivals were left unassigned unless there was a true operational reason" },
  { id: "vipRoomsProtectedNight", label: "VIP rooms were protected only when needed" },
  { id: "accessibilityRoomsProtectedNight", label: "Accessibility rooms were protected when needed" },
  { id: "connectingRoomsProtectedNight", label: "Connecting or adjoining rooms were protected when needed" },
  { id: "suitesProtectedNight", label: "Suites or specialty rooms were protected when needed" },
  { id: "groupLateArrivalsReviewed", label: "Group late arrivals were reviewed for room needs" },
  { id: "unnecessaryAssignmentsReleasedNight", label: "Unnecessary room assignments were released when appropriate" },
]

// Section 4: Payment and Authorization Review
export const paymentAuthorizationReviewOptions = [
  { id: "reviewedRemainingArrivalsPayment", label: "Reviewed remaining arrivals for valid payment method" },
  { id: "confirmedCheckedInGuestsPayment", label: "Confirmed checked-in guests have valid payment when possible" },
  { id: "verifiedAuthorizationsValid", label: "Confirmed credit card authorizations were completed through approved device" },
  { id: "identifiedDecliningBalances", label: "Reviewed failed or missing authorizations" },
  { id: "reviewedDirectBillNight", label: "Reviewed direct bill reservations" },
  { id: "reviewedRoutedBillingNight", label: "Reviewed routed billing reservations" },
  { id: "reviewedTaxExemptNight", label: "Reviewed tax-exempt reservations" },
  { id: "reviewedCashTransactionsNight", label: "Reviewed cash transactions from PM / overnight" },
  { id: "documentedPaymentIssuesForAM", label: "Documented unresolved payment issues for AM shift" },
  { id: "documentedPaymentDeviceMGS", label: "Documented payment device issues in MGS/ServiceNow if unresolved", system: "MGS" as const },
  { id: "createdGXPCaseOvernightComplaint", label: "Created or updated GXP case for unresolved overnight guest complaint", system: "GXP" as const },
]

// Section 5: Folio and Balance Review
export const folioBalanceReviewOptions = [
  { id: "reviewedInHouseFolios", label: "Reviewed in-house guest balances" },
  { id: "reviewedDeparturesOpenBalances", label: "Reviewed departures with open balances" },
  { id: "reviewedCheckedOutOpenBalances", label: "Reviewed checked-out reservations with open balances if applicable" },
  { id: "reviewedCityLedgerNight", label: "Reviewed City Ledger reservations if applicable" },
  { id: "identifiedFoliosNeedingCorrectionNight", label: "Identified folios needing correction" },
  { id: "postedAllOutstandingCharges", label: "Reviewed pantry or market postings if applicable" },
  { id: "reviewedHouseAccountActivity", label: "Reviewed house account activity if applicable" },
  { id: "communicatedFolioIssuesAM", label: "Communicated unresolved folio or balance issues to AM shift" },
]

// Section 6: No-Show / Cancellation Review
export const noShowCancellationReviewOptions = [
  { id: "reviewedArrivalsBeforeNoShow", label: "Reviewed remaining arrivals before no-show processing" },
  { id: "reviewedGuaranteedBeforeNoShow", label: "Reviewed guaranteed reservations before no-show action" },
  { id: "reviewedGroupBeforeNoShow", label: "Reviewed group reservations before no-show action" },
  { id: "reviewedVIPBeforeNoShow", label: "Reviewed VIP or priority reservations before no-show action" },
  { id: "processedNoShows", label: "Followed property no-show process" },
  { id: "documentedNoShowExceptions", label: "Documented any no-show exceptions" },
]

// Section 7: Pre-Audit Readiness
export const preAuditReadinessOptions = [
  { id: "confirmedCheckInsBeforeAudit", label: "Confirmed all possible check-ins are completed before audit" },
  { id: "confirmedCheckoutsBeforeAudit", label: "Confirmed all possible checkouts are completed before audit" },
  { id: "confirmedBalancesDocumented", label: "Confirmed unresolved balances are documented before audit" },
  { id: "confirmedCashPaymentBalanced", label: "Confirmed cash and payment activity is balanced according to property process" },
  { id: "confirmedRoomStatusDocumented", label: "Confirmed room status concerns are documented before audit" },
  { id: "confirmedMODAwareOfIssues", label: "Confirmed MOD or leadership is aware of major unresolved issues before audit" },
]

// Section 8: Night Audit Completion
export const nightAuditCompletionOptions = [
  { id: "ranNightAuditProcess", label: "Completed night audit process according to property procedure" },
  { id: "confirmedBusinessDateRolled", label: "Confirmed business date rolled correctly" },
  { id: "verifiedAuditCompleted", label: "Confirmed audit completed without critical errors" },
  { id: "printedRequiredReports", label: "Saved or printed required audit reports" },
  { id: "reviewedAuditReportsIssues", label: "Reviewed audit reports for obvious issues" },
  { id: "documentedAuditErrors", label: "Documented any audit errors or system issues" },
]

// Section 9: Required Report Review
export const requiredReportReviewOptions = [
  { id: "reviewedArrivalsReportNewDay", label: "Reviewed Arrivals report/list for the new business day" },
  { id: "reviewedDeparturesReportNewDay", label: "Reviewed Departures report/list for the new business day" },
  { id: "reviewedInHouseGuestList", label: "Reviewed In-House Guest List" },
  { id: "reviewedOOOReport", label: "Reviewed Out of Order Rooms report/list" },
  { id: "reviewedRoomMoveTracking", label: "Reviewed Room Move Tracking if applicable" },
  { id: "reviewedCancellationsNoShowReport", label: "Reviewed Cancellations / No-Show report if applicable" },
  { id: "reviewedDuplicateReservations", label: "Reviewed Duplicate Reservations if applicable" },
  { id: "reviewedShiftReport", label: "Reviewed Shift Report if applicable" },
  { id: "reconciledAllAccounts", label: "Reviewed Trial Balance or audit balance report if applicable" },
  { id: "reviewedDetailedFlash", label: "Reviewed Detailed Flash or daily summary report if applicable" },
  { id: "confirmedReportAuditIssuesMGS", label: "Confirmed report or audit issues were escalated through MGS/ServiceNow if needed", system: "MGS" as const },
]

// Section 10: Morning Arrival and Departure Prep
export const morningArrivalDeparturePrepOptions = [
  { id: "preAssignedMorningArrivals", label: "Reviewed today's arrivals after audit" },
  { id: "reviewedTodaysDeparturesAfterAudit", label: "Reviewed today's departures after audit" },
  { id: "reviewedVIPArrivalsForAM", label: "Reviewed VIP arrivals for AM shift" },
  { id: "preparedEarlyArrivalRooms", label: "Reviewed early arrival requests for AM shift" },
  { id: "reviewedAccessibilityNeedsForAM", label: "Reviewed accessibility needs for AM shift" },
  { id: "reviewedConnectingRequestsForAM", label: "Reviewed connecting or adjoining requests for AM shift" },
  { id: "reviewedGroupArrivalsDeparturesForAM", label: "Reviewed group arrivals and departures for AM shift" },
  { id: "reviewedRoomAvailabilityNewDay", label: "Reviewed room availability for the new business day" },
  { id: "reviewedOOOImpactNewDay", label: "Reviewed out-of-order impact for the new business day" },
  { id: "addedUnresolvedGXPCasesAMHandoff", label: "Added unresolved GXP cases to AM handoff", system: "GXP" as const },
  { id: "addedUnresolvedMGSTicketsAMHandoff", label: "Added unresolved MGS/ServiceNow tickets to AM handoff", system: "MGS" as const },
  { id: "reviewedGPSEarlyVIPArrivals", label: "Reviewed GPS notes for early VIP or high-touch arrivals if applicable", system: "GPS" as const },
]

// Section 11: AM Housekeeping Prep
export const amHousekeepingPrepOptions = [
  { id: "preparedDepartureCountHSK", label: "Prepared departure count for housekeeping" },
  { id: "preparedStayoverCountHSK", label: "Prepared stayover count for housekeeping" },
  { id: "preparedVacantReadyCountAM", label: "Prepared vacant ready room count for AM shift" },
  { id: "preparedDirtyRoomCountAM", label: "Prepared dirty room count for AM shift" },
  { id: "preparedOOORoomListAM", label: "Prepared out-of-order room list for AM shift" },
  { id: "createdHousekeepingAssignments", label: "Prepared priority room needs for housekeeping" },
  { id: "preparedRoomMoveNeedsAM", label: "Prepared room move needs for AM shift" },
]

// Section 13: Final Night Audit Confirmation
export const nightFinalConfirmationOptions = [
  { id: "confirmNightAuditChecklist", label: "I confirm that I reviewed Stay PMS and completed the night audit checklist accurately" },
  { id: "confirmNightAuditCompleted", label: "I confirm that night audit was completed or any failure was documented and escalated" },
  { id: "confirmBusinessDateVerified", label: "I confirm that the business date was verified after audit" },
  { id: "confirmStandardLateArrivalsNotPreAssigned", label: "I confirm that standard late arrivals were not unnecessarily pre-assigned" },
  { id: "confirmUnresolvedIssuesDocumented", label: "I confirm that unresolved payment, folio, guest, and inventory issues were documented for AM shift" },
  { id: "confirmReportsReviewed", label: "I confirm that required reports were reviewed, saved, printed, or prepared according to property process" },
  { id: "preparedAMHandoff", label: "I confirm that AM shift or MOD was updated on unresolved issues before I left" },
]



