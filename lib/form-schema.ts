import { z } from "zod"

export const formSchema = z.object({
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
  arrivalsRemaining: z.string().optional(),
  departuresRemaining: z.string().optional(),
  vacantReadyRooms: z.string().optional(),
  dirtyRoomsNeeded: z.string().optional(),
  outOfOrderRooms: z.string().optional(),
  sellOutRisk: z.enum(["Yes", "No"]),

  // Part 1: Shift Start + Priority Arrivals
  shiftStartInventoryReview: z.array(z.string()).optional(),
  priorityArrivalReview: z.array(z.string()).optional(),
  roomAssignmentStrategy: z.array(z.string()).optional(),
  standardArrivalsPreAssigned: z.enum(["Yes", "No"]).optional(),
  preAssignedExplanation: z.string().optional(),
  vipPriorityArrivals: z.string().optional(),

  // Part 2: Peak Check-In Execution
  checkInExecution: z.array(z.string()).optional(),
  mobileKeyTasks: z.array(z.string()).optional(),
  housekeepingCoordination: z.array(z.string()).optional(),
  guestIssuesTasks: z.array(z.string()).optional(),
  unresolvedGuestIssues: z.enum(["Yes", "No"]).optional(),
  unresolvedGuestIssuesDetails: z.string().optional(),

  // Part 3: Late Arrivals + Night Audit Handoff
  lateArrivalReview: z.array(z.string()).optional(),
  paymentFolioReview: z.array(z.string()).optional(),
  unresolvedPaymentIssues: z.enum(["Yes", "No"]).optional(),
  unresolvedPaymentIssuesDetails: z.string().optional(),
  roomInventoryReview: z.array(z.string()).optional(),
  inventoryConcerns: z.enum(["Yes", "No"]).optional(),
  inventoryConcernsDetails: z.string().optional(),
  nightShiftHandoff: z.array(z.string()).optional(),
  nightShiftHandoffNotes: z.string().optional(),

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

export type FormData = z.infer<typeof formSchema>

// Checkbox options with IDs for help tooltips
export const shiftStartInventoryOptions = [
  { id: "reviewedPMSArrivalsDepartures", label: "Reviewed in-house guests in Stay PMS" },
  { id: "confirmedRoomInventory", label: "Reviewed vacant ready rooms" },
  { id: "reviewedDirtyRooms", label: "Reviewed dirty rooms still needed for arrivals" },
  { id: "updatedOOORooms", label: "Reviewed out-of-order rooms" },
  { id: "reviewedRoomAvailability", label: "Reviewed room availability by room type" },
  { id: "reviewedSoldRoomTypes", label: "Reviewed sold room types or oversell risk" },
  { id: "reviewedGXPOpenCasesAM", label: "Reviewed GXP open cases from AM shift", system: "GXP" as const },
  { id: "reviewedGPSNotesVIPPending", label: "Reviewed GPS notes for VIP, elite, and high-touch arrivals still pending", system: "GPS" as const },
  { id: "reviewedMGSOpenIssuesPM", label: "Reviewed open MGS/ServiceNow issues affecting PM operations", system: "MGS" as const },
]

export const priorityArrivalOptions = [
  { id: "checkedVIPArrivals", label: "Reviewed VIP arrivals still pending" },
  { id: "reviewedEliteArrivals", label: "Reviewed elite arrivals still pending" },
  { id: "reviewedAccessibilityNeeds", label: "Reviewed accessibility needs still pending" },
  { id: "reviewedConnectingRooms", label: "Reviewed connecting/adjoining room requests still pending" },
  { id: "reviewedSuiteArrivals", label: "Reviewed suite or specialty room arrivals still pending" },
  { id: "reviewedServiceRecovery", label: "Reviewed service recovery arrivals still pending" },
  { id: "reviewedEarlyArrivals", label: "Reviewed early arrivals still waiting for rooms" },
  { id: "reviewedMobileKeyRequests", label: "Reviewed mobile key requests still pending" },
  { id: "reviewedGroupBlocks", label: "Reviewed group arrivals still pending" },
]

export const roomAssignmentOptions = [
  { id: "preAssignedPriorityArrivals", label: "Standard remaining arrivals were left unassigned until guest arrival" },
  { id: "roomsNotHeldUnnecessarily", label: "Rooms were not held unnecessarily during PM shift" },
]

export const checkInExecutionOptions = [
  { id: "verifiedGuestIdentification", label: "Verified guest identity before check-in" },
  { id: "confirmedStayDates", label: "Confirmed guest stay dates before check-in" },
  { id: "confirmedRoomType", label: "Confirmed room type before check-in" },
  { id: "confirmedRatePackage", label: "Confirmed rate and package details before check-in when needed" },
  { id: "confirmedPaymentMethod", label: "Confirmed payment method before check-in" },
  { id: "confirmedCCAuthorization", label: "Confirmed credit card authorization was completed through approved device" },
  { id: "confirmedRoutingBilling", label: "Confirmed routing or billing instructions before check-in" },
  { id: "confirmedTaxExempt", label: "Confirmed tax-exempt setup before check-in if applicable" },
  { id: "confirmedSpecialRequests", label: "Confirmed special requests before check-in" },
  { id: "updatedGuestNotes", label: "Updated guest notes when needed" },
  { id: "checkedGXPBeforeVIPCheckIn", label: "Checked GXP for active requests before checking in VIP or service recovery guests", system: "GXP" as const },
  { id: "usedGPSForGuestRecognition", label: "Used GPS to support guest recognition when appropriate", system: "GPS" as const },
  { id: "submittedGXPCaseComplaint", label: "Submitted or updated GXP case for guest complaint during PM shift", system: "GXP" as const },
  { id: "escalatedDeviceIssueMGS", label: "Escalated payment device, key encoder, or system issue through MGS/ServiceNow when unresolved", system: "MGS" as const },
]

export const mobileKeyOptions = [
  { id: "verifiedMobileKeyEnabled", label: "Reviewed mobile key validation requests" },
  { id: "confirmedGuestAppDownload", label: "Completed required mobile key validation before issuing digital key" },
  { id: "testedMobileKeyFunctionality", label: "Confirmed digital key was issued only after validation passed" },
]

export const housekeepingOptions = [
  { id: "reviewedHousekeepingBoard", label: "Checked up on rooms for guests waiting already" },
  { id: "coordinatedEarlyCheckIns", label: "Confirmed priority rooms were cleaned or updated" },
  { id: "updatedRoomStatuses", label: "Updated PM team on room status changes" },
  { id: "communicatedLateCheckouts", label: "Communicated late checkout room impacts to housekeeping" },
  { id: "communicatedMaintenanceRooms", label: "Communicated urgent maintenance rooms to MOD or engineering" },
]

export const guestIssuesOptions = [
  { id: "followedUpOnPendingRequests", label: "Reviewed unresolved guest issues from AM handoff" },
  { id: "loggedGuestComplaints", label: "Handled guest complaints and documented action taken" },
  { id: "escalatedIssuesAsNeeded", label: "Escalated unresolved guest issues to MOD" },
  { id: "reviewedRoomMoveRequests", label: "Reviewed room move requests during PM shift" },
  { id: "completedRoomMoves", label: "Scheduled or completed room moves when needed" },
  { id: "documentedIncidentsInLog", label: "Documented service recovery follow-up for night shift if unresolved" },
]

export const lateArrivalOptions = [
  { id: "reviewedLateArrivalsList", label: "Reviewed arrivals still not checked in" },
  { id: "confirmedGuarantees", label: "Reviewed guaranteed late arrivals" },
  { id: "reviewedGroupLateArrivals", label: "Reviewed group arrivals still not checked in" },
  { id: "reviewedVIPLateArrivals", label: "Reviewed VIP or priority arrivals still not checked in" },
  { id: "reviewedMobileKeyLateArrivals", label: "Reviewed remaining mobile key arrivals" },
  { id: "reviewedPaymentIssueArrivals", label: "Reviewed remaining arrivals with payment issues" },
  { id: "preparedForAfterHoursCheckIns", label: "Reviewed assigned rooms for arrivals still not checked in" },
]

export const paymentFolioOptions = [
  { id: "verifiedAllFoliosCorrect", label: "Reviewed PM check-ins for payment completion" },
  { id: "reviewedInHouseBalances", label: "Reviewed in-house balances with concerns" },
  { id: "reviewedDirectBillIssues", label: "Reviewed direct bill or routed billing issues" },
  { id: "processedPayments", label: "Reviewed cash transactions if applicable" },
  { id: "postedOutstandingCharges", label: "Reviewed pantry or market postings if applicable" },
  { id: "resolvedPaymentDiscrepancies", label: "Communicated unresolved payment issues to night shift" },
]

export const roomInventoryOptions = [
  { id: "releasedUnnecessaryAssignments", label: "Released unnecessary room assignments for standard arrivals when appropriate" },
  { id: "protectedPriorityArrivals", label: "Protected only true priority remaining arrivals" },
]

export const nightShiftHandoffOptions = [
  { id: "documentedArrivalsRemaining", label: "Documented arrivals still remaining" },
  { id: "documentedVIPRemaining", label: "Documented VIP or priority arrivals still remaining" },
  { id: "documentedGuaranteedLate", label: "Documented guaranteed late arrivals" },
  { id: "documentedRoomsNotReady", label: "Documented rooms not ready" },
  { id: "preparedHandoffNotes", label: "Documented unresolved guest issues" },
  { id: "documentedRoomMovesPending", label: "Documented room moves still pending" },
  { id: "documentedBillingIssues", label: "Documented billing or payment issues" },
  { id: "documentedGroupNotes", label: "Documented group notes" },
  { id: "documentedOOORooms", label: "Documented out-of-order rooms" },
  { id: "documentedMaintenanceIssues", label: "Documented maintenance issues" },
  { id: "documentedInventoryRisks", label: "Documented inventory risks" },
  { id: "communicatedOutstandingIssues", label: "Updated MOD on unresolved issues before leaving" },
  { id: "documentedUnresolvedGXPCasesNight", label: "Documented unresolved GXP cases for night shift", system: "GXP" as const },
  { id: "documentedUnresolvedGPSFollowups", label: "Documented unresolved GPS preference or recognition follow-ups", system: "GPS" as const },
  { id: "documentedUnresolvedMGSTicketsNight", label: "Documented unresolved MGS/ServiceNow tickets for night shift", system: "MGS" as const },
]

export const finalConfirmationOptions = [
  { id: "allArrivalsProcessed", label: "I confirm all PM shift arrivals were reviewed and managed" },
  { id: "checkInProceduresFollowed", label: "I confirm all check-in procedures were followed correctly" },
  { id: "guestIssuesResolved", label: "I confirm all guest issues were handled or documented for night shift" },
  { id: "paymentBillingReviewed", label: "I confirm all payment and billing items were reviewed" },
  { id: "roomInventoryUpdated", label: "I confirm room inventory was reviewed and updated" },
  { id: "handoffToNextShiftComplete", label: "I confirm night shift handoff was completed and MOD was updated" },
]



