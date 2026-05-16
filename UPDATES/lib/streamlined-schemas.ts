import { z } from "zod"

// Common base schema for all checklists
export const baseChecklistSchema = z.object({
  associateName: z.string().min(1, "Name is required"),
  date: z.string().min(1, "Date is required"),
  shiftStartTime: z.string().optional(),
  shiftEndTime: z.string().optional(),
  managerOnDuty: z.string().optional(),
})

// Step labels for all streamlined checklists (6 steps)
export const STREAMLINED_STEPS = [
  "Snapshot",
  "Priority Review",
  "Critical Tasks",
  "Issues / Exceptions",
  "Handoff / Summary",
  "Final Confirmation",
]

// =====================================================
// AM FRONT DESK CHECKLIST
// =====================================================
export const amStreamlinedSchema = baseChecklistSchema.extend({
  // Step 1: Snapshot
  reviewOvernightHandoff: z.boolean().default(false),
  reviewHouseSnapshot: z.boolean().default(false),
  // Step 2: Priority Review
  reviewDeparturesBalances: z.boolean().default(false),
  reviewPriorityArrivals: z.boolean().default(false),
  reviewRoomInventory: z.boolean().default(false),
  // Step 3: Critical Tasks
  coordinatePriorityRooms: z.boolean().default(false),
  reviewGXPRequests: z.boolean().default(false),
  reviewPaymentProfiles: z.boolean().default(false),
  reviewGroups: z.boolean().default(false),
  confirmNoUnnecessaryAssignments: z.boolean().default(false),
  // Step 4: Issues / Exceptions
  issuesNotes: z.string().optional(),
  // Step 5: Handoff / Summary
  preparePMHandoff: z.boolean().default(false),
  handoffNotes: z.string().optional(),
  // Step 6: Final Confirmation
  confirmAllTasksComplete: z.boolean().default(false),
  confirmHandoffReady: z.boolean().default(false),
})

export type AMStreamlinedFormData = z.infer<typeof amStreamlinedSchema>

// =====================================================
// PM FRONT DESK CHECKLIST
// =====================================================
export const pmStreamlinedSchema = baseChecklistSchema.extend({
  // Step 1: Snapshot
  reviewAMHandoff: z.boolean().default(false),
  reviewRemainingArrivals: z.boolean().default(false),
  // Step 2: Priority Review
  reviewPriorityArrivals: z.boolean().default(false),
  reviewMobileKeyVAL: z.boolean().default(false),
  // Step 3: Critical Tasks
  completeCheckIns: z.boolean().default(false),
  monitorRoomStatus: z.boolean().default(false),
  createUpdateGXP: z.boolean().default(false),
  reviewPaymentFolio: z.boolean().default(false),
  reviewLateArrivals: z.boolean().default(false),
  confirmNoUnnecessaryAssignments: z.boolean().default(false),
  // Step 4: Issues / Exceptions
  issuesNotes: z.string().optional(),
  // Step 5: Handoff / Summary
  prepareNightHandoff: z.boolean().default(false),
  handoffNotes: z.string().optional(),
  // Step 6: Final Confirmation
  confirmAllTasksComplete: z.boolean().default(false),
  confirmHandoffReady: z.boolean().default(false),
})

export type PMStreamlinedFormData = z.infer<typeof pmStreamlinedSchema>

// =====================================================
// NIGHT AUDIT CHECKLIST
// =====================================================
export const nightStreamlinedSchema = baseChecklistSchema.extend({
  // Step 1: Snapshot
  reviewPMHandoff: z.boolean().default(false),
  reviewLateArrivalsNoShow: z.boolean().default(false),
  reviewRoomInventory: z.boolean().default(false),
  // Step 2: Priority Review
  reviewPaymentsFoliosCash: z.boolean().default(false),
  reviewGXPOvernight: z.boolean().default(false),
  // Step 3: Critical Tasks
  completeNoShowProcess: z.boolean().default(false),
  confirmPreAuditReadiness: z.boolean().default(false),
  completeNightAudit: z.boolean().default(false),
  verifyBusinessDateRolled: z.boolean().default(false),
  reviewRequiredReports: z.boolean().default(false),
  // Step 4: Issues / Exceptions
  issuesNotes: z.string().optional(),
  // Step 5: Handoff / Summary
  prepareAMHandoff: z.boolean().default(false),
  handoffNotes: z.string().optional(),
  // Step 6: Final Confirmation
  confirmAllTasksComplete: z.boolean().default(false),
  confirmHandoffReady: z.boolean().default(false),
})

export type NightStreamlinedFormData = z.infer<typeof nightStreamlinedSchema>

// =====================================================
// ADMIN CHECKLIST
// =====================================================
export const adminStreamlinedSchema = baseChecklistSchema.extend({
  // Step 1: Snapshot
  reviewHouseSnapshot: z.boolean().default(false),
  // Step 2: Priority Review
  reviewReservationProfiles: z.boolean().default(false),
  reviewBillingLedgerFolio: z.boolean().default(false),
  // Step 3: Critical Tasks
  reviewGroupSetup: z.boolean().default(false),
  reviewReportsDataAccuracy: z.boolean().default(false),
  reviewGXPMGS: z.boolean().default(false),
  // Step 4: Issues / Exceptions
  issuesNotes: z.string().optional(),
  // Step 5: Handoff / Summary
  prepareAdminSummary: z.boolean().default(false),
  summaryNotes: z.string().optional(),
  // Step 6: Final Confirmation
  confirmAllTasksComplete: z.boolean().default(false),
  confirmSummaryReady: z.boolean().default(false),
})

export type AdminStreamlinedFormData = z.infer<typeof adminStreamlinedSchema>

// =====================================================
// AGM CHECKLIST
// =====================================================
export const agmStreamlinedSchema = baseChecklistSchema.extend({
  // Step 1: Snapshot
  reviewHouseReadiness: z.boolean().default(false),
  // Step 2: Priority Review
  reviewFrontDeskExecution: z.boolean().default(false),
  reviewGuestRecoveryGXP: z.boolean().default(false),
  // Step 3: Critical Tasks
  reviewBillingLedgerExceptions: z.boolean().default(false),
  reviewHousekeepingReadiness: z.boolean().default(false),
  reviewGroupEventInventory: z.boolean().default(false),
  reviewStaffingTraining: z.boolean().default(false),
  // Step 4: Issues / Exceptions
  issuesNotes: z.string().optional(),
  // Step 5: Handoff / Summary
  prepareGMSummary: z.boolean().default(false),
  summaryNotes: z.string().optional(),
  // Step 6: Final Confirmation
  confirmAllTasksComplete: z.boolean().default(false),
  confirmSummaryReady: z.boolean().default(false),
})

export type AGMStreamlinedFormData = z.infer<typeof agmStreamlinedSchema>

// =====================================================
// GM CHECKLIST
// =====================================================
export const gmStreamlinedSchema = baseChecklistSchema.extend({
  // Step 1: Snapshot
  reviewDailySnapshot: z.boolean().default(false),
  reviewInventoryOOO: z.boolean().default(false),
  // Step 2: Priority Review
  reviewVIPsRecoveryGXP: z.boolean().default(false),
  reviewFinancialRisks: z.boolean().default(false),
  // Step 3: Critical Tasks
  reviewGroupEventRevenue: z.boolean().default(false),
  reviewChecklistCompletion: z.boolean().default(false),
  assignOwnersUnresolved: z.boolean().default(false),
  // Step 4: Issues / Exceptions
  issuesNotes: z.string().optional(),
  // Step 5: Handoff / Summary
  prepareLeadershipSummary: z.boolean().default(false),
  summaryNotes: z.string().optional(),
  // Step 6: Final Confirmation
  confirmAllTasksComplete: z.boolean().default(false),
  confirmSummaryReady: z.boolean().default(false),
})

export type GMStreamlinedFormData = z.infer<typeof gmStreamlinedSchema>

// =====================================================
// SALES MANAGER CHECKLIST
// =====================================================
export const salesStreamlinedSchema = baseChecklistSchema.extend({
  // Step 1: Snapshot
  reviewOneSourceLeads: z.boolean().default(false),
  reviewCISFAOpportunities: z.boolean().default(false),
  // Step 2: Priority Review
  reviewGroupsArrivingDepartingInHouse: z.boolean().default(false),
  reviewGroupPickup: z.boolean().default(false),
  // Step 3: Critical Tasks
  validateGroupSetupResLink: z.boolean().default(false),
  reviewResLinkErrors: z.boolean().default(false),
  reviewGroupBillingRouting: z.boolean().default(false),
  reviewGXPGPSVIPGroups: z.boolean().default(false),
  reviewDataQuality: z.boolean().default(false),
  // Step 4: Issues / Exceptions
  issuesNotes: z.string().optional(),
  // Step 5: Handoff / Summary
  prepareOperationsHandoff: z.boolean().default(false),
  handoffNotes: z.string().optional(),
  // Step 6: Final Confirmation
  confirmAllTasksComplete: z.boolean().default(false),
  confirmHandoffReady: z.boolean().default(false),
})

export type SalesStreamlinedFormData = z.infer<typeof salesStreamlinedSchema>

// =====================================================
// HOUSEKEEPING MANAGER / INSPECTOR CHECKLIST
// =====================================================
export const housekeepingStreamlinedSchema = baseChecklistSchema.extend({
  // Step 1: Snapshot
  reviewDeparturesStayoversArrivals: z.boolean().default(false),
  reviewRoomInventory: z.boolean().default(false),
  // Step 2: Priority Review
  reviewGXPHousekeepingRequests: z.boolean().default(false),
  // Step 3: Critical Tasks
  assignBoardsStaff: z.boolean().default(false),
  inspectPriorityRooms: z.boolean().default(false),
  updateRoomStatusAccurately: z.boolean().default(false),
  reportMaintenanceDefects: z.boolean().default(false),
  communicateRoomReadiness: z.boolean().default(false),
  // Step 4: Issues / Exceptions
  issuesNotes: z.string().optional(),
  // Step 5: Handoff / Summary
  prepareHousekeepingHandoff: z.boolean().default(false),
  handoffNotes: z.string().optional(),
  // Step 6: Final Confirmation
  confirmAllTasksComplete: z.boolean().default(false),
  confirmHandoffReady: z.boolean().default(false),
})

export type HousekeepingStreamlinedFormData = z.infer<typeof housekeepingStreamlinedSchema>

// =====================================================
// ENGINEERING CHECKLIST
// =====================================================
export const engineeringStreamlinedSchema = baseChecklistSchema.extend({
  // Step 1: Snapshot
  reviewGXPMaintenanceRequests: z.boolean().default(false),
  reviewOOORooms: z.boolean().default(false),
  // Step 2: Priority Review
  prioritizeGuestImpactingSafety: z.boolean().default(false),
  // Step 3: Critical Tasks
  completeUpdateRepairs: z.boolean().default(false),
  communicateRoomsReadyInspection: z.boolean().default(false),
  escalateUnresolvedIssues: z.boolean().default(false),
  completePublicAreaWalkthrough: z.boolean().default(false),
  // Step 4: Issues / Exceptions
  issuesNotes: z.string().optional(),
  // Step 5: Handoff / Summary
  prepareEngineeringHandoff: z.boolean().default(false),
  handoffNotes: z.string().optional(),
  // Step 6: Final Confirmation
  confirmAllTasksComplete: z.boolean().default(false),
  confirmHandoffReady: z.boolean().default(false),
})

export type EngineeringStreamlinedFormData = z.infer<typeof engineeringStreamlinedSchema>

// Task definitions with labels, instructions, and system badges
export interface TaskDefinition {
  id: string
  label: string
  instruction: string
  expandedInstruction?: string
  systems: Array<"Stay PMS" | "GXP" | "GPS" | "Empower ResApp" | "ResLink" | "CI/SFAWeb" | "OneSource" | "Amadeus CRS" | "MGS/ServiceNow" | "Rooms" | "Ledger" | "Reports">
}

// AM Tasks
export const amTasks: Record<string, TaskDefinition> = {
  reviewOvernightHandoff: {
    id: "reviewOvernightHandoff",
    label: "Review overnight handoff and audit status",
    instruction: "Review night audit notes, MOD log, and shift handoff > confirm night audit completed > confirm business date rolled correctly > note no-shows, guest issues, room moves, and billing concerns.",
    systems: ["Stay PMS", "Reports"],
  },
  reviewHouseSnapshot: {
    id: "reviewHouseSnapshot",
    label: "Review house snapshot",
    instruction: "Stay PMS > Front Desk/Home page > review Arrivals, Departures, In-House, Vacant Ready, Dirty, Out of Order, occupancy, and sell-out risk.",
    systems: ["Stay PMS", "Rooms"],
  },
  reviewDeparturesBalances: {
    id: "reviewDeparturesBalances",
    label: "Review departures and balances",
    instruction: "Stay PMS > Departures tile > review due-outs, late checkouts, group departures, balances, routing, tax-exempt guests, and folio needs.",
    systems: ["Stay PMS", "Ledger"],
  },
  reviewPriorityArrivals: {
    id: "reviewPriorityArrivals",
    label: "Review priority arrivals",
    instruction: "Stay PMS > Arrivals tile > review VIPs, elite/high-touch guests, early arrivals, accessibility needs, connecting/adjoining rooms, suites, service recovery guests, mobile key requests, and special requests.",
    systems: ["Stay PMS", "GPS"],
  },
  reviewRoomInventory: {
    id: "reviewRoomInventory",
    label: "Review room inventory and readiness",
    instruction: "Stay PMS > Rooms Mgmt/Housekeeping view > filter Vacant Ready, Dirty, Inspected, and Out of Order > then Dashboard > Room Availability > review available/sold room types and oversell risk.",
    systems: ["Stay PMS", "Rooms"],
  },
  coordinatePriorityRooms: {
    id: "coordinatePriorityRooms",
    label: "Coordinate priority rooms with housekeeping",
    instruction: "Share true priority rooms only with housekeeping: VIPs, early arrivals, accessibility rooms, connecting/adjoining rooms, suites, group rooms, service recovery rooms, late checkouts, and room moves.",
    systems: ["Stay PMS", "Rooms"],
  },
  reviewGXPRequests: {
    id: "reviewGXPRequests",
    label: "Review GXP open guest requests",
    instruction: "Open GXP > filter Open/Pending/Needs Follow-Up cases > review guest name, room number, issue, owner, and due time > update or assign owner.",
    systems: ["GXP"],
  },
  reviewPaymentProfiles: {
    id: "reviewPaymentProfiles",
    label: "Review payment and profile concerns",
    instruction: "Stay PMS > open affected reservation > Payment tile and Guest Information section > review payment method, authorization, routing, tax exempt, Bonvoy profile, duplicate profile, and notes.",
    systems: ["Stay PMS", "Ledger", "GPS"],
  },
  reviewGroups: {
    id: "reviewGroups",
    label: "Review groups arriving, departing, and in-house",
    instruction: "Stay PMS > Arrivals/Departures/In-House tiles > filter or scan by group/block name > Dashboard > Group Rooms Control > review pickup, remaining rooms, timing, billing, and room needs.",
    systems: ["Stay PMS"],
  },
  confirmNoUnnecessaryAssignments: {
    id: "confirmNoUnnecessaryAssignments",
    label: "Confirm standard arrivals were not unnecessarily pre-assigned",
    instruction: "Stay PMS > Arrivals tile > review assigned rooms > confirm only VIPs, accessibility, connecting/adjoining, suites, early arrivals, service recovery, or true operational exceptions are assigned.",
    systems: ["Stay PMS", "Rooms"],
  },
  preparePMHandoff: {
    id: "preparePMHandoff",
    label: "Prepare PM handoff",
    instruction: "Document arrivals remaining, priority arrivals, rooms not ready, late checkouts, room moves, billing issues, guest issues, GXP items, groups, OOO rooms, and inventory risks.",
    systems: ["Stay PMS", "GXP"],
  },
}

// PM Tasks
export const pmTasks: Record<string, TaskDefinition> = {
  reviewAMHandoff: {
    id: "reviewAMHandoff",
    label: "Review AM handoff",
    instruction: "Read AM handoff > identify arrivals remaining, priority arrivals, rooms not ready, billing issues, guest issues, GXP cases, group notes, OOO rooms, and inventory risks.",
    systems: ["Stay PMS", "GXP"],
  },
  reviewRemainingArrivals: {
    id: "reviewRemainingArrivals",
    label: "Review remaining arrivals and room readiness",
    instruction: "Stay PMS > Arrivals tile > filter/review not checked-in arrivals > Rooms Mgmt/Housekeeping view > check Vacant Ready, Dirty, Inspected, and OOO rooms.",
    systems: ["Stay PMS", "Rooms"],
  },
  reviewPriorityArrivals: {
    id: "reviewPriorityArrivals",
    label: "Review priority arrivals",
    instruction: "Stay PMS > Arrivals tile > review VIPs, elite/high-touch guests, early arrivals waiting, accessibility needs, connecting/adjoining rooms, suites, service recovery guests, mobile key requests, and group arrivals.",
    systems: ["Stay PMS", "GPS"],
  },
  reviewMobileKeyVAL: {
    id: "reviewMobileKeyVAL",
    label: "Review mobile key / VAL requests",
    instruction: "Stay PMS > open reservation > look for VAL badge > complete validation selections > Save & Issue Digital Key > avoid creating new physical key if it will revoke mobile key unless required.",
    systems: ["Stay PMS"],
  },
  completeCheckIns: {
    id: "completeCheckIns",
    label: "Complete check-ins correctly",
    instruction: "Open reservation > verify guest ID > confirm dates, room type, rate/package, payment method, authorization, routing, tax-exempt setup, special requests, and key needs before completing check-in.",
    systems: ["Stay PMS", "Ledger"],
  },
  monitorRoomStatus: {
    id: "monitorRoomStatus",
    label: "Monitor room status with housekeeping",
    instruction: "Stay PMS > Rooms Mgmt/Housekeeping view > filter Dirty/Vacant Ready/Inspected > compare to arrivals waiting > communicate priority rooms and delays to housekeeping and MOD.",
    systems: ["Stay PMS", "Rooms"],
  },
  createUpdateGXP: {
    id: "createUpdateGXP",
    label: "Create or update GXP cases for guest issues",
    instruction: "Open GXP > search guest by name/room > create or update case > enter issue, action taken, owner, due time, and status > include unresolved items in handoff.",
    systems: ["GXP"],
  },
  reviewPaymentFolio: {
    id: "reviewPaymentFolio",
    label: "Review payment and folio issues",
    instruction: "Stay PMS > open reservation > Payment tile > review payment method, authorization, balance, routing, direct bill, tax-exempt, cash issues, and folio corrections.",
    systems: ["Stay PMS", "Ledger"],
  },
  reviewLateArrivals: {
    id: "reviewLateArrivals",
    label: "Review late arrivals",
    instruction: "Stay PMS > Arrivals tile > filter/review not checked-in arrivals > identify guaranteed late arrivals, VIPs, mobile key arrivals, group arrivals, and payment issues.",
    systems: ["Stay PMS"],
  },
  confirmNoUnnecessaryAssignments: {
    id: "confirmNoUnnecessaryAssignments",
    label: "Confirm standard arrivals were not unnecessarily pre-assigned",
    instruction: "Stay PMS > Arrivals tile > review assigned rooms > release unnecessary standard assignments if they block flexibility and property process allows.",
    systems: ["Stay PMS", "Rooms"],
  },
  prepareNightHandoff: {
    id: "prepareNightHandoff",
    label: "Prepare night audit handoff",
    instruction: "Document arrivals remaining, guaranteed late arrivals, rooms not ready, payment issues, guest issues, GXP cases, groups, OOO rooms, maintenance issues, and inventory risks.",
    systems: ["Stay PMS", "GXP"],
  },
}

// Night Tasks
export const nightTasks: Record<string, TaskDefinition> = {
  reviewPMHandoff: {
    id: "reviewPMHandoff",
    label: "Review PM handoff",
    instruction: "Read PM handoff > identify late arrivals, VIPs, guaranteed arrivals, rooms not ready, payment issues, guest issues, GXP cases, group notes, OOO rooms, and inventory risks.",
    systems: ["Stay PMS", "GXP"],
  },
  reviewLateArrivalsNoShow: {
    id: "reviewLateArrivalsNoShow",
    label: "Review late arrivals and no-show risks",
    instruction: "Stay PMS > Arrivals tile > filter/review not checked-in arrivals > review guarantee status, payment, notes, VIP/group status, and expected arrival details.",
    systems: ["Stay PMS"],
  },
  reviewRoomInventory: {
    id: "reviewRoomInventory",
    label: "Review room inventory and assigned rooms",
    instruction: "Stay PMS > Rooms Mgmt/Housekeeping view and Arrivals tile > review Vacant Ready, Dirty, OOO, assigned-not-arrived reservations, and priority room holds.",
    systems: ["Stay PMS", "Rooms"],
  },
  reviewPaymentsFoliosCash: {
    id: "reviewPaymentsFoliosCash",
    label: "Review payments, folios, cash, and balances",
    instruction: "Stay PMS > In-House/Departures tiles and Dashboard > Ledgers > City Ledger > Reservations > review balances, payments, routing, cash activity, folio issues, and unresolved items.",
    systems: ["Stay PMS", "Ledger"],
  },
  reviewGXPOvernight: {
    id: "reviewGXPOvernight",
    label: "Review GXP overnight requests and guest issues",
    instruction: "Open GXP > filter Open/Pending/Overdue cases > review overnight guest requests, complaints, wake-up calls if applicable, room issues, owner, and due time.",
    systems: ["GXP"],
  },
  completeNoShowProcess: {
    id: "completeNoShowProcess",
    label: "Complete no-show process according to property policy",
    instruction: "Stay PMS > Arrivals tile > review remaining arrivals carefully > verify guarantee/payment/VIP/group notes > follow property no-show process > document exceptions.",
    systems: ["Stay PMS"],
  },
  confirmPreAuditReadiness: {
    id: "confirmPreAuditReadiness",
    label: "Confirm pre-audit readiness",
    instruction: "Confirm possible check-ins/checkouts are handled > unresolved balances are documented > cash/payment activity is balanced > room status concerns are documented > MOD aware of major issues.",
    systems: ["Stay PMS", "Ledger"],
  },
  completeNightAudit: {
    id: "completeNightAudit",
    label: "Complete night audit",
    instruction: "Follow property-approved Stay PMS night audit workflow > complete required steps > do not skip unresolved exceptions without documentation.",
    systems: ["Stay PMS"],
  },
  verifyBusinessDateRolled: {
    id: "verifyBusinessDateRolled",
    label: "Verify business date rolled correctly",
    instruction: "After audit > Stay PMS Home/Dashboard > confirm business date changed to new operational day > confirm reports and dashboard reflect correct date.",
    systems: ["Stay PMS"],
  },
  reviewRequiredReports: {
    id: "reviewRequiredReports",
    label: "Review required reports",
    instruction: "Stay PMS > Reports or Generated Reports > review Arrivals, Departures, In-House, Out of Order, No-Show/Cancellation, Shift Report, Trial Balance, Detailed Flash, or property-required reports.",
    systems: ["Stay PMS", "Reports"],
  },
  prepareAMHandoff: {
    id: "prepareAMHandoff",
    label: "Prepare AM handoff",
    instruction: "Document audit status, business date, arrivals, departures, VIPs, early arrivals, payment/folio issues, guest issues, GXP cases, no-show exceptions, groups, OOO rooms, and inventory risks.",
    systems: ["Stay PMS", "GXP"],
  },
}

// Admin Tasks
export const adminTasks: Record<string, TaskDefinition> = {
  reviewHouseSnapshot: {
    id: "reviewHouseSnapshot",
    label: "Review house snapshot",
    instruction: "Stay PMS > Front Desk/Home page and Dashboard > review arrivals, departures, in-house, occupancy, room inventory, OOO rooms, and sell-out risk.",
    systems: ["Stay PMS", "Rooms"],
  },
  reviewReservationProfiles: {
    id: "reviewReservationProfiles",
    label: "Review reservation and profile cleanup",
    instruction: "Stay PMS > Arrivals tile > open reservations with concerns > review Guest Information, Bonvoy profile, duplicate profiles, special requests, VIPs, and notes.",
    systems: ["Stay PMS", "GPS"],
  },
  reviewBillingLedgerFolio: {
    id: "reviewBillingLedgerFolio",
    label: "Review billing, ledger, and folio exceptions",
    instruction: "Stay PMS > Payment tile on affected reservations and Dashboard > Ledgers > City Ledger > Reservations > review balances, routing, direct bill, tax-exempt, and folio corrections.",
    systems: ["Stay PMS", "Ledger"],
  },
  reviewGroupSetup: {
    id: "reviewGroupSetup",
    label: "Review group setup, pickup, and billing notes",
    instruction: "Stay PMS > Groups or Dashboard > Group Rooms Control > review group pickup, remaining rooms, group code, billing/routing notes, and arrival/departure activity.",
    systems: ["Stay PMS"],
  },
  reviewReportsDataAccuracy: {
    id: "reviewReportsDataAccuracy",
    label: "Review reports and data accuracy",
    instruction: "Stay PMS > Reports or Generated Reports > review required operational reports, duplicate reservations, no-show/cancellation activity, OOO rooms, shift report, and exceptions.",
    systems: ["Stay PMS", "Reports"],
  },
  reviewGXPMGS: {
    id: "reviewGXPMGS",
    label: "Review open GXP cases and MGS/ServiceNow tickets",
    instruction: "Open GXP > filter open/pending cases > review owner and due time > open MGS/ServiceNow > review open system/device tickets, ticket numbers, workaround, and status.",
    systems: ["GXP", "MGS/ServiceNow"],
  },
  prepareAdminSummary: {
    id: "prepareAdminSummary",
    label: "Prepare admin summary",
    instruction: "Summarize occupancy, arrivals, departures, inventory risks, VIPs, billing issues, group issues, guest issues, GXP cases, OOO/maintenance, reports reviewed, and follow-up needed.",
    systems: ["Stay PMS", "GXP"],
  },
}

// AGM Tasks
export const agmTasks: Record<string, TaskDefinition> = {
  reviewHouseReadiness: {
    id: "reviewHouseReadiness",
    label: "Review house readiness",
    instruction: "Stay PMS > Front Desk/Home page/Dashboard > review occupancy, arrivals, departures, in-house, room inventory, OOO rooms, sell-out risk, and business date.",
    systems: ["Stay PMS", "Rooms"],
  },
  reviewFrontDeskExecution: {
    id: "reviewFrontDeskExecution",
    label: "Review front desk execution and check-in plan",
    instruction: "Review arrivals remaining, priority arrivals, room readiness, payment concerns, staffing, and whether standard rooms are not being unnecessarily pre-assigned.",
    systems: ["Stay PMS"],
  },
  reviewGuestRecoveryGXP: {
    id: "reviewGuestRecoveryGXP",
    label: "Review guest recovery and GXP cases",
    instruction: "Open GXP > filter complaints/service recovery/open/overdue cases > review guest impact, owner, action taken, next step, and leadership follow-up needed.",
    systems: ["GXP"],
  },
  reviewBillingLedgerExceptions: {
    id: "reviewBillingLedgerExceptions",
    label: "Review billing and ledger exceptions",
    instruction: "Stay PMS > In-House/Departures tiles and Dashboard > Ledgers > City Ledger > Reservations > review balances, direct bill, routing, tax-exempt, cash/payment, and folio corrections.",
    systems: ["Stay PMS", "Ledger"],
  },
  reviewHousekeepingReadiness: {
    id: "reviewHousekeepingReadiness",
    label: "Review housekeeping and room readiness risks",
    instruction: "Stay PMS > Rooms Mgmt/Housekeeping view > review Dirty, Vacant Ready, Inspected, OOO, priority rooms, late checkouts, room moves, and rooms affecting arrivals.",
    systems: ["Stay PMS", "Rooms"],
  },
  reviewGroupEventInventory: {
    id: "reviewGroupEventInventory",
    label: "Review group, event, and inventory risks",
    instruction: "Stay PMS > Group Rooms Control and Function Room Calendar > review group pickup, remaining rooms, event timing, billing notes, arrival/departure activity, and inventory risk.",
    systems: ["Stay PMS"],
  },
  reviewStaffingTraining: {
    id: "reviewStaffingTraining",
    label: "Review staffing or training concerns",
    instruction: "Review schedule, checklist completion, guest issues, missed tasks, room assignment discipline, billing errors, and communication gaps > document coaching needed.",
    systems: [],
  },
  prepareGMSummary: {
    id: "prepareGMSummary",
    label: "Prepare GM follow-up summary",
    instruction: "Summarize occupancy, arrivals, departures, inventory risk, VIP/service recovery, guest issues, billing issues, groups/events, housekeeping/maintenance, staffing, training, and GM follow-up needed.",
    systems: ["Stay PMS", "GXP"],
  },
}

// GM Tasks
export const gmTasks: Record<string, TaskDefinition> = {
  reviewDailySnapshot: {
    id: "reviewDailySnapshot",
    label: "Review daily business snapshot",
    instruction: "Stay PMS > Front Desk/Home page/Dashboard > review occupancy, expected occupancy, arrivals, departures, in-house count, business date, and major alerts.",
    systems: ["Stay PMS"],
  },
  reviewInventoryOOO: {
    id: "reviewInventoryOOO",
    label: "Review inventory and out-of-order risk",
    instruction: "Stay PMS > Dashboard > Room Availability and Rooms Mgmt > review available/sold room types, OOO rooms, room shortages, oversell risk, and leadership action plan.",
    systems: ["Stay PMS", "Rooms"],
  },
  reviewVIPsRecoveryGXP: {
    id: "reviewVIPsRecoveryGXP",
    label: "Review VIPs, guest recovery, and GXP escalations",
    instruction: "Stay PMS > Arrivals tile and GXP > review VIPs, high-touch guests, complaints, service recovery, overdue cases, owner, and next action.",
    systems: ["Stay PMS", "GXP", "GPS"],
  },
  reviewFinancialRisks: {
    id: "reviewFinancialRisks",
    label: "Review financial risks and open balances",
    instruction: "Stay PMS > Dashboard > Ledgers > City Ledger > Reservations and Payment tile on affected reservations > review open balances, direct bill, routing, tax-exempt, and payment risks.",
    systems: ["Stay PMS", "Ledger"],
  },
  reviewGroupEventRevenue: {
    id: "reviewGroupEventRevenue",
    label: "Review group, event, and revenue risks",
    instruction: "Stay PMS > Group Rooms Control and Function Room Calendar > review group pickup, remaining rooms, group billing, event needs, inventory impact, and revenue/customer risk.",
    systems: ["Stay PMS"],
  },
  reviewChecklistCompletion: {
    id: "reviewChecklistCompletion",
    label: "Review checklist completion and accountability",
    instruction: "Open checklist app submissions > review AM, PM, Night Audit, Admin, AGM, Sales, Housekeeping, and Engineering submissions > identify incomplete tasks, repeated misses, and training gaps.",
    systems: ["Reports"],
  },
  assignOwnersUnresolved: {
    id: "assignOwnersUnresolved",
    label: "Assign owners for unresolved issues",
    instruction: "Review all unresolved guest, financial, inventory, maintenance, staffing, group, system, and GXP issues > assign owner, next action, and deadline.",
    systems: ["GXP", "MGS/ServiceNow"],
  },
  prepareLeadershipSummary: {
    id: "prepareLeadershipSummary",
    label: "Prepare daily leadership summary",
    instruction: "Summarize occupancy, expected occupancy, arrivals, departures, guest recovery, inventory risk, OOO/maintenance, financial concerns, groups/events, staffing, coaching, owners assigned, and tomorrow's risks.",
    systems: ["Stay PMS", "GXP"],
  },
}

// Sales Tasks
export const salesTasks: Record<string, TaskDefinition> = {
  reviewOneSourceLeads: {
    id: "reviewOneSourceLeads",
    label: "Review OneSource leads and urgent opportunities",
    instruction: "Open OneSource > review new/assigned leads > sort by arrival date or received date > prioritize emergency, pop-up, and groups arriving within 7 days.",
    systems: ["OneSource"],
  },
  reviewCISFAOpportunities: {
    id: "reviewCISFAOpportunities",
    label: "Review CI/SFAWeb opportunities and follow-ups",
    instruction: "Open CI/SFAWeb > review assigned opportunities/quotes/tasks > check response status, customer follow-ups, proposals, contracts, business type, group type, and required fields.",
    systems: ["CI/SFAWeb"],
  },
  reviewGroupsArrivingDepartingInHouse: {
    id: "reviewGroupsArrivingDepartingInHouse",
    label: "Review groups arriving, departing, and in-house",
    instruction: "Stay PMS > Arrivals/Departures/In-House tiles > filter or scan by group/block name > review timing, room needs, group notes, and billing expectations.",
    systems: ["Stay PMS"],
  },
  reviewGroupPickup: {
    id: "reviewGroupPickup",
    label: "Review group pickup and remaining rooms",
    instruction: "Stay PMS > Dashboard > Group Rooms Control > enter start/end date and days to display > review picked-up rooms, remaining rooms, and risk dates.",
    systems: ["Stay PMS"],
  },
  validateGroupSetupResLink: {
    id: "validateGroupSetupResLink",
    label: "Validate group setup and CRS interface when ResLink is needed",
    instruction: "Stay PMS > open group booking > Details > Confirmation Numbers > confirm Third Party Source is ACRS and Confirmation number exists > verify correct Stay PMS group code.",
    systems: ["Stay PMS", "ResLink", "Amadeus CRS"],
  },
  reviewResLinkErrors: {
    id: "reviewResLinkErrors",
    label: "Review ResLink needs or errors",
    instruction: "Open ResLink > use Stay PMS autogenerated group code > if error occurs, compare group code and ACRS confirmation > document screenshots and escalate through MGS/ServiceNow if unresolved.",
    systems: ["ResLink", "MGS/ServiceNow"],
  },
  reviewGroupBillingRouting: {
    id: "reviewGroupBillingRouting",
    label: "Review group billing, routing, commission, and event notes",
    instruction: "Stay PMS > group booking/group guest reservations > review Payment tile, routing, folio, master billing, direct bill, tax-exempt, commission flag/Group Intermediary ID, and event notes.",
    systems: ["Stay PMS", "Ledger"],
  },
  reviewGXPGPSVIPGroups: {
    id: "reviewGXPGPSVIPGroups",
    label: "Review GXP/GPS items for VIPs, groups, amenities, and service recovery",
    instruction: "Open GXP > review group/VIP requests, amenities, complaints, service recovery > open GPS for VIP/high-touch guests > review useful preferences and recognition notes.",
    systems: ["GXP", "GPS"],
  },
  reviewDataQuality: {
    id: "reviewDataQuality",
    label: "Review data quality items",
    instruction: "CI/SFAWeb > review required fields and CI46/Data Quality items if applicable > correct missing response status, business type, group type, or assigned error details.",
    systems: ["CI/SFAWeb"],
  },
  prepareOperationsHandoff: {
    id: "prepareOperationsHandoff",
    label: "Prepare operations handoff",
    instruction: "Send Front Desk, Housekeeping, AGM, and GM group arrivals/departures, billing/routing, ResLink issues, VIPs, rooming needs, function/event notes, GXP/GPS follow-up, and system tickets.",
    systems: ["Stay PMS", "GXP"],
  },
}

// Housekeeping Tasks
export const housekeepingTasks: Record<string, TaskDefinition> = {
  reviewDeparturesStayoversArrivals: {
    id: "reviewDeparturesStayoversArrivals",
    label: "Review departures, stayovers, arrivals, and priority rooms",
    instruction: "Stay PMS > Departures, In-House, and Arrivals tiles > review due-outs, stayovers, VIPs, early arrivals, accessibility rooms, connecting/adjoining rooms, suites, groups, and service recovery rooms.",
    systems: ["Stay PMS", "Rooms"],
  },
  reviewRoomInventory: {
    id: "reviewRoomInventory",
    label: "Review room inventory",
    instruction: "Stay PMS > Rooms Mgmt/Housekeeping view > filter Vacant Ready, Dirty, Inspected, and Out of Order > identify rooms affecting arrivals and priority needs.",
    systems: ["Stay PMS", "Rooms"],
  },
  reviewGXPHousekeepingRequests: {
    id: "reviewGXPHousekeepingRequests",
    label: "Review open GXP housekeeping requests",
    instruction: "Open GXP > filter open/pending Housekeeping or Rooms cases > review guest name, room number, issue, owner, due time, and overdue items.",
    systems: ["GXP"],
  },
  assignBoardsStaff: {
    id: "assignBoardsStaff",
    label: "Assign boards and staff",
    instruction: "Stay PMS > Rooms Mgmt > Housekeeping > Staff/Assign/Boards area > select staff working > assign rooms manually or auto-assign by property process > save > print/share boards.",
    systems: ["Stay PMS", "Rooms"],
  },
  inspectPriorityRooms: {
    id: "inspectPriorityRooms",
    label: "Inspect priority rooms before release",
    instruction: "Inspect VIP, early arrival, accessibility, connecting/adjoining, suite, and service recovery rooms > check cleanliness, supplies, bathroom, bedding, odor, temperature, maintenance, and presentation.",
    systems: ["Rooms"],
  },
  updateRoomStatusAccurately: {
    id: "updateRoomStatusAccurately",
    label: "Update room status accurately",
    instruction: "Stay PMS > Rooms Mgmt/Housekeeping view > locate room number > update to Vacant Ready/Inspected only after inspection is complete and room is guest-ready.",
    systems: ["Stay PMS", "Rooms"],
  },
  reportMaintenanceDefects: {
    id: "reportMaintenanceDefects",
    label: "Report maintenance defects",
    instruction: "Open GXP or follow property maintenance process > create/update case with room number, issue, urgency, photo if available, and whether room can be sold > notify Engineering/MOD if urgent.",
    systems: ["GXP"],
  },
  communicateRoomReadiness: {
    id: "communicateRoomReadiness",
    label: "Communicate room readiness to Front Desk",
    instruction: "Share newly ready rooms, delayed rooms, rooms still dirty, priority room status, OOO rooms, and any room type shortages with Front Desk/MOD.",
    systems: ["Stay PMS", "Rooms"],
  },
  prepareHousekeepingHandoff: {
    id: "prepareHousekeepingHandoff",
    label: "Prepare housekeeping handoff",
    instruction: "Document rooms ready, priority rooms completed, rooms still dirty, rooms needing inspection, OOO rooms, maintenance issues, GXP open cases, guest complaints, staffing concerns, and MOD follow-up.",
    systems: ["Stay PMS", "GXP"],
  },
}

// Engineering Tasks
export const engineeringTasks: Record<string, TaskDefinition> = {
  reviewGXPMaintenanceRequests: {
    id: "reviewGXPMaintenanceRequests",
    label: "Review open GXP maintenance requests",
    instruction: "Open GXP > filter open/pending Engineering or Maintenance cases > review room/area, issue, priority, guest impact, owner, and due time.",
    systems: ["GXP"],
  },
  reviewOOORooms: {
    id: "reviewOOORooms",
    label: "Review out-of-order rooms",
    instruction: "Stay PMS > Rooms Mgmt or Dashboard room status > filter Out of Order > review room numbers, reasons, expected return, and rooms affecting inventory.",
    systems: ["Stay PMS", "Rooms"],
  },
  prioritizeGuestImpactingSafety: {
    id: "prioritizeGuestImpactingSafety",
    label: "Prioritize guest-impacting, safety, and arrival-blocking issues",
    instruction: "Review GXP, MOD handoff, Front Desk, Housekeeping, and Arrivals needs > prioritize occupied rooms, safety issues, VIP/arrival rooms, OOO rooms, HVAC/plumbing/lock issues.",
    systems: ["GXP", "Stay PMS"],
  },
  completeUpdateRepairs: {
    id: "completeUpdateRepairs",
    label: "Complete and update repairs",
    instruction: "Complete repair > test issue > open GXP/work order > update notes, parts used if applicable, status, owner, and completion time > close only when fully resolved.",
    systems: ["GXP"],
  },
  communicateRoomsReadyInspection: {
    id: "communicateRoomsReadyInspection",
    label: "Communicate rooms ready for inspection",
    instruction: "After vacant-room repair is complete > notify Housekeeping Manager/Inspector > confirm room needs inspection before Front Desk sells it.",
    systems: ["Stay PMS", "Rooms"],
  },
  escalateUnresolvedIssues: {
    id: "escalateUnresolvedIssues",
    label: "Escalate unresolved room/system/device issues",
    instruction: "If issue cannot be resolved > notify MOD/Chief Engineer > open MGS/ServiceNow if system/device issue > include property code, device/system, location, screenshots, error, impact, and steps attempted.",
    systems: ["MGS/ServiceNow"],
  },
  completePublicAreaWalkthrough: {
    id: "completePublicAreaWalkthrough",
    label: "Complete public area and safety walkthrough",
    instruction: "Walk lobby, entrance, restrooms, elevators, hallways, meeting space, pool/fitness if applicable > identify safety, lighting, temperature, odor, access, equipment, or repair issues.",
    systems: [],
  },
  prepareEngineeringHandoff: {
    id: "prepareEngineeringHandoff",
    label: "Prepare engineering handoff",
    instruction: "Document open GXP cases, guest-impacting issues, OOO rooms, rooms returned to service, rooms awaiting inspection, safety issues, parts/vendor needs, system/device tickets, and MOD/GM follow-up.",
    systems: ["GXP", "MGS/ServiceNow"],
  },
}



