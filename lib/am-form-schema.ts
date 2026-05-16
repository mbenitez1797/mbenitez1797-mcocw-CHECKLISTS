import { z } from "zod"

export const amFormSchema = z.object({
  // Top-of-form fields
  associateName: z.string().min(1, "Associate name is required"),
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
  vacantReadyRooms: z.string().optional(),
  outOfOrderRooms: z.string().optional(),
  sellOutRisk: z.enum(["Yes", "No"]),
  sellOutRiskExplanation: z.string().optional(),

  // Part 1: Opening Review + Departures
  openingStayPMSReview: z.array(z.string()).optional(),
  overnightFollowUp: z.array(z.string()).optional(),
  unresolvedOvernightIssues: z.enum(["Yes", "No"]).optional(),
  unresolvedOvernightExplanation: z.string().optional(),
  departureReview: z.array(z.string()).optional(),
  departureNotes: z.string().optional(),
  openBalanceLedgerReview: z.array(z.string()).optional(),
  openBalanceIssues: z.enum(["Yes", "No"]).optional(),
  openBalanceIssuesDetails: z.string().optional(),

  // Part 2: Housekeeping Coordination + Arrival Readiness
  housekeepingAlignment: z.array(z.string()).optional(),
  priorityRoomsCommunicated: z.string().optional(),
  arrivalReview: z.array(z.string()).optional(),
  roomAssignmentStrategy: z.array(z.string()).optional(),
  standardArrivalsPreAssigned: z.enum(["Yes", "No"]).optional(),
  preAssignedExplanation: z.string().optional(),
  vipPriorityArrivals: z.string().optional(),
  paymentBillingProfileReadiness: z.array(z.string()).optional(),
  paymentBillingProfileIssues: z.enum(["Yes", "No"]).optional(),
  paymentBillingProfileIssuesDetails: z.string().optional(),
  groupsEventsReview: z.array(z.string()).optional(),
  groupIssues: z.enum(["No groups today", "No issues", "Yes"]).optional(),
  groupIssuesDetails: z.string().optional(),

  // Part 3: Final Arrival Prep + PM Handoff
  finalRoomInventoryCheck: z.array(z.string()).optional(),
  roomInventoryConcerns: z.enum(["Yes", "No"]).optional(),
  roomInventoryConcernsDetails: z.string().optional(),
  guestFollowUpCheck: z.array(z.string()).optional(),
  guestFollowUpsCompleted: z.enum(["Yes", "No", "NA"]).optional(),
  guestFollowUpsDetails: z.string().optional(),
  pmShiftHandoff: z.array(z.string()).optional(),
  pmHandoffNotes: z.string().optional(),

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

export type AMFormData = z.infer<typeof amFormSchema>

// Section 1: Opening Stay PMS Review
export const openingStayPMSReviewOptions = [
  { id: "reviewedTodaysArrivals", label: "Reviewed today's arrivals in Stay PMS" },
  { id: "reviewedTodaysDepartures", label: "Reviewed today's departures in Stay PMS" },
  { id: "reviewedInHouseGuests", label: "Reviewed in-house guests in Stay PMS" },
  { id: "reviewedVacantReadyRooms", label: "Reviewed vacant ready rooms" },
  { id: "reviewedDirtyRooms", label: "Reviewed dirty rooms" },
  { id: "reviewedOutOfOrderRooms", label: "Reviewed out-of-order rooms" },
  { id: "reviewedOccupancyPercentage", label: "Reviewed occupancy percentage for today" },
  { id: "reviewedRoomAvailabilityByType", label: "Reviewed room availability by room type" },
  { id: "reviewedSoldRoomTypesAM", label: "Reviewed sold room types or oversell risk" },
]

// Section 2: Overnight Follow-Up
export const overnightFollowUpOptions = [
  { id: "reviewedNightAuditReports", label: "Confirmed night audit was completed" },
  { id: "reviewedNoShowsOvernight", label: "Reviewed no-shows from overnight" },
  { id: "verifiedOvernightArrivals", label: "Reviewed late arrivals from overnight" },
  { id: "checkedOvernightIncidents", label: "Reviewed overnight guest issues" },
  { id: "reviewedOvernightRoomMoves", label: "Reviewed overnight room moves" },
  { id: "reviewedMaintenanceOvernight", label: "Reviewed maintenance issues from overnight" },
  { id: "reviewedBillingOvernight", label: "Reviewed billing or payment issues from overnight" },
  { id: "reviewedAMFollowUpItems", label: "Reviewed items needing AM follow-up" },
  { id: "reviewedGXPOpenRequestsOvernight", label: "Reviewed GXP open guest requests from overnight", system: "GXP" as const },
  { id: "reviewedGXPUnresolvedComplaints", label: "Reviewed unresolved GXP complaints or service recovery items", system: "GXP" as const },
  { id: "reviewedMGSTicketsOvernight", label: "Reviewed MGS/ServiceNow tickets or system issues from overnight", system: "MGS" as const },
]

// Section 3: Departure Review
export const departureReviewOptions = [
  { id: "reviewedDepartureList", label: "Reviewed all due-out rooms for today" },
  { id: "identifiedEarlyDepartures", label: "Identified early departures" },
  { id: "identifiedLateCheckouts", label: "Identified late checkouts" },
  { id: "identifiedGroupDepartures", label: "Identified group departures" },
  { id: "checkedExpressCheckouts", label: "Checked departures for open balances" },
  { id: "checkedDeparturesBillingIssues", label: "Checked departures for billing or routing issues" },
  { id: "checkedDeparturesTaxExempt", label: "Checked departures for tax-exempt status" },
  { id: "checkedFoliosPrintEmail", label: "Checked for guests needing printed or emailed folios" },
  { id: "communicatedLateCheckoutsHSK", label: "Communicated late checkouts to housekeeping" },
  { id: "communicatedGroupDeparturesHSK", label: "Communicated group departures to housekeeping" },
  { id: "communicatedBillingIssuesMOD", label: "Communicated unresolved billing issues to MOD" },
]

// Section 4: Open Balance / Ledger Review
export const openBalanceLedgerReviewOptions = [
  { id: "reviewedInHouseBalances", label: "Reviewed in-house guest balances" },
  { id: "reviewedDeparturesWithBalances", label: "Reviewed departures with balances" },
  { id: "reviewedCheckedOutOpenBalances", label: "Reviewed checked-out reservations with open balances if applicable" },
  { id: "reviewedCityLedger", label: "Reviewed City Ledger reservations if applicable" },
  { id: "identifiedFoliosNeedingCorrection", label: "Identified folios needing correction" },
  { id: "communicatedUnresolvedBalances", label: "Communicated unresolved balances to MOD" },
]

// Section 5: Housekeeping Alignment
export const housekeepingAlignmentOptions = [
  { id: "sharedDepartureCountHSK", label: "Shared departure count with housekeeping" },
  { id: "sharedStayoverCountHSK", label: "Shared stayover count with housekeeping" },
  { id: "sharedEarlyArrivalRequestsHSK", label: "Shared early arrival requests with housekeeping" },
  { id: "sharedVIPRoomsHSK", label: "Shared VIP rooms needed with housekeeping" },
  { id: "sharedAccessibilityRoomsHSK", label: "Shared accessibility rooms needed with housekeeping" },
  { id: "sharedConnectingRoomsHSK", label: "Shared connecting or adjoining room needs with housekeeping" },
  { id: "sharedSuitesSpecialtyHSK", label: "Shared suites or specialty room needs with housekeeping" },
  { id: "sharedGroupArrivalRoomsHSK", label: "Shared group arrival rooms needed with housekeeping" },
  { id: "sharedLateCheckoutRoomsHSK", label: "Shared late checkout rooms with housekeeping" },
  { id: "sharedRoomMovesHSK", label: "Shared room moves needed today with housekeeping" },
  { id: "sharedOOORoomsHSK", label: "Shared out-of-order rooms with housekeeping" },
  { id: "sharedMaintenanceIssuesHSK", label: "Shared maintenance issues with housekeeping" },
]

// Section 6: Arrival Review
export const arrivalReviewOptions = [
  { id: "reviewedTotalArrivals", label: "Reviewed total arrivals for today" },
  { id: "reviewedEarlyArrivalRequests", label: "Reviewed early arrival requests" },
  { id: "reviewedVIPArrivalsAM", label: "Reviewed VIP arrivals" },
  { id: "reviewedEliteArrivalsAM", label: "Reviewed elite arrivals" },
  { id: "reviewedAccessibilityNeedsAM", label: "Reviewed accessibility needs" },
  { id: "reviewedConnectingRoomsAM", label: "Reviewed connecting or adjoining room requests" },
  { id: "reviewedSuiteArrivalsAM", label: "Reviewed suite or specialty room arrivals" },
  { id: "reviewedServiceRecoveryGuests", label: "Reviewed service recovery guests" },
  { id: "reviewedGroupArrivalsAM", label: "Reviewed group arrivals" },
  { id: "reviewedMobileKeyRequestsAM", label: "Reviewed mobile key requests" },
  { id: "reviewedSpecialRequestsAM", label: "Reviewed special requests" },
  { id: "reviewedPaymentRoutingConcerns", label: "Reviewed payment and routing concerns for arrivals" },
  { id: "reviewedGPSPreferencesVIP", label: "Reviewed GPS guest preferences for VIP, elite, and high-touch arrivals", system: "GPS" as const },
  { id: "reviewedGXPPreArrivalRequests", label: "Reviewed GXP pre-arrival requests for today's arrivals", system: "GXP" as const },
  { id: "reviewedEmpowerResAppQuestions", label: "Reviewed Empower ResApp for future reservation questions", system: "EmpowerResApp" as const },
]

// Section 7: Room Assignment Strategy
export const amRoomAssignmentStrategyOptions = [
  { id: "standardArrivalsLeftUnassigned", label: "Standard arrivals were left unassigned" },
  { id: "roomsNotHeldUnnecessarilyAM", label: "Rooms were not held unnecessarily" },
  { id: "vipsPreAssignedIfNeeded", label: "VIPs were pre-assigned only if needed" },
  { id: "accessibilityPreAssignedIfNeeded", label: "Accessibility rooms were pre-assigned if needed" },
  { id: "connectingPreAssignedIfNeeded", label: "Connecting or adjoining rooms were pre-assigned if needed" },
  { id: "suitesPreAssignedIfNeeded", label: "Suites or specialty rooms were pre-assigned if needed" },
  { id: "earlyArrivalsPreAssignedIfSupported", label: "Known early arrivals were pre-assigned only when inventory supported it" },
  { id: "serviceRecoveryRoomsProtected", label: "Service recovery rooms were protected if needed" },
]

// Section 8: Payment, Billing, and Profile Readiness
export const paymentBillingProfileReadinessOptions = [
  { id: "verifiedCCAuthorizations", label: "Checked arrivals for valid payment method" },
  { id: "identifiedPaymentFollowUp", label: "Identified reservations needing payment follow-up" },
  { id: "identifiedDirectBillReservations", label: "Identified direct bill reservations" },
  { id: "identifiedRoutedBillingReservations", label: "Identified routed billing reservations" },
  { id: "identifiedTaxExemptReservations", label: "Identified tax-exempt reservations" },
  { id: "processedAdvanceDeposits", label: "Identified deposit or advance payment concerns" },
  { id: "communicatedPaymentIssuesAM", label: "Communicated payment issues to MOD or PM shift" },
  { id: "checkedVIPEliteProfiles", label: "Checked VIP or elite profile details" },
  { id: "checkedMissingBonvoyProfile", label: "Checked for missing Bonvoy profile where obvious" },
  { id: "checkedDuplicateProfiles", label: "Checked for duplicate or incorrect guest profiles" },
  { id: "updatedGuestNotesAM", label: "Updated guest notes where appropriate" },
  { id: "escalatedProfileIssues", label: "Escalated profile issues if unable to resolve" },
]

// Section 9: Groups and Events Review
export const groupsEventsReviewOptions = [
  { id: "reviewedGroupArrivalDetails", label: "Checked group arrivals" },
  { id: "checkedGroupDepartures", label: "Checked group departures" },
  { id: "checkedInHouseGroups", label: "Checked in-house groups" },
  { id: "reviewedGroupRoomPickup", label: "Reviewed group room pickup" },
  { id: "reviewedRemainingGroupRooms", label: "Reviewed remaining group rooms" },
  { id: "reviewedGroupBillingNotes", label: "Reviewed group billing or routing notes" },
  { id: "reviewedGroupSpecialRequests", label: "Reviewed group special requests" },
  { id: "reviewedGroupArrivalTime", label: "Reviewed expected group arrival time if known" },
  { id: "coordinatedGroupNeeds", label: "Communicated group needs to housekeeping" },
  { id: "communicatedGroupNeedsPM", label: "Communicated group needs to MOD or PM shift" },
]

// Section 10: Final Room Inventory Check
export const finalRoomInventoryCheckOptions = [
  { id: "checkedVacantReadyBeforePM", label: "Checked vacant ready rooms before PM shift" },
  { id: "checkedDirtyRoomsStillNeeded", label: "Checked dirty rooms still needed for arrivals" },
  { id: "checkedInspectedRooms", label: "Checked inspected rooms if applicable" },
  { id: "checkedOOOBeforePM", label: "Checked out-of-order rooms before PM shift" },
  { id: "checkedMaintenanceRoomsBeforePM", label: "Checked maintenance rooms before PM shift" },
  { id: "checkedRoomTypeAvailability", label: "Checked room type availability before PM shift" },
  { id: "confirmedFinalRoomCount", label: "Checked oversell or sell-out risk before PM shift" },
  { id: "checkedVIPRoomsNeeded", label: "Checked rooms needed for VIPs" },
  { id: "checkedAccessibilityRoomsNeeded", label: "Checked rooms needed for accessibility requests" },
  { id: "checkedConnectingRoomsNeeded", label: "Checked rooms needed for connecting or adjoining requests" },
  { id: "checkedEarlyArrivalRoomsNeeded", label: "Checked rooms needed for early arrivals still waiting" },
]

// Section 11: Guest Follow-Up Check
export const guestFollowUpCheckOptions = [
  { id: "reviewedUnresolvedComplaints", label: "Reviewed unresolved guest complaints" },
  { id: "reviewedServiceRecoveryNeeds", label: "Reviewed service recovery needs" },
  { id: "reviewedMaintenanceFollowUps", label: "Reviewed maintenance follow-ups" },
  { id: "reviewedRoomMoveFollowUps", label: "Reviewed room move follow-ups" },
  { id: "reviewedBillingFollowUps", label: "Reviewed billing follow-ups" },
  { id: "reviewedVIPFollowUps", label: "Reviewed VIP follow-ups" },
  { id: "updatedGuestNotesFollowUp", label: "Updated guest notes where needed" },
  { id: "communicatedUnresolvedGuestItems", label: "Communicated unresolved guest items to MOD or PM shift" },
  { id: "updatedClosedGXPCases", label: "Updated or closed completed GXP cases before PM handoff", system: "GXP" as const },
  { id: "addedUnresolvedGXPToPMHandoff", label: "Added unresolved GXP items to PM handoff", system: "GXP" as const },
  { id: "escalatedMGSTickets", label: "Escalated unresolved system/device issues through MGS/ServiceNow", system: "MGS" as const },
]

// Section 12: PM Shift Handoff
export const pmShiftHandoffOptions = [
  { id: "documentedArrivalsRemainingAM", label: "Documented arrivals remaining" },
  { id: "documentedVIPPriorityArrivalsAM", label: "Documented VIP or priority arrivals" },
  { id: "documentedEarlyArrivalsWaiting", label: "Documented early arrivals still waiting" },
  { id: "documentedRoomsNotReadyAM", label: "Documented rooms not ready" },
  { id: "documentedDirtyRoomsNeededFirst", label: "Documented dirty rooms needed first" },
  { id: "documentedLateCheckoutsAM", label: "Documented late checkouts" },
  { id: "documentedRoomMovesAM", label: "Documented room moves" },
  { id: "documentedGuestIssuesAM", label: "Documented guest issues" },
  { id: "documentedBillingPaymentIssuesAM", label: "Documented billing or payment issues" },
  { id: "documentedGroupNotesAM", label: "Documented group notes" },
  { id: "documentedOOORoomsAM", label: "Documented out-of-order rooms" },
  { id: "documentedMaintenanceIssuesAM", label: "Documented maintenance issues" },
  { id: "documentedInventoryRisksAM", label: "Documented inventory risks" },
  { id: "preparedPMHandoff", label: "Updated MOD on unresolved issues" },
]

// Section 13: Final AM Confirmation
export const amFinalConfirmationOptions = [
  { id: "confirmReviewedStayPMS", label: "I confirm that I reviewed Stay PMS and completed the AM checklist accurately" },
  { id: "confirmStandardArrivalsNotPreAssigned", label: "I confirm that standard arrivals were not unnecessarily pre-assigned" },
  { id: "confirmPriorityArrivalsPreAssigned", label: "I confirm that only true priority arrivals were pre-assigned when needed" },
  { id: "confirmHousekeepingUpdated", label: "I confirm that housekeeping was updated on priority rooms and late checkouts" },
  { id: "confirmUnresolvedCommunicated", label: "I confirm that unresolved items were communicated to the MOD or PM shift" },
]



