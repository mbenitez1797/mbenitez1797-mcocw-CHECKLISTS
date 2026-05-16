import { z } from "zod"

// Step labels for the Sales Manager checklist
export const SALES_STEP_LABELS = [
  "Shift Info",
  "Sales Review",
  "Group Booking",
  "ResLink",
  "Events",
  "Billing",
  "Data Quality",
  "Guest Experience",
  "System Issues",
  "Handoff",
  "Final"
]

// Part 1: Start of Day Sales Review
export const startOfDaySalesReviewOptions = [
  { id: "reviewed_new_leads", label: "Reviewed new leads in OneSource" },
  { id: "reviewed_leads_7_days", label: "Reviewed leads arriving within the next 7 days" },
  { id: "reviewed_emergency_leads", label: "Reviewed emergency response or pop-up group leads" },
  { id: "reviewed_opportunities", label: "Reviewed assigned opportunities in CI/SFAWeb" },
  { id: "reviewed_overdue_followups", label: "Reviewed overdue sales follow-ups" },
  { id: "reviewed_response_status", label: "Reviewed response status on active quotes" },
  { id: "reviewed_group_arrivals", label: "Reviewed today's group arrivals in Stay PMS" },
  { id: "reviewed_group_departures", label: "Reviewed today's group departures in Stay PMS" },
  { id: "reviewed_inhouse_groups", label: "Reviewed in-house groups in Stay PMS" },
  { id: "reviewed_group_pickup", label: "Reviewed group pickup and remaining rooms in Stay PMS" },
  { id: "identified_priorities", label: "Identified top sales priorities for today" },
]

// Part 2: Group Booking and Block Management
export const groupBookingManagementOptions = [
  { id: "confirmed_new_group_bookings", label: "Confirmed new group bookings are entered in the correct system" },
  { id: "reviewed_group_status", label: "Reviewed group booking status" },
  { id: "confirmed_reservation_presets", label: "Confirmed group has required Reservation Presets if built in Stay PMS" },
  { id: "reviewed_group_code", label: "Reviewed group code for ResLink or operational use" },
  { id: "verified_group_interface", label: "Verified group interfaced to Amadeus CRS when ResLink is needed" },
  { id: "confirmed_acrs_confirmation", label: "Confirmed the ACRS confirmation number was not deleted" },
  { id: "reviewed_interface_failures", label: "Reviewed group setup for common interface failures" },
  { id: "reviewed_room_block_accuracy", label: "Reviewed group room block accuracy" },
  { id: "reviewed_rate_booking_window", label: "Reviewed group rate and booking window concerns" },
  { id: "confirmed_details_match", label: "Confirmed group details match CI/SFAWeb or sales file" },
  { id: "documented_setup_issues", label: "Documented group setup issues for leadership or support" },
]

// Part 3: ResLink and Guest Booking Support
export const resLinkSupportOptions = [
  { id: "reviewed_groups_needing_reslink", label: "Reviewed groups needing ResLink" },
  { id: "validated_group_code", label: "Validated correct Stay PMS group code before creating or troubleshooting ResLink" },
  { id: "confirmed_group_interface_crs", label: "Confirmed group has successfully interfaced to Amadeus CRS before ResLink creation" },
  { id: "reviewed_reslink_errors", label: "Reviewed ResLink errors using Stay PMS group code and CRS confirmation" },
  { id: "escalated_reslink_errors", label: "Escalated unresolved ResLink errors through MGS/ServiceNow" },
  { id: "used_empower_resapp", label: "Used Empower ResApp for future individual reservation needs" },
  { id: "sent_confirmations", label: "Sent or requested reservation confirmations through Empower ResApp when applicable" },
  { id: "confirmed_reslink_payment", label: "Confirmed guests are directed to ResLink when payment must be entered securely" },
]

// Part 4: Function Space and Events
export const functionSpaceEventsOptions = [
  { id: "reviewed_function_activity", label: "Reviewed today's function room or event activity" },
  { id: "reviewed_function_availability", label: "Reviewed upcoming function room availability when needed" },
  { id: "used_status_filter", label: "Used function room status filter correctly" },
  { id: "searched_group_event", label: "Searched for group or event name on Function Room Calendar" },
  { id: "confirmed_event_details", label: "Confirmed event details match CI/SFAWeb or sales file" },
  { id: "reviewed_event_only_groups", label: "Reviewed event-only groups if applicable" },
  { id: "reviewed_service_charge", label: "Reviewed function room service charge setup if applicable" },
  { id: "communicated_event_needs", label: "Communicated event needs to operations" },
]

// Part 5: Group Billing, Routing, Commission
export const groupBillingOptions = [
  { id: "reviewed_billing_instructions", label: "Reviewed group billing instructions" },
  { id: "reviewed_routing_rules", label: "Reviewed group routing rules if applicable" },
  { id: "confirmed_routing_communicated", label: "Confirmed routing expectations were communicated to front desk" },
  { id: "reviewed_direct_bill", label: "Reviewed direct bill or AR expectations for group" },
  { id: "reviewed_tax_exempt", label: "Reviewed tax-exempt expectations for group if applicable" },
  { id: "reviewed_commissionable", label: "Reviewed group commissionable status if applicable" },
  { id: "confirmed_commission_info", label: "Confirmed commission information is added no later than 1 day prior to arrival if applicable" },
  { id: "documented_billing_concerns", label: "Documented unresolved group billing concerns" },
]

// Part 6: Data Quality and Sales Process Discipline
export const dataQualityOptions = [
  { id: "reviewed_required_fields", label: "Reviewed required fields on active opportunities or quotes" },
  { id: "reviewed_response_status_completion", label: "Reviewed Response Status completion" },
  { id: "reviewed_lost_reason", label: "Reviewed lost/turned down/cancelled reason accuracy if applicable" },
  { id: "reviewed_sales_tasks", label: "Reviewed sales tasks due today" },
  { id: "reviewed_open_proposals", label: "Reviewed open proposals or contracts needing follow-up" },
  { id: "reviewed_ci46_issues", label: "Reviewed data quality issues from CI46 or property process if applicable" },
  { id: "corrected_data_errors", label: "Corrected data quality errors assigned to Sales Manager" },
  { id: "documented_data_issues", label: "Documented data quality issues that require leadership or system support" },
]

// Part 7: Guest, VIP, and Group Experience
export const guestExperienceOptions = [
  { id: "reviewed_gxp_requests", label: "Reviewed GXP for group or sales-related guest requests" },
  { id: "reviewed_gxp_vip", label: "Reviewed GXP for VIP or high-touch arrivals related to sales accounts" },
  { id: "updated_gxp_cases", label: "Updated GXP cases owned by Sales Manager" },
  { id: "reviewed_gps_vip", label: "Reviewed GPS for VIP, elite, repeat, or high-touch group contacts" },
  { id: "communicated_vip_preferences", label: "Communicated VIP or group guest preferences to operations" },
  { id: "confirmed_group_amenities", label: "Confirmed group amenities or welcome items are assigned" },
  { id: "reviewed_unresolved_issues", label: "Reviewed unresolved sales-related guest issues before end of day" },
]

// Part 8: System Issues and Escalations
export const systemIssuesOptions = [
  { id: "reviewed_open_issues", label: "Reviewed open system issues affecting sales or groups" },
  { id: "submitted_support_ticket", label: "Submitted support ticket for unresolved system issue" },
  { id: "updated_existing_ticket", label: "Updated existing support ticket with new information" },
  { id: "documented_ticket_handoff", label: "Documented support ticket number in sales handoff" },
  { id: "escalated_urgent_issue", label: "Escalated urgent revenue or arrival-impacting system issue to leadership" },
]

// Part 9: Operations Handoff
export const operationsHandoffOptions = [
  { id: "prepared_front_desk_handoff", label: "Prepared front desk group handoff" },
  { id: "prepared_housekeeping_handoff", label: "Prepared housekeeping group handoff" },
  { id: "prepared_agm_gm_summary", label: "Prepared AGM/GM sales risk summary" },
  { id: "confirmed_billing_communicated", label: "Confirmed group billing notes were communicated before arrival" },
  { id: "confirmed_reslink_communicated", label: "Confirmed ResLink or booking instructions were communicated to customer if applicable" },
  { id: "confirmed_event_communicated", label: "Confirmed event/function details were communicated to operations" },
  { id: "confirmed_owners_assigned", label: "Confirmed unresolved items have owners" },
]

// Final Sales Manager Confirmation
export const salesFinalConfirmationOptions = [
  { id: "confirm_systems_reviewed", label: "I confirm that I reviewed required sales systems and completed this checklist accurately" },
  { id: "confirm_urgent_leads", label: "I confirm that urgent leads and short-term groups were reviewed" },
  { id: "confirm_group_setup", label: "I confirm that group setup, pickup, ResLink, and billing concerns were reviewed" },
  { id: "confirm_gxp_gps", label: "I confirm that GXP/GPS guest or group follow-ups were reviewed" },
  { id: "confirm_system_issues", label: "I confirm that unresolved system issues were submitted or updated in MGS/ServiceNow" },
  { id: "confirm_handoff_complete", label: "I confirm that Front Desk, Housekeeping, AGM, and GM received the necessary sales handoff" },
]

export const salesFormSchema = z.object({
  // Individual questions at top of form
  salesManagerName: z.string().min(1, "Sales Manager name is required"),
  date: z.string().min(1, "Date is required"),
  shiftStartTime: z.string().min(1, "Shift start time is required"),
  shiftEndTime: z.string().min(1, "Shift end time is required"),
  propertyCode: z.string().min(1, "Property/Hotel code is required"),
  managerOnDuty: z.string().min(1, "Manager on duty is required"),
  totalGroupArrivalsToday: z.string().optional(),
  totalGroupDeparturesToday: z.string().optional(),
  totalInHouseGroupsToday: z.string().optional(),
  anyNewLeadsToday: z.enum(["yes", "no"]).optional(),
  anyGroupsWithin7Days: z.enum(["yes", "no"]).optional(),
  anyResLinkNeeded: z.enum(["yes", "no"]).optional(),
  anyBillingConcerns: z.enum(["yes", "no"]).optional(),
  anyFunctionSpaceToday: z.enum(["yes", "no"]).optional(),
  anySystemIssues: z.enum(["yes", "no"]).optional(),
  concernsExplanation: z.string().optional(),

  // Part 1: Start of Day Sales Review
  startOfDaySalesReview: z.array(z.string()).optional(),
  topSalesPriorities: z.string().optional(),

  // Part 2: Group Booking and Block Management
  groupBookingManagement: z.array(z.string()).optional(),
  anyGroupSetupIssues: z.enum(["yes", "no"]).optional(),
  groupSetupIssuesDetails: z.string().optional(),

  // Part 3: ResLink and Guest Booking Support
  resLinkSupport: z.array(z.string()).optional(),
  anyResLinkIssues: z.enum(["yes", "no"]).optional(),
  resLinkIssuesDetails: z.string().optional(),

  // Part 4: Function Space and Events
  functionSpaceEvents: z.array(z.string()).optional(),
  anyFunctionIssues: z.enum(["no_events", "no_issues", "yes"]).optional(),
  functionIssuesDetails: z.string().optional(),

  // Part 5: Group Billing, Routing, Commission
  groupBilling: z.array(z.string()).optional(),
  anyBillingRoutingConcerns: z.enum(["yes", "no"]).optional(),
  billingConcernsDetails: z.string().optional(),

  // Part 6: Data Quality and Sales Process
  dataQuality: z.array(z.string()).optional(),
  anyDataQualityIssues: z.enum(["yes", "no"]).optional(),
  dataQualityIssuesDetails: z.string().optional(),

  // Part 7: Guest, VIP, and Group Experience
  guestExperience: z.array(z.string()).optional(),
  anyGxpGpsFollowup: z.enum(["yes", "no"]).optional(),
  gxpGpsFollowupDetails: z.string().optional(),

  // Part 8: System Issues and Escalations
  systemIssues: z.array(z.string()).optional(),
  anyUnresolvedSystemIssues: z.enum(["yes", "no"]).optional(),
  systemIssuesDetails: z.string().optional(),

  // Part 9: Operations Handoff
  operationsHandoff: z.array(z.string()).optional(),

  // Sales Manager Daily Summary
  salesManagerDailySummary: z.string().optional(),

  // Final Confirmation
  salesFinalConfirmation: z.array(z.string()).optional(),

  // Supporting Systems Summary (same as other forms)
  supportingSystemsSummary: z.object({
    gxpSummary: z.string().optional(),
    gpsSummary: z.string().optional(),
    resAppSummary: z.string().optional(),
    mgsSummary: z.string().optional(),
  }).optional(),
})

export type SalesFormValues = z.infer<typeof salesFormSchema>

export const salesDefaultValues: SalesFormValues = {
  salesManagerName: "",
  date: new Date().toISOString().split("T")[0],
  shiftStartTime: "",
  shiftEndTime: "",
  propertyCode: "",
  managerOnDuty: "",
  totalGroupArrivalsToday: "",
  totalGroupDeparturesToday: "",
  totalInHouseGroupsToday: "",
  anyNewLeadsToday: undefined,
  anyGroupsWithin7Days: undefined,
  anyResLinkNeeded: undefined,
  anyBillingConcerns: undefined,
  anyFunctionSpaceToday: undefined,
  anySystemIssues: undefined,
  concernsExplanation: "",
  startOfDaySalesReview: [],
  topSalesPriorities: "",
  groupBookingManagement: [],
  anyGroupSetupIssues: undefined,
  groupSetupIssuesDetails: "",
  resLinkSupport: [],
  anyResLinkIssues: undefined,
  resLinkIssuesDetails: "",
  functionSpaceEvents: [],
  anyFunctionIssues: undefined,
  functionIssuesDetails: "",
  groupBilling: [],
  anyBillingRoutingConcerns: undefined,
  billingConcernsDetails: "",
  dataQuality: [],
  anyDataQualityIssues: undefined,
  dataQualityIssuesDetails: "",
  guestExperience: [],
  anyGxpGpsFollowup: undefined,
  gxpGpsFollowupDetails: "",
  systemIssues: [],
  anyUnresolvedSystemIssues: undefined,
  systemIssuesDetails: "",
  operationsHandoff: [],
  salesManagerDailySummary: "",
  salesFinalConfirmation: [],
  supportingSystemsSummary: {
    gxpSummary: "",
    gpsSummary: "",
    resAppSummary: "",
    mgsSummary: "",
  },
}



