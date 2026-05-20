// StayNTouch PMS Step-by-Step Instructions for each checklist item
// Instructions extracted from official Stay PMS documentation

export const pmsInstructions: Record<string, string[]> = {
  // ===== BANK COUNT =====
  "bankCountStart": [
    "Count all cash in drawer (bills and coins)",
    "Organize by denomination",
    "Total each denomination and calculate grand total",
    "Compare to expected starting bank amount",
    "Both associates sign bank count form",
    "Report any discrepancy to manager immediately"
  ],
  "bankCountEnd": [
    "Count all cash in drawer at end of shift",
    "Separate starting bank from shift cash transactions",
    "Total shift cash should match PMS cash payments",
    "Count back starting bank amount",
    "Both associates sign bank count form",
    "Report any discrepancy to manager immediately"
  ],

  // ===== AM SECTION 1: OPENING STAY PMS REVIEW =====
  "reviewedTodaysArrivals": [
    "Go to Stay PMS > Front Desk/Home page",
    "Select the Arrivals tile or search filter",
    "Confirm the business date is today",
    "Review the full arrival list"
  ],
  "reviewedTodaysDepartures": [
    "Go to Stay PMS > Front Desk/Home page",
    "Select the Departures tile",
    "Confirm the business date is today",
    "Review all due-outs"
  ],
  "reviewedInHouseGuests": [
    "Go to Stay PMS > Front Desk/Home page",
    "Select the In-House tile",
    "Review current occupied rooms and guest names"
  ],
  "reviewedVacantReadyRooms": [
    "Go to Stay PMS > Dashboard, Rooms Mgmt, or Housekeeping view",
    "Filter for Vacant Ready rooms",
    "Review available rooms by room type"
  ],
  "reviewedDirtyRooms": [
    "Go to Stay PMS > Rooms Mgmt or Housekeeping view",
    "Filter room status to Dirty",
    "Review rooms still needing service"
  ],
  "reviewedOutOfOrderRooms": [
    "Go to Stay PMS > Dashboard or Rooms Mgmt",
    "Filter room status to Out of Order",
    "Confirm room numbers, reason, and return-to-service date if available"
  ],
  "reviewedOccupancyPercentage": [
    "Go to Stay PMS > Dashboard/Home page",
    "Review occupancy or house status summary for today's business date"
  ],
  "reviewedRoomAvailabilityByType": [
    "Go to Stay PMS > Dashboard > Room Availability",
    "Confirm date range",
    "Select Available view",
    "Click GO"
  ],
  "reviewedSoldRoomTypesAM": [
    "Go to Stay PMS > Dashboard > Room Availability",
    "Change view from Available to Sold if needed",
    "Review room types with low or negative availability",
    "Click GO"
  ],

  // ===== AM SECTION 2: OVERNIGHT FOLLOW-UP =====
  "reviewedNightAuditReports": [
    "Review the night audit handoff, audit packet, shift notes, or MOD communication",
    "Confirm the business date rolled correctly before continuing"
  ],
  "reviewedNoShowsOvernight": [
    "Go to Stay PMS > Front Desk/Home page",
    "Search reservations by status No-Show or review the night audit/no-show report",
    "Confirm any remaining action needed"
  ],
  "verifiedOvernightArrivals": [
    "Go to Stay PMS > Front Desk/Home page > Arrivals tile",
    "Filter to arrivals not checked in from the prior business date if applicable",
    "Review remaining late arrivals"
  ],
  "checkedOvernightIncidents": [
    "Check the overnight shift notes, MOD log, guest notes, and any open service recovery items",
    "Identify anything AM shift must follow up on"
  ],
  "reviewedOvernightRoomMoves": [
    "Go to Stay PMS > Reports or reservation search",
    "Review room move tracking if available",
    "Confirm any room moves completed or still pending"
  ],
  "reviewedMaintenanceOvernight": [
    "Check shift notes and room status",
    "Go to Rooms Mgmt or Housekeeping view",
    "Review rooms marked Out of Order or with maintenance notes"
  ],
  "reviewedBillingOvernight": [
    "Go to Stay PMS > Front Desk/Home page",
    "Review affected reservations",
    "Open the Payment tile",
    "Check balances, payment method, authorization, and notes"
  ],
  "reviewedAMFollowUpItems": [
    "Read the overnight handoff completely",
    "Identify unresolved items",
    "Document guest name, room number, issue, and next action"
  ],

  // ===== AM SECTION 3: DEPARTURE REVIEW =====
  "reviewedDepartureList": [
    "Go to Stay PMS > Front Desk/Home page",
    "Select Departures tile",
    "Confirm today's date",
    "Review the full due-out list"
  ],
  "identifiedEarlyDepartures": [
    "In the Departures list, review notes, guest requests, and check-out time indicators",
    "Identify guests expected to leave early"
  ],
  "identifiedLateCheckouts": [
    "Open the Departures list",
    "Review guest notes or departure time fields",
    "Note any approved late checkouts and communicate them to housekeeping"
  ],
  "identifiedGroupDepartures": [
    "Go to Departures list",
    "Filter or sort by group/block name if available",
    "Review group guests due out today"
  ],
  "checkedExpressCheckouts": [
    "Open each departure with a balance concern",
    "Select the Payment tile",
    "Review folio balance, payments, routing, and remaining amount due"
  ],
  "checkedDeparturesBillingIssues": [
    "Open the reservation",
    "Select Payment tile or folio/routing area",
    "Confirm charges are routed correctly before checkout"
  ],
  "checkedDeparturesTaxExempt": [
    "Open the reservation",
    "Expand Estimated Charges",
    "Review Tax Exempt indicator",
    "Confirm tax exempt setup is correct if applicable"
  ],
  "checkedFoliosPrintEmail": [
    "Open the reservation",
    "Select Payment tile",
    "Click print icon to print or email icon to email",
    "Select correct folio",
    "Print or send"
  ],
  "communicatedLateCheckoutsHSK": [
    "After reviewing Departures, send or verbally communicate late checkout room numbers and times to housekeeping leadership"
  ],
  "communicatedGroupDeparturesHSK": [
    "After identifying group departures, share group name, room count, and priority rooms with housekeeping leadership"
  ],
  "communicatedBillingIssuesMOD": [
    "Document guest name, room number, balance issue, and action needed",
    "Notify MOD before the departure rush"
  ],

  // ===== AM SECTION 4: OPEN BALANCE / LEDGER REVIEW =====
  "reviewedInHouseBalances": [
    "Go to Stay PMS > Front Desk/Home page > In-House tile",
    "Open reservations with balance concerns",
    "Select Payment tile",
    "Review folio balances"
  ],
  "reviewedDeparturesWithBalances": [
    "Go to Departures tile",
    "Look for balances due",
    "Open reservation > Payment tile",
    "Confirm balance and action needed"
  ],
  "reviewedCheckedOutOpenBalances": [
    "Go to Dashboard > Ledgers > City Ledger > Reservations",
    "Review checked-out, cancelled, or no-show reservations with outstanding balances"
  ],
  "reviewedCityLedger": [
    "Go to Dashboard > Ledgers > City Ledger > Reservations",
    "Select confirmation number to open folio",
    "Determine whether payment, transfer, adjustment, or credit is needed"
  ],
  "identifiedFoliosNeedingCorrection": [
    "Open the affected reservation",
    "Select Payment tile",
    "Review folio charges, payments, routing, and adjustments",
    "Document corrections needed"
  ],
  "communicatedUnresolvedBalances": [
    "List guest name, confirmation number or room number, amount, and issue",
    "Notify MOD before shift handoff"
  ],

  // ===== AM SECTION 5: HOUSEKEEPING ALIGNMENT =====
  "sharedDepartureCountHSK": [
    "Go to Stay PMS > Front Desk/Home page > Departures tile",
    "Confirm total due-outs",
    "Communicate count to housekeeping"
  ],
  "sharedStayoverCountHSK": [
    "Go to Stay PMS > Front Desk/Home page > In-House tile or Housekeeping view",
    "Identify stayovers",
    "Communicate count to housekeeping"
  ],
  "sharedEarlyArrivalRequestsHSK": [
    "Go to Arrivals tile",
    "Review arrival notes and expected arrival times",
    "List early arrivals that may need priority room cleaning"
  ],
  "sharedVIPRoomsHSK": [
    "Go to Arrivals tile",
    "Review VIP indicators, elite status, notes, or MOD list",
    "Communicate only true VIP priority rooms"
  ],
  "sharedAccessibilityRoomsHSK": [
    "Go to Arrivals tile",
    "Review room type and special request notes",
    "Identify accessible room needs",
    "Communicate room type and urgency to housekeeping"
  ],
  "sharedConnectingRoomsHSK": [
    "Go to Arrivals tile",
    "Review special requests and linked reservations",
    "Identify connecting/adjoining requests",
    "Communicate priority to housekeeping"
  ],
  "sharedSuitesSpecialtyHSK": [
    "Go to Arrivals tile",
    "Filter or sort by room type if possible",
    "Identify suites/specialty rooms",
    "Communicate rooms needed to housekeeping"
  ],
  "sharedGroupArrivalRoomsHSK": [
    "Go to Stay PMS > Dashboard > Group Rooms Control or Arrivals filtered by group",
    "Review group arrivals",
    "Communicate room count and timing"
  ],
  "sharedLateCheckoutRoomsHSK": [
    "Use the Departure review list",
    "Confirm late checkout rooms and approved times",
    "Communicate to housekeeping so rooms are not rushed incorrectly"
  ],
  "sharedRoomMovesHSK": [
    "Review shift notes and in-house reservations",
    "Open affected reservation",
    "Confirm scheduled room move details",
    "Communicate old room, new room need, and timing"
  ],
  "sharedOOORoomsHSK": [
    "Go to Rooms Mgmt or Dashboard room status view",
    "Filter Out of Order",
    "Communicate room numbers and status to housekeeping"
  ],
  "sharedMaintenanceIssuesHSK": [
    "Review OOO rooms, shift notes, and guest issues",
    "Communicate room number, issue, and urgency to housekeeping or engineering"
  ],

  // ===== AM SECTION 6: ARRIVAL REVIEW =====
  "reviewedTotalArrivals": [
    "Go to Stay PMS > Front Desk/Home page > Arrivals tile",
    "Confirm today's date",
    "Review total arrival count"
  ],
  "reviewedEarlyArrivalRequests": [
    "From the Arrivals list, open reservations with early arrival notes or expected arrival time",
    "Review guest requests and room type"
  ],
  "reviewedVIPArrivalsAM": [
    "From the Arrivals list, look for VIP indicators, elite status, MOD notes, or special handling notes",
    "Open reservation to confirm details"
  ],
  "reviewedEliteArrivalsAM": [
    "From the Arrivals list, review Marriott Bonvoy status or guest profile details",
    "Identify Ambassador, Titanium, Platinum, or other priority guests based on property process"
  ],
  "reviewedAccessibilityNeedsAM": [
    "From the Arrivals list, review room type and special request notes",
    "Identify accessible room requirements",
    "Confirm inventory availability"
  ],
  "reviewedConnectingRoomsAM": [
    "Open linked or noted reservations",
    "Review special request notes",
    "Verify whether connecting/adjoining rooms are needed and possible"
  ],
  "reviewedSuiteArrivalsAM": [
    "From the Arrivals list, sort or scan by room type",
    "Identify suites, premium rooms, or specialty inventory"
  ],
  "reviewedServiceRecoveryGuests": [
    "Check MOD notes, guest profile notes, previous shift handoff, or guest comments",
    "Identify any arrival needing special care"
  ],
  "reviewedGroupArrivalsAM": [
    "Go to Arrivals list",
    "Filter by group/block if available, or go to Dashboard > Group Rooms Control",
    "Review group arrivals and pickup"
  ],
  "reviewedMobileKeyRequestsAM": [
    "Search/open arrival reservation",
    "Look for VAL badge near the reservation details",
    "If present, complete required validation before issuing digital key"
  ],
  "reviewedSpecialRequestsAM": [
    "Open arrival reservations with notes/request indicators",
    "Review preferences, amenities, room location requests, and operational needs"
  ],
  "reviewedPaymentRoutingConcerns": [
    "Open arrival reservation",
    "Select Payment tile and routing/folio area",
    "Confirm payment method, direct bill, routing, or tax-exempt setup"
  ],

  // ===== AM SECTION 7: ROOM ASSIGNMENT STRATEGY =====
  "standardArrivalsLeftUnassigned": [
    "Review Arrivals list",
    "Do not assign room numbers to standard arrivals unless there is a true operational reason",
    "Leave them unassigned for arrival-time flexibility"
  ],
  "roomsNotHeldUnnecessarilyAM": [
    "Review assigned arrivals",
    "Confirm every assigned room has a valid reason such as VIP, accessible room, connecting room, suite, early arrival, or service recovery"
  ],
  "vipsPreAssignedIfNeeded": [
    "Open VIP arrival reservation",
    "Confirm room type and notes",
    "Assign only if protecting the room improves guest experience or prevents inventory risk"
  ],
  "accessibilityPreAssignedIfNeeded": [
    "Open reservation with accessibility need",
    "Confirm accessible room type",
    "Assign appropriate accessible room if available and operationally required"
  ],
  "connectingPreAssignedIfNeeded": [
    "Open linked reservations",
    "Review request",
    "Use room availability/tape chart if needed",
    "Assign only when needed to protect the request"
  ],
  "suitesPreAssignedIfNeeded": [
    "Open suite/specialty arrival",
    "Review inventory and guest priority",
    "Assign only if needed to protect limited inventory"
  ],
  "earlyArrivalsPreAssignedIfSupported": [
    "Open early arrival reservation",
    "Check room status and availability",
    "Assign only if room is ready or likely to be ready and does not block better inventory use"
  ],
  "serviceRecoveryRoomsProtected": [
    "Review MOD notes or guest issue notes",
    "Identify recovery guest",
    "Assign or protect the best available room only if needed"
  ],

  // ===== AM SECTION 8: PAYMENT, BILLING, AND PROFILE READINESS =====
  "verifiedCCAuthorizations": [
    "Open each arrival with concern",
    "Select Payment tile",
    "Confirm payment method exists and is appropriate for check-in"
  ],
  "identifiedPaymentFollowUp": [
    "From Arrivals list, open reservations missing payment or with payment notes",
    "Document guest name and issue for PM shift"
  ],
  "identifiedDirectBillReservations": [
    "Open arrival reservation",
    "Review Payment tile, folio, routing, or billing notes",
    "Confirm direct bill setup if applicable"
  ],
  "identifiedRoutedBillingReservations": [
    "Open arrival reservation",
    "Review routing/folio details",
    "Confirm charges are routed correctly before check-in"
  ],
  "identifiedTaxExemptReservations": [
    "Open reservation",
    "Expand Estimated Charges",
    "Review Tax Exempt indicator",
    "Confirm tax-exempt setup and documentation if applicable"
  ],
  "processedAdvanceDeposits": [
    "Open reservation",
    "Go to Payment tile",
    "Review payments, deposits, advance deposits, and balance due",
    "Document any issue"
  ],
  "communicatedPaymentIssuesAM": [
    "List guest name, confirmation or room number, payment issue, and required action",
    "Communicate before PM arrival rush"
  ],
  "checkedVIPEliteProfiles": [
    "Open reservation",
    "Review Guest Information and profile details",
    "Confirm Bonvoy profile, name, status, and notes look correct"
  ],
  "checkedMissingBonvoyProfile": [
    "Open reservation",
    "Go to Guest Information section",
    "If needed, select Associate to a Different Profile",
    "Use Loyalty Profile Lookup"
  ],
  "checkedDuplicateProfiles": [
    "Open reservation",
    "Review Guest Information and profile name/details",
    "Compare with ID or Bonvoy details if available",
    "Escalate if incorrect"
  ],
  "updatedGuestNotesAM": [
    "Open reservation",
    "Locate notes/comments section",
    "Add clear operational note only when needed",
    "Save changes"
  ],
  "escalatedProfileIssues": [
    "Document guest name, confirmation number, issue, and attempted steps",
    "Notify MOD or leadership"
  ],

  // ===== AM SECTION 9: GROUPS AND EVENTS REVIEW =====
  "reviewedGroupArrivalDetails": [
    "Go to Arrivals tile",
    "Filter or scan for group/block name, or go to Dashboard > Group Rooms Control",
    "Review groups arriving today"
  ],
  "checkedGroupDepartures": [
    "Go to Departures tile",
    "Filter or scan for group/block name",
    "Review group guests due out today"
  ],
  "checkedInHouseGroups": [
    "Go to In-House tile",
    "Filter or scan by group/block name",
    "Review current in-house group rooms"
  ],
  "reviewedGroupRoomPickup": [
    "Go to Dashboard > Group Rooms Control",
    "Enter start/end date and number of days to display",
    "Review picked-up rooms"
  ],
  "reviewedRemainingGroupRooms": [
    "Go to Dashboard > Group Rooms Control",
    "Review remaining rooms by date",
    "Identify unused or risk areas"
  ],
  "reviewedGroupBillingNotes": [
    "Open group reservation or guest reservation",
    "Review Payment tile, folio, routing, and group notes",
    "Confirm billing expectations"
  ],
  "reviewedGroupSpecialRequests": [
    "Open group or group guest reservations",
    "Review notes, rooming requests, arrival timing, and special handling needs"
  ],
  "reviewedGroupArrivalTime": [
    "Check group notes, event notes, sales communication, or MOD handoff",
    "Document arrival timing for PM shift"
  ],
  "coordinatedGroupNeeds": [
    "Share group name, arrival count, priority room types, and timing with housekeeping leadership"
  ],
  "communicatedGroupNeedsPM": [
    "Document group name, arrival count, billing concerns, room needs, and timing in handoff"
  ],

  // ===== AM SECTION 10: FINAL ROOM INVENTORY CHECK =====
  "checkedVacantReadyBeforePM": [
    "Go to Rooms Mgmt, Housekeeping view, or Dashboard room status",
    "Filter Vacant Ready",
    "Review available rooms by room type"
  ],
  "checkedDirtyRoomsStillNeeded": [
    "Go to Housekeeping/Rooms Mgmt view",
    "Filter Dirty rooms",
    "Compare dirty rooms against arrivals and priority needs"
  ],
  "checkedInspectedRooms": [
    "Go to Housekeeping/Rooms Mgmt view",
    "Filter or review Inspected status if your property uses it",
    "Confirm rooms ready for arrival"
  ],
  "checkedOOOBeforePM": [
    "Go to Rooms Mgmt or Dashboard room status",
    "Filter Out of Order",
    "Review room numbers, reason, and impact on arrivals"
  ],
  "checkedMaintenanceRoomsBeforePM": [
    "Review OOO rooms, maintenance notes, and housekeeping communication",
    "Identify rooms that may return or remain unavailable"
  ],
  "checkedRoomTypeAvailability": [
    "Go to Dashboard > Room Availability",
    "Confirm today's date",
    "Review Available view by room type",
    "Click GO"
  ],
  "confirmedFinalRoomCount": [
    "Go to Dashboard > Room Availability",
    "Review Sold or Available view",
    "Identify room types with low, zero, or negative availability"
  ],
  "checkedVIPRoomsNeeded": [
    "Review VIP arrival list",
    "Confirm any intentionally assigned VIP rooms are still appropriate and ready or being prioritized"
  ],
  "checkedAccessibilityRoomsNeeded": [
    "Review accessibility arrivals",
    "Confirm required accessible rooms are available, ready, or being prioritized"
  ],
  "checkedConnectingRoomsNeeded": [
    "Review connecting/adjoining requests",
    "Confirm whether the request can still be honored or needs PM follow-up"
  ],
  "checkedEarlyArrivalRoomsNeeded": [
    "Review guests waiting for rooms",
    "Compare against vacant ready and dirty room status",
    "Communicate urgency to housekeeping and PM shift"
  ],

  // ===== AM SECTION 11: GUEST FOLLOW-UP CHECK =====
  "reviewedUnresolvedComplaints": [
    "Check MOD log, shift notes, guest notes, and in-house reservations",
    "Identify complaints still needing follow-up"
  ],
  "reviewedServiceRecoveryNeeds": [
    "Review guest issue notes and MOD communication",
    "Confirm any amenity, room move, rate adjustment, or leadership follow-up needed"
  ],
  "reviewedMaintenanceFollowUps": [
    "Check rooms with maintenance issues",
    "Confirm status with engineering or housekeeping",
    "Document remaining action"
  ],
  "reviewedRoomMoveFollowUps": [
    "Open affected in-house reservation",
    "Confirm room move status, new room need, and timing",
    "Document for PM shift"
  ],
  "reviewedBillingFollowUps": [
    "Open affected reservation",
    "Go to Payment tile",
    "Review balance, routing, folio issue, or adjustment need",
    "Document unresolved items"
  ],
  "reviewedVIPFollowUps": [
    "Review VIP arrival and in-house list",
    "Confirm any promised follow-up, amenity, or room priority was communicated"
  ],
  "updatedGuestNotesFollowUp": [
    "Open reservation",
    "Go to notes/comments section",
    "Enter clear and professional operational note",
    "Save"
  ],
  "communicatedUnresolvedGuestItems": [
    "Document guest name, room number, issue, what was done, and what still needs follow-up",
    "Notify MOD or PM shift"
  ],

  // ===== AM SECTION 12: PM SHIFT HANDOFF =====
  "documentedArrivalsRemainingAM": [
    "Go to Arrivals tile",
    "Filter to not checked-in arrivals",
    "Count and list important remaining arrivals for PM shift"
  ],
  "documentedVIPPriorityArrivalsAM": [
    "Review VIP/priority arrival list",
    "Document guest name, room type, reason for priority, and room status"
  ],
  "documentedEarlyArrivalsWaiting": [
    "Review guests waiting for rooms",
    "Document guest name, requested room type, current status, and next action"
  ],
  "documentedRoomsNotReadyAM": [
    "Review Housekeeping/Rooms Mgmt view",
    "Identify dirty or not-ready rooms needed for arrivals",
    "Document room numbers and room types"
  ],
  "documentedDirtyRoomsNeededFirst": [
    "Compare dirty rooms against priority arrivals",
    "List rooms housekeeping should focus on first"
  ],
  "documentedLateCheckoutsAM": [
    "Review departure notes and approved late checkouts",
    "List room numbers, guest names if needed, and approved checkout times"
  ],
  "documentedRoomMovesAM": [
    "Review room move notes and reservations",
    "List guest name, current room, needed room type, reason, and status"
  ],
  "documentedGuestIssuesAM": [
    "Review unresolved guest issues",
    "List guest name, room number, issue, what was done, and what PM needs to do"
  ],
  "documentedBillingPaymentIssuesAM": [
    "Review unresolved payment/profile/billing list",
    "Document guest name, issue, and needed action"
  ],
  "documentedGroupNotesAM": [
    "Review group arrivals, in-house groups, and departures",
    "Document group name, timing, room needs, and billing concerns"
  ],
  "documentedOOORoomsAM": [
    "Review OOO room list",
    "Document room numbers, reason, and expected return if known"
  ],
  "documentedMaintenanceIssuesAM": [
    "Review maintenance notes and unresolved room issues",
    "Document room number, issue, and status"
  ],
  "documentedInventoryRisksAM": [
    "Review room availability by type",
    "Document sold-out room types, oversell risk, or limited inventory concerns"
  ],
  "preparedPMHandoff": [
    "Review all remaining issues from the checklist",
    "Verbally or digitally update MOD before leaving"
  ],

  // ===== AM SECTION 13: FINAL CONFIRMATION =====
  "confirmReviewedStayPMS": [
    "Before submitting, review each section of this form",
    "Confirm all completed items are accurate"
  ],
  "confirmStandardArrivalsNotPreAssigned": [
    "Review assigned arrivals",
    "Confirm only VIPs, accessibility needs, connecting/adjoining rooms, suites, early arrivals, service recovery, or true operational exceptions were assigned"
  ],
  "confirmPriorityArrivalsPreAssigned": [
    "Review assigned arrivals",
    "Confirm each assignment has a clear reason and is documented if needed"
  ],
  "confirmHousekeepingUpdated": [
    "Confirm housekeeping received priority rooms, early arrivals, late checkouts, OOO rooms, and room move needs"
  ],
  "confirmUnresolvedCommunicated": [
    "Review open issues",
    "Confirm MOD or PM shift received the handoff before AM shift ended"
  ],

  // ===== PM SECTION 1: PM SHIFT OPENING REVIEW =====
  "reviewedPMSArrivalsDepartures": [
    "Read the AM handoff completely",
    "Identify arrivals remaining, VIPs, rooms not ready, early arrivals waiting, billing issues, guest issues, group notes, out-of-order rooms, and inventory risks"
  ],
  "confirmedRoomInventory": [
    "Go to Stay PMS > Front Desk/Home page",
    "Select the Arrivals tile",
    "Confirm today's business date",
    "Filter or review arrivals not checked in"
  ],
  "reviewedDirtyRooms": [
    "Go to Stay PMS > Rooms Mgmt or Housekeeping view",
    "Filter room status to Dirty",
    "Compare dirty rooms against remaining arrivals and priority needs"
  ],
  "updatedOOORooms": [
    "Go to Stay PMS > Rooms Mgmt or Dashboard room status view",
    "Filter room status to Out of Order",
    "Confirm room numbers, reason, and impact on tonight's arrivals"
  ],
  "reviewedRoomAvailability": [
    "Go to Stay PMS > Dashboard > Room Availability",
    "Confirm today's date range",
    "Select Available view",
    "Click GO",
    "Review remaining inventory by room type"
  ],
  "reviewedSoldRoomTypes": [
    "Go to Stay PMS > Dashboard > Room Availability",
    "Change view to Sold if needed",
    "Review room types with low, zero, or negative availability",
    "Click GO"
  ],

  // ===== PM SECTION 2: PRIORITY ARRIVAL REVIEW =====
  "checkedVIPArrivals": [
    "Go to Stay PMS > Arrivals tile",
    "Review VIP indicators, elite status, MOD notes, or special handling notes",
    "Open each priority reservation to confirm details"
  ],
  "reviewedEliteArrivals": [
    "Go to Stay PMS > Arrivals tile",
    "Review Marriott Bonvoy status or guest profile details",
    "Identify Ambassador, Titanium, Platinum, or other priority guests based on property process"
  ],
  "reviewedAccessibilityNeeds": [
    "Go to Stay PMS > Arrivals tile",
    "Review room type and special request notes",
    "Identify accessible room requirements",
    "Confirm inventory availability"
  ],
  "reviewedConnectingRooms": [
    "Go to Stay PMS > Arrivals tile",
    "Open linked or noted reservations",
    "Review special request notes",
    "Verify whether connecting/adjoining rooms are needed and possible"
  ],
  "reviewedSuiteArrivals": [
    "Go to Stay PMS > Arrivals tile",
    "Sort or scan by room type",
    "Identify suites, premium rooms, or specialty inventory"
  ],
  "reviewedServiceRecovery": [
    "Check MOD notes, AM handoff, guest profile notes, previous guest issues, or service recovery notes",
    "Identify any arrival needing special care"
  ],
  "reviewedEarlyArrivals": [
    "Review AM handoff and Arrivals tile",
    "Identify guests already on property waiting for a room",
    "Compare room needs against Vacant Ready and Dirty room status"
  ],
  "reviewedMobileKeyRequests": [
    "Search/open arrival reservation",
    "Look for VAL badge near the reservation details",
    "If present, complete required validation before issuing digital key"
  ],
  "reviewedGroupBlocks": [
    "Go to Stay PMS > Arrivals tile",
    "Filter or scan by group/block name, or go to Dashboard > Group Rooms Control",
    "Review group arrivals and pickup"
  ],

  // ===== PM SECTION 3: ROOM ASSIGNMENT STRATEGY =====
  "preAssignedPriorityArrivals": [
    "Review Arrivals list",
    "Do not assign room numbers to standard arrivals before the guest arrives unless there is a true operational reason"
  ],
  "roomsNotHeldUnnecessarily": [
    "Review assigned arrivals",
    "Confirm every assigned room has a valid reason such as VIP, accessible room, connecting room, suite, early arrival waiting, group need, service recovery, or operational exception"
  ],

  // ===== PM SECTION 4: CHECK-IN EXECUTION =====
  "verifiedGuestIdentification": [
    "Open the arrival reservation",
    "Ask for valid ID",
    "Confirm name matches reservation and guest profile before completing check-in"
  ],
  "confirmedStayDates": [
    "Open reservation",
    "Review arrival date, departure date, and number of nights",
    "Verbally confirm with guest before check-in"
  ],
  "confirmedRoomType": [
    "Open reservation",
    "Review booked room type",
    "Confirm with guest before assigning or checking into a room"
  ],
  "confirmedRatePackage": [
    "Open reservation",
    "Review rate plan, estimated charges, package notes, or reservation comments",
    "Confirm details with guest when appropriate"
  ],
  "confirmedPaymentMethod": [
    "Open reservation",
    "Select Payment tile",
    "Confirm payment method exists or add/collect payment through approved device during check-in"
  ],
  "confirmedCCAuthorization": [
    "During check-in or payment collection, use the attached Lane or SRED device",
    "Do not manually enter an authorization",
    "Confirm authorization posts successfully"
  ],
  "confirmedRoutingBilling": [
    "Open reservation",
    "Review Payment tile, folio, routing, and billing notes",
    "Confirm direct bill, group routing, or split charges before completing check-in"
  ],
  "confirmedTaxExempt": [
    "Open reservation",
    "Expand Estimated Charges",
    "Review Tax Exempt indicator",
    "Confirm documentation and setup before check-in"
  ],
  "confirmedSpecialRequests": [
    "Open reservation",
    "Review notes, preferences, room location requests, accessibility needs, and service recovery notes",
    "Confirm what can be honored"
  ],
  "updatedGuestNotes": [
    "Open reservation",
    "Locate notes/comments section",
    "Add clear operational note only when needed",
    "Save changes"
  ],

  // ===== PM SECTION 5: MOBILE KEY / DIGITAL KEY =====
  "verifiedMobileKeyEnabled": [
    "Open guest reservation in Stay PMS",
    "Look for VAL badge near reservation details",
    "Click VAL badge to begin validation if present"
  ],
  "confirmedGuestAppDownload": [
    "Click the VAL badge",
    "Select required validation options",
    "Confirm all required fields are completed",
    "Select Save & Issue Digital Key"
  ],
  "testedMobileKeyFunctionality": [
    "After completing validation",
    "Confirm Save & Issue Digital Key was available and selected",
    "Verify no validation items remain pending"
  ],

  // ===== PM SECTION 6: HOUSEKEEPING / ROOM STATUS FOLLOW-UP =====
  "reviewedHousekeepingBoard": [
    "Go to Stay PMS > Rooms Mgmt or Housekeeping view",
    "Filter Dirty rooms",
    "Compare against remaining arrivals",
    "Communicate priority rooms to housekeeping"
  ],
  "coordinatedEarlyCheckIns": [
    "Review waiting guests from AM handoff or PM notes",
    "Identify room type needed",
    "Check Vacant Ready and Dirty status",
    "Communicate urgency to housekeeping"
  ],
  "updatedRoomStatuses": [
    "Go to Rooms Mgmt or Housekeeping view",
    "Check status of VIP, accessibility, connecting, suite, early arrival, or service recovery rooms",
    "Confirm status changed to ready before assigning"
  ],
  "communicatedLateCheckouts": [
    "Review remaining late checkouts",
    "Confirm rooms affecting arrivals",
    "Communicate impact and timing to housekeeping"
  ],
  "communicatedMaintenanceRooms": [
    "Review guest complaints, OOO rooms, and room status issues",
    "Document room number and issue",
    "Notify MOD or engineering"
  ],

  // ===== PM SECTION 7: GUEST ISSUES AND SERVICE RECOVERY =====
  "followedUpOnPendingRequests": [
    "Read AM handoff",
    "Identify guest name, room number, issue, and required PM action",
    "Confirm status during PM shift"
  ],
  "loggedGuestComplaints": [
    "Open affected reservation",
    "Review guest notes",
    "Resolve or escalate issue",
    "Document what happened and what was offered or completed"
  ],
  "escalatedIssuesAsNeeded": [
    "Document guest name, room number, issue, what was attempted, and what support is needed",
    "Notify MOD"
  ],
  "reviewedRoomMoveRequests": [
    "Open affected in-house reservation",
    "Confirm reason for move, room type needed, and timing",
    "Coordinate with housekeeping and MOD if needed"
  ],
  "completedRoomMoves": [
    "Open affected reservation in Stay PMS",
    "Use the room move workflow or update reservation according to property process",
    "Confirm new room and key handling"
  ],
  "documentedIncidentsInLog": [
    "Open reservation > notes/comments section",
    "Document issue, action taken, and what night shift must do",
    "Include in night handoff"
  ],

  // ===== PM SECTION 8: LATE ARRIVAL REVIEW =====
  "reviewedLateArrivalsList": [
    "Go to Stay PMS > Front Desk/Home page > Arrivals tile",
    "Filter or review arrivals not checked in",
    "Confirm remaining late arrivals"
  ],
  "confirmedGuarantees": [
    "From remaining arrivals list",
    "Open reservation",
    "Review guarantee/payment details, notes, and expected arrival time if available"
  ],
  "reviewedGroupLateArrivals": [
    "From Arrivals tile",
    "Filter or scan by group/block name",
    "Identify group guests still pending check-in"
  ],
  "reviewedVIPLateArrivals": [
    "From Arrivals tile",
    "Review VIP indicators, elite status, accessibility needs, suite/specialty rooms, or service recovery notes",
    "Document for night shift"
  ],
  "reviewedMobileKeyLateArrivals": [
    "Open remaining arrival reservations",
    "Look for VAL badge or mobile key notes",
    "Complete validation if guest has requested mobile key and validation is required"
  ],
  "reviewedPaymentIssueArrivals": [
    "Open remaining arrival reservations",
    "Select Payment tile",
    "Identify missing payment, failed authorization, direct bill, routing, or deposit concerns"
  ],
  "preparedForAfterHoursCheckIns": [
    "From Arrivals list",
    "Identify assigned but not checked-in reservations",
    "Confirm each assignment still has a valid reason or release unnecessary assignments"
  ],

  // ===== PM SECTION 9: PAYMENT / FOLIO / CASH REVIEW =====
  "verifiedAllFoliosCorrect": [
    "Review arrivals checked in during PM shift",
    "Open any questionable reservation",
    "Select Payment tile",
    "Confirm payment method and authorization are complete"
  ],
  "reviewedInHouseBalances": [
    "Go to Stay PMS > In-House tile",
    "Open reservations with balance concerns",
    "Select Payment tile",
    "Review folio balance and payment status"
  ],
  "reviewedDirectBillIssues": [
    "Open affected reservations",
    "Review Payment tile, folio, routing, and billing notes",
    "Confirm charges are routed correctly"
  ],
  "processedPayments": [
    "Review PM cash activity, cash payments, pantry cash transactions, and drawer activity according to property process",
    "Confirm documentation is complete"
  ],
  "postedOutstandingCharges": [
    "Go to Stay PMS > Pantry or market item area",
    "Review items sold and payment type",
    "Confirm charges or cash collection were completed correctly"
  ],
  "resolvedPaymentDiscrepancies": [
    "List guest name, room number or confirmation number, payment issue, amount if known, and required next action",
    "Include in night handoff"
  ],

  // ===== PM SECTION 10: FINAL INVENTORY AND ROOM STATUS REVIEW =====
  "releasedUnnecessaryAssignments": [
    "Review remaining arrivals with room numbers assigned",
    "Confirm whether assignment is still needed",
    "Remove unnecessary standard assignments according to property process if they are blocking flexibility"
  ],
  "protectedPriorityArrivals": [
    "Review remaining assigned arrivals",
    "Keep assignments only for VIP, accessibility, connecting/adjoining, suite/specialty, group need, service recovery, or confirmed operational reason"
  ],

  // ===== PM SECTION 11: NIGHT SHIFT HANDOFF =====
  "documentedArrivalsRemaining": [
    "Go to Arrivals tile",
    "Filter to not checked-in arrivals",
    "Count and list important remaining arrivals for night shift"
  ],
  "documentedVIPRemaining": [
    "Review remaining VIP/priority arrivals",
    "Document guest name, room type, reason for priority, room status, and any action needed"
  ],
  "documentedGuaranteedLate": [
    "Review remaining arrivals",
    "Identify guaranteed late arrivals",
    "Document payment or arrival notes for night shift"
  ],
  "documentedRoomsNotReady": [
    "Review Housekeeping/Rooms Mgmt view",
    "Identify dirty or not-ready rooms impacting remaining arrivals",
    "Document room numbers and room types"
  ],
  "preparedHandoffNotes": [
    "Review PM guest issues",
    "List guest name, room number, issue, what was done, and what night shift needs to do"
  ],
  "documentedRoomMovesPending": [
    "Review room move notes and in-house reservations",
    "List guest name, current room, needed room type, reason, and status"
  ],
  "documentedBillingIssues": [
    "Review unresolved payment and folio issues",
    "Document guest name, room number or confirmation, issue, and next action"
  ],
  "documentedGroupNotes": [
    "Review group arrivals, in-house groups, and group issues",
    "Document group name, remaining arrivals, billing concerns, and special instructions"
  ],
  "documentedOOORooms": [
    "Review OOO room list",
    "Document room numbers, reason, and expected return if known"
  ],
  "documentedMaintenanceIssues": [
    "Review unresolved room or guest maintenance issues",
    "Document room number, issue, and status"
  ],
  "documentedInventoryRisks": [
    "Review room availability by type",
    "Document sold-out room types, oversell risk, or limited inventory concerns"
  ],
  "communicatedOutstandingIssues": [
    "Review all remaining issues from the checklist",
    "Verbally or digitally update MOD before leaving"
  ],

  // ===== PM SECTION 12: FINAL PM CONFIRMATION =====
  "allArrivalsProcessed": [
    "Before submitting, review each section of this form",
    "Confirm all completed items are accurate"
  ],
  "checkInProceduresFollowed": [
    "Review assigned arrivals",
    "Confirm only VIPs, accessibility needs, connecting/adjoining rooms, suites, early arrivals waiting, service recovery, group needs, or true operational exceptions were assigned"
  ],
  "guestIssuesResolved": [
    "Review room assignments completed during PM shift",
    "Confirm assignments supported check-in flow and did not block inventory unnecessarily"
  ],
  "paymentBillingReviewed": [
    "Review unresolved payment issues",
    "Confirm MOD or night shift received guest name, issue, and required next action"
  ],
  "roomInventoryUpdated": [
    "Confirm dirty rooms, OOO rooms, maintenance concerns, and priority rooms were communicated before leaving"
  ],
  "handoffToNextShiftComplete": [
    "Review open issues",
    "Confirm MOD or night shift received the handoff before PM shift ended"
  ],

  // ===== NIGHT SECTION 1: NIGHT SHIFT OPENING REVIEW =====
  "reviewedPMHandoffNotes": [
    "Read the PM handoff completely",
    "Identify arrivals remaining, VIPs, guaranteed late arrivals, rooms not ready, payment issues, guest issues, group notes, out-of-order rooms, maintenance issues, and inventory risks"
  ],
  "confirmedRemainingArrivals": [
    "Go to Stay PMS > Front Desk/Home page",
    "Select the Arrivals tile",
    "Confirm today's business date",
    "Filter or review arrivals not checked in"
  ],
  "reviewedDeparturesNotCheckedOut": [
    "Go to Stay PMS > Front Desk/Home page",
    "Select the Departures tile",
    "Confirm today's business date",
    "Review any due-outs not checked out"
  ],
  "reviewedInHouseGuestsNight": [
    "Go to Stay PMS > Front Desk/Home page",
    "Select the In-House tile",
    "Review current occupied rooms and guest list"
  ],
  "reviewedVacantReadyRoomsNight": [
    "Go to Stay PMS > Rooms Mgmt, Housekeeping view, or Dashboard room status",
    "Filter Vacant Ready",
    "Review rooms available by room type"
  ],
  "reviewedDirtyRoomsNight": [
    "Go to Stay PMS > Rooms Mgmt or Housekeeping view",
    "Filter room status to Dirty",
    "Identify rooms still dirty and whether they impact late arrivals"
  ],
  "reviewedOOORoomsNight": [
    "Go to Stay PMS > Rooms Mgmt or Dashboard room status view",
    "Filter room status to Out of Order",
    "Confirm room numbers, reason, and impact on overnight inventory"
  ],
  "reviewedRoomAvailabilityNight": [
    "Go to Stay PMS > Dashboard > Room Availability",
    "Confirm today's date range",
    "Select Available view",
    "Click GO",
    "Review remaining inventory by room type"
  ],
  "reviewedSoldRoomTypesNight": [
    "Go to Stay PMS > Dashboard > Room Availability",
    "Change view to Sold if needed",
    "Review room types with low, zero, or negative availability",
    "Click GO"
  ],

  // ===== NIGHT SECTION 2: LATE ARRIVAL REVIEW =====
  "reviewedGuaranteedLateArrivals": [
    "From the Arrivals tile",
    "Open each remaining arrival",
    "Review guarantee/payment details, expected arrival time, notes, and room type"
  ],
  "reviewedNonGuaranteedArrivals": [
    "From the Arrivals tile",
    "Open remaining arrivals",
    "Review guarantee status, payment method, notes, and property cancellation/no-show process before taking action"
  ],
  "reviewedVIPLateArrivalsNight": [
    "From the Arrivals tile",
    "Review VIP indicators, elite status, accessibility needs, suite/specialty rooms, or service recovery notes",
    "Document for overnight handling"
  ],
  "reviewedAccessibilityLateArrivals": [
    "From the Arrivals tile",
    "Review room type and special request notes",
    "Confirm accessible room requirements and available inventory"
  ],
  "reviewedSuiteLateArrivals": [
    "From the Arrivals tile",
    "Sort or scan by room type",
    "Identify suites, premium rooms, or specialty inventory still pending arrival"
  ],
  "reviewedGroupLateArrivalsNight": [
    "Go to Stay PMS > Arrivals tile",
    "Filter or scan by group/block name, or go to Dashboard > Group Rooms Control",
    "Review group arrivals and pickup"
  ],
  "reviewedMobileKeyLateArrivalsNight": [
    "Open remaining arrival reservations",
    "Look for VAL badge or mobile key notes",
    "Complete validation if guest has requested mobile key and validation is required"
  ],
  "reviewedPaymentIssueLateArrivals": [
    "Open remaining arrival reservations",
    "Select Payment tile",
    "Identify missing payment, failed authorization, direct bill, routing, or deposit concerns"
  ],
  "reviewedAssignedRoomsLateArrivals": [
    "From Arrivals list",
    "Identify assigned but not checked-in reservations",
    "Confirm each assignment still has a valid reason or release unnecessary standard assignments according to property process"
  ],

  // ===== NIGHT SECTION 3: OVERNIGHT ROOM ASSIGNMENT STRATEGY =====
  "standardLateArrivalsLeftUnassigned": [
    "Review remaining arrivals",
    "Do not hold rooms for standard arrivals unless needed for VIP, accessibility, connecting/adjoining, suite/specialty, group need, service recovery, or confirmed operational reason"
  ],
  "vipRoomsProtectedNight": [
    "Open VIP arrival reservation",
    "Confirm guest priority, room type, and notes",
    "Assign or protect the room only if needed to improve guest experience or protect inventory"
  ],
  "accessibilityRoomsProtectedNight": [
    "Open reservation with accessibility need",
    "Confirm accessible room type",
    "Assign appropriate accessible room if available and operationally required"
  ],
  "connectingRoomsProtectedNight": [
    "Open linked reservations",
    "Review request",
    "Use room availability/tape chart if needed",
    "Assign only when needed to protect the request"
  ],
  "suitesProtectedNight": [
    "Open suite/specialty arrival",
    "Review inventory and guest priority",
    "Assign only if needed to protect limited inventory"
  ],
  "groupLateArrivalsReviewed": [
    "Review remaining group arrivals",
    "Confirm room type, rooming list notes, and any group-specific instructions",
    "Assign only if operationally necessary"
  ],
  "unnecessaryAssignmentsReleasedNight": [
    "Review assigned arrivals still not checked in",
    "Confirm whether the room assignment is still needed",
    "Remove unnecessary standard assignments according to property process if they are blocking flexibility"
  ],

  // ===== NIGHT SECTION 4: PAYMENT AND AUTHORIZATION REVIEW =====
  "reviewedRemainingArrivalsPayment": [
    "Go to Arrivals tile",
    "Open each remaining arrival with payment concern",
    "Select Payment tile",
    "Confirm payment method, guarantee, direct bill, routing, or deposit information"
  ],
  "confirmedCheckedInGuestsPayment": [
    "Go to In-House tile",
    "Review reservations with balance or payment concerns",
    "Open reservation > Payment tile",
    "Confirm payment method and authorization status"
  ],
  "verifiedAuthorizationsValid": [
    "When collecting or authorizing payment, use the attached Lane or SRED device",
    "Do not manually enter an authorization",
    "Confirm authorization posts successfully"
  ],
  "identifiedDecliningBalances": [
    "Open affected reservation",
    "Select Payment tile",
    "Review authorization/payment status",
    "Document issue and notify MOD or AM shift if unresolved"
  ],
  "reviewedDirectBillNight": [
    "Open affected reservation",
    "Review Payment tile, folio, routing, and billing notes",
    "Confirm direct bill setup is correct"
  ],
  "reviewedRoutedBillingNight": [
    "Open affected reservation",
    "Review routing/folio details",
    "Confirm charges are routed to the correct folio, group, house account, or AR account"
  ],
  "reviewedTaxExemptNight": [
    "Open reservation",
    "Expand Estimated Charges",
    "Review Tax Exempt indicator",
    "Confirm tax-exempt setup and documentation if applicable"
  ],
  "reviewedCashTransactionsNight": [
    "Review cash activity, cash payments, pantry cash transactions, and drawer activity according to property process",
    "Confirm documentation and cash totals are complete"
  ],
  "documentedPaymentIssuesForAM": [
    "List guest name, room number or confirmation number, issue, amount if known, and required next action",
    "Include in AM handoff"
  ],

  // ===== NIGHT SECTION 5: FOLIO AND BALANCE REVIEW =====
  "reviewedInHouseFolios": [
    "Go to Stay PMS > Front Desk/Home page > In-House tile",
    "Open reservations with balance concerns",
    "Select Payment tile",
    "Review folio balance and payment status"
  ],
  "reviewedDeparturesOpenBalances": [
    "Go to Departures tile",
    "Review due-outs not checked out or checked-out guests with balances",
    "Open reservation > Payment tile",
    "Confirm balance and next action"
  ],
  "reviewedCheckedOutOpenBalances": [
    "Go to Dashboard > Ledgers > City Ledger > Reservations",
    "Review checked-out, cancelled, or no-show reservations with outstanding balances"
  ],
  "reviewedCityLedgerNight": [
    "Go to Dashboard > Ledgers > City Ledger > Reservations",
    "Select confirmation number to open folio",
    "Determine whether payment, transfer, adjustment, or credit is needed"
  ],
  "identifiedFoliosNeedingCorrectionNight": [
    "Open affected reservation",
    "Select Payment tile",
    "Review charges, payments, routing, adjustments, and balance",
    "Document any correction needed"
  ],
  "postedAllOutstandingCharges": [
    "Go to Stay PMS > Pantry or market item area",
    "Review items sold and payment type",
    "Confirm charges or cash collection were completed correctly"
  ],
  "reviewedHouseAccountActivity": [
    "Go to Stay PMS > Dashboard > Ledgers or House Accounts area if applicable",
    "Review house account balances, postings, and unresolved charges"
  ],
  "communicatedFolioIssuesAM": [
    "List guest name, room number or confirmation number, balance issue, amount if known, and next action",
    "Include in AM handoff"
  ],

  // ===== NIGHT SECTION 6: NO-SHOW / CANCELLATION REVIEW =====
  "reviewedArrivalsBeforeNoShow": [
    "Go to Stay PMS > Arrivals tile",
    "Filter or review arrivals not checked in",
    "Confirm remaining reservations, guarantee status, notes, and expected arrival information"
  ],
  "reviewedGuaranteedBeforeNoShow": [
    "Open each remaining guaranteed arrival",
    "Review payment method, guarantee, notes, mobile key status, and late arrival comments before taking action"
  ],
  "reviewedGroupBeforeNoShow": [
    "Filter or scan remaining arrivals by group/block name",
    "Confirm group instructions, rooming list expectations, and billing before taking action"
  ],
  "reviewedVIPBeforeNoShow": [
    "Open each VIP or priority remaining arrival",
    "Review MOD notes, expected arrival information, and guest profile before taking action"
  ],
  "processedNoShows": [
    "After reviewing remaining arrivals",
    "Follow your property's approved no-show process in Stay PMS",
    "Document any exceptions or unresolved items"
  ],
  "documentedNoShowExceptions": [
    "List guest name, confirmation number, reason for exception, payment concern, and next action",
    "Include in AM handoff"
  ],

  // ===== NIGHT SECTION 7: PRE-AUDIT READINESS =====
  "confirmedCheckInsBeforeAudit": [
    "Go to Arrivals tile",
    "Review remaining arrivals not checked in",
    "Confirm which reservations should remain pending, no-showed, or handled according to property process"
  ],
  "confirmedCheckoutsBeforeAudit": [
    "Go to Departures tile",
    "Review remaining due-outs",
    "Confirm guests have checked out or are handled according to property process"
  ],
  "confirmedBalancesDocumented": [
    "Review Payment tile for affected reservations and City Ledger if applicable",
    "Document unresolved balance issues for AM shift"
  ],
  "confirmedCashPaymentBalanced": [
    "Review cash drawer, payment activity, pantry cash, and shift paperwork according to property process",
    "Document discrepancies before audit"
  ],
  "confirmedRoomStatusDocumented": [
    "Review Rooms Mgmt or Housekeeping view",
    "Document dirty rooms, OOO rooms, maintenance rooms, and any room status concerns for AM shift"
  ],
  "confirmedMODAwareOfIssues": [
    "Review unresolved payment, guest, inventory, or system issues",
    "Notify MOD or leadership before running audit if issue could impact business day close"
  ],

  // ===== NIGHT SECTION 8: NIGHT AUDIT COMPLETION =====
  "ranNightAuditProcess": [
    "Follow your property's approved night audit workflow in Stay PMS",
    "Complete each required audit step",
    "Do not skip unresolved exceptions without documentation"
  ],
  "confirmedBusinessDateRolled": [
    "After audit completes",
    "Verify Stay PMS business date changed to the new business day",
    "Confirm reports and dashboard reflect the correct date"
  ],
  "verifiedAuditCompleted": [
    "Review audit completion messages, system alerts, and generated reports",
    "Document any error or failed step"
  ],
  "printedRequiredReports": [
    "Go to Stay PMS > Reports or Generated Reports",
    "Access required night audit reports according to property process",
    "Print, save, or attach as required"
  ],
  "reviewedAuditReportsIssues": [
    "Review required audit reports",
    "Check for unusual balances, failed postings, missing reports, or exceptions requiring AM follow-up"
  ],
  "documentedAuditErrors": [
    "If audit failed, delayed, or produced errors",
    "Document error message, time, action taken, screenshots if applicable, and who was notified"
  ],

  // ===== NIGHT SECTION 9: REQUIRED REPORT REVIEW =====
  "reviewedArrivalsReportNewDay": [
    "Go to Stay PMS > Front Desk/Home page > Arrivals tile or Reports",
    "Confirm new business date",
    "Review today's arrivals"
  ],
  "reviewedDeparturesReportNewDay": [
    "Go to Stay PMS > Front Desk/Home page > Departures tile or Reports",
    "Confirm new business date",
    "Review today's departures"
  ],
  "reviewedInHouseGuestList": [
    "Go to Stay PMS > Front Desk/Home page > In-House tile or Reports",
    "Review current in-house guests after audit"
  ],
  "reviewedOOOReport": [
    "Go to Rooms Mgmt, Dashboard room status, or Reports",
    "Filter Out of Order",
    "Review OOO rooms for the new business day"
  ],
  "reviewedRoomMoveTracking": [
    "Go to Reports or reservation search according to property process",
    "Run or review Room Move Tracking",
    "Identify pending or completed room moves"
  ],
  "reviewedCancellationsNoShowReport": [
    "Go to Reports or Generated Reports",
    "Locate Cancellations / No-Show report if used by property",
    "Review no-show or cancellation activity"
  ],
  "reviewedDuplicateReservations": [
    "Go to Reports or Generated Reports",
    "Locate Duplicate Reservations report if used by property",
    "Review possible duplicates for AM follow-up"
  ],
  "reviewedShiftReport": [
    "Go to Reports or Generated Reports",
    "Locate Shift Report",
    "Review shift activity, payments, and exceptions according to property process"
  ],
  "reconciledAllAccounts": [
    "Go to Reports or Generated Reports",
    "Locate Trial Balance or required audit balance report",
    "Review totals and exceptions according to property process"
  ],
  "reviewedDetailedFlash": [
    "Go to Reports or Generated Reports",
    "Locate Detailed Flash or daily summary report",
    "Review occupancy, revenue, and major exceptions according to property process"
  ],

  // ===== NIGHT SECTION 10: MORNING ARRIVAL AND DEPARTURE PREP =====
  "preAssignedMorningArrivals": [
    "Go to Stay PMS > Front Desk/Home page > Arrivals tile",
    "Confirm new business date",
    "Review arrival count, VIPs, early arrivals, special requests, and room type needs"
  ],
  "reviewedTodaysDeparturesAfterAudit": [
    "Go to Stay PMS > Front Desk/Home page > Departures tile",
    "Confirm new business date",
    "Review due-outs, group departures, balances, and late checkout notes"
  ],
  "reviewedVIPArrivalsForAM": [
    "From the new business day Arrivals tile",
    "Review VIP indicators, elite status, MOD notes, and special handling needs",
    "Document for AM shift"
  ],
  "preparedEarlyArrivalRooms": [
    "From Arrivals tile",
    "Review notes and expected arrival times",
    "Identify guests who may arrive before standard check-in time"
  ],
  "reviewedAccessibilityNeedsForAM": [
    "From Arrivals tile",
    "Review room type and special request notes",
    "Identify accessible room needs and inventory impact"
  ],
  "reviewedConnectingRequestsForAM": [
    "Open linked or noted reservations",
    "Review special request notes",
    "Identify connecting/adjoining room needs for AM awareness"
  ],
  "reviewedGroupArrivalsDeparturesForAM": [
    "Go to Arrivals/Departures tiles and Dashboard > Group Rooms Control if applicable",
    "Review group movement for the new business day"
  ],
  "reviewedRoomAvailabilityNewDay": [
    "Go to Dashboard > Room Availability",
    "Confirm new business date",
    "Select Available view",
    "Click GO",
    "Review inventory by room type"
  ],
  "reviewedOOOImpactNewDay": [
    "Go to Rooms Mgmt or Dashboard room status",
    "Filter Out of Order",
    "Confirm OOO rooms and impact on arrivals"
  ],

  // ===== NIGHT SECTION 11: AM HOUSEKEEPING PREP =====
  "preparedDepartureCountHSK": [
    "Go to Departures tile",
    "Confirm new business date",
    "Count due-outs and note groups or priority departures"
  ],
  "preparedStayoverCountHSK": [
    "Go to In-House tile or Housekeeping view",
    "Identify stayovers for the new business day",
    "Document count if property process requires it"
  ],
  "preparedVacantReadyCountAM": [
    "Go to Rooms Mgmt or Housekeeping view",
    "Filter Vacant Ready",
    "Count and document ready rooms by room type if needed"
  ],
  "preparedDirtyRoomCountAM": [
    "Go to Rooms Mgmt or Housekeeping view",
    "Filter Dirty",
    "Count and document dirty rooms for housekeeping awareness"
  ],
  "preparedOOORoomListAM": [
    "Go to Rooms Mgmt or Dashboard room status",
    "Filter Out of Order",
    "Document room numbers, reasons, and expected return if known"
  ],
  "createdHousekeepingAssignments": [
    "Review arrivals for VIPs, accessibility needs, connecting/adjoining requests, suites, early arrivals, and service recovery guests",
    "Document true priority rooms only"
  ],
  "preparedRoomMoveNeedsAM": [
    "Review unresolved room move notes and in-house reservations",
    "Document guest name, current room, needed room type, reason, and timing"
  ],

  // ===== NIGHT SECTION 12: AM SHIFT HANDOFF =====
  "documentedAuditStatus": [
    "Confirm whether audit completed successfully",
    "Document completion status, errors, delays, or system issues"
  ],
  "documentedArrivalsNewDay": [
    "Go to Arrivals tile",
    "Confirm new business date",
    "Document total arrivals and important arrival notes"
  ],
  "documentedDeparturesNewDay": [
    "Go to Departures tile",
    "Confirm new business date",
    "Document total departures, group departures, balances, and late checkout notes"
  ],
  "documentedVIPArrivalsAM": [
    "Review VIP/priority arrivals",
    "Document guest name, room type, reason for priority, and any suggested handling"
  ],
  "documentedEarlyArrivalsAM": [
    "Review arrivals with early arrival notes",
    "Document guest name, room type, expected arrival time, and room readiness concern"
  ],
  "documentedPaymentFolioIssuesAM": [
    "Review unresolved payment/folio list",
    "Document guest name, room number or confirmation number, issue, amount if known, and next action"
  ],
  "documentedGuestIssuesAM": [
    "Review overnight guest issues",
    "Document guest name, room number, issue, what was done, and what AM shift needs to do"
  ],
  "documentedNoShowExceptionsAM": [
    "Review no-show processing and exceptions",
    "Document guest name, confirmation number, reason, and next action"
  ],
  "documentedGroupNotesNight": [
    "Review group arrivals, departures, and in-house groups",
    "Document group name, timing, room needs, billing concerns, and special instructions"
  ],
  "documentedOOORoomsNight": [
    "Review OOO room list",
    "Document room numbers, reason, and expected return if known"
  ],
  "documentedMaintenanceIssuesNight": [
    "Review unresolved maintenance issues",
    "Document room number, issue, and status"
  ],
  "documentedInventoryRisksNight": [
    "Review room availability by type",
    "Document sold-out room types, oversell risk, limited inventory, or OOO impact"
  ],
  "preparedAMHandoff": [
    "Review all remaining issues from the checklist",
    "Verbally or digitally update AM associate or MOD before leaving"
  ],

  // ===== NIGHT SECTION 13: FINAL NIGHT AUDIT CONFIRMATION =====
  "confirmNightAuditChecklist": [
    "Before submitting, review each section of this form",
    "Confirm all completed items are accurate"
  ],
  "confirmNightAuditCompleted": [
    "Review audit status",
    "Confirm completion or document error, action taken, and who was notified"
  ],
  "confirmBusinessDateVerified": [
    "After audit",
    "Check Stay PMS Dashboard/Home page",
    "Confirm the business date reflects the new operational day"
  ],
  "confirmStandardLateArrivalsNotPreAssigned": [
    "Review assigned remaining arrivals",
    "Confirm only VIPs, accessibility needs, connecting/adjoining rooms, suites, service recovery, group needs, or true operational exceptions were assigned"
  ],
  "confirmUnresolvedIssuesDocumented": [
    "Review unresolved issue lists",
    "Confirm all items are included in AM handoff notes"
  ],
  "confirmReportsReviewed": [
    "Review reports and audit packet requirements",
    "Confirm required reports were completed or any missing reports were documented"
  ],

  // ===== ADMIN CHECKLIST INSTRUCTIONS =====
  "adminReviewedTodaysArrivals": [
    "Go to Stay PMS > Front Desk/Home page",
    "Select Arrivals tile",
    "Confirm today's business date",
    "Review full arrival list"
  ],
  "adminReviewedTodaysDepartures": [
    "Go to Stay PMS > Front Desk/Home page",
    "Select Departures tile",
    "Confirm today's business date",
    "Review all due-outs"
  ],
  "adminReviewedInHouseGuests": [
    "Go to Stay PMS > Front Desk/Home page",
    "Select In-House tile",
    "Review occupied rooms, guest names, and balance concerns"
  ],
  "adminReviewedRoomAvailability": [
    "Go to Stay PMS > Dashboard > Room Availability",
    "Confirm date range",
    "Select Available view",
    "Click GO",
    "Review inventory by room type"
  ],
  "adminReviewedSoldRoomTypes": [
    "Go to Stay PMS > Dashboard > Room Availability",
    "Select Sold view if needed",
    "Click GO",
    "Review room types with low, zero, or negative availability"
  ],
  "adminReviewedVacantDirtyOOO": [
    "Go to Stay PMS > Rooms Mgmt or Housekeeping view",
    "Filter by Vacant Ready, Dirty, and Out of Order",
    "Review rooms affecting arrivals"
  ],
  "adminReviewedDashboardExceptions": [
    "Go to Stay PMS > Front Desk/Home page or Dashboard",
    "Review arrivals, departures, in-house, rooms, and alerts",
    "Check for any unusual activity"
  ],
  "adminConfirmedBusinessDate": [
    "Go to Stay PMS Home/Dashboard",
    "Verify business date matches the current operational day",
    "Escalate if incorrect"
  ],
  "adminReviewedMissingProfiles": [
    "Go to Arrivals tile",
    "Open reservations with profile concerns",
    "Review Guest Information section",
    "Confirm guest name and profile details"
  ],
  "adminReviewedMissingBonvoy": [
    "Open arrival reservation",
    "Go to Guest Information section",
    "If needed, select Associate to a Different Profile",
    "Use Loyalty Profile Lookup"
  ],
  "adminReviewedVIPEliteArrivals": [
    "Go to Arrivals tile",
    "Review VIP indicators and elite status",
    "Check MOD notes and special handling notes",
    "Document priority guests"
  ],
  "adminReviewedAccessibilityNeeds": [
    "Go to Arrivals tile",
    "Review room types and special request notes",
    "Identify accessible room needs",
    "Confirm inventory impact"
  ],
  "adminReviewedConnectingRooms": [
    "Open linked reservations or reservations with special request notes",
    "Verify connecting/adjoining room need",
    "Confirm whether it is possible"
  ],
  "adminReviewedEarlyArrivals": [
    "Go to Arrivals tile",
    "Review expected arrival times and notes",
    "Identify early arrivals that need housekeeping awareness"
  ],
  "adminReviewedServiceRecovery": [
    "Review MOD notes, guest notes, and previous shift handoff",
    "Identify arrivals needing special care or recovery"
  ],
  "adminConfirmedNoUnnecessaryPreAssign": [
    "Go to Arrivals tile",
    "Review assigned arrivals",
    "Confirm room assignments are only for VIP, accessibility, connecting/adjoining, suite, early arrival, service recovery, group need, or true operational reason"
  ],
  "adminDocumentedReservationCleanup": [
    "List guest name, confirmation number, issue, and required action",
    "Communicate to Front Desk Leader or MOD"
  ],
  "adminReviewedArrivalsPayment": [
    "Go to Arrivals tile",
    "Open reservations with payment notes or missing payment",
    "Select Payment tile",
    "Review payment method, deposits, routing, and guarantee"
  ],
  "adminReviewedInHouseBalances": [
    "Go to In-House tile",
    "Open reservations with balance concerns",
    "Select Payment tile",
    "Review folio balance and payment method"
  ],
  "adminReviewedDeparturesBalances": [
    "Go to Departures tile",
    "Identify reservations with balances",
    "Open reservation > Payment tile",
    "Confirm payment, transfer, adjustment, or escalation needed"
  ],
  "adminReviewedCheckedOutBalances": [
    "Go to Dashboard > Ledgers > City Ledger > Reservations",
    "Review checked-out, cancelled, or no-show reservations with outstanding balances"
  ],
  "adminReviewedDirectBill": [
    "Open affected reservation",
    "Go to Payment tile or folio/routing area",
    "Confirm direct bill setup and routing are correct"
  ],
  "adminReviewedRoutedBilling": [
    "Open reservation > Payment tile",
    "Review routing/folio setup",
    "Confirm charges are routed correctly"
  ],
  "adminReviewedTaxExempt": [
    "Open reservation",
    "Expand Estimated Charges",
    "Review Tax Exempt indicator",
    "Confirm tax-exempt setup and documentation are correct"
  ],
  "adminReviewedFoliosCorrection": [
    "Open affected reservation > Payment tile",
    "Review charges, payments, routing, adjustments, and balances",
    "Document correction needed"
  ],
  "adminCommunicatedBillingIssues": [
    "List guest name, room/confirmation number, amount, issue, and required action",
    "Send to AGM or GM for awareness"
  ],
  "adminReviewedGroupArrivals": [
    "Go to Arrivals tile",
    "Filter or scan by group/block name",
    "Or go to Dashboard > Group Rooms Control",
    "Review group arrivals"
  ],
  "adminReviewedGroupDepartures": [
    "Go to Departures tile",
    "Filter or scan by group/block name",
    "Review group guests due out today"
  ],
  "adminReviewedInHouseGroups": [
    "Go to In-House tile",
    "Filter or scan by group/block name",
    "Review current in-house group rooms"
  ],
  "adminReviewedGroupPickup": [
    "Go to Dashboard > Group Rooms Control",
    "Enter start/end date and number of days to display",
    "Review picked-up rooms"
  ],
  "adminReviewedRemainingGroupRooms": [
    "Go to Dashboard > Group Rooms Control",
    "Review remaining rooms by date",
    "Identify unused rooms or pickup concerns"
  ],
  "adminReviewedGroupBillingNotes": [
    "Open group or group guest reservation",
    "Review Payment tile, routing, folio, and group notes",
    "Confirm billing instructions"
  ],
  "adminReviewedGroupSpecialRequests": [
    "Open group or group guest reservations",
    "Review notes, arrival timing, rooming requests, and special handling needs"
  ],
  "adminConfirmedGroupCommunicated": [
    "Send group name, arrival/departure count, timing, billing concerns, and priority room needs",
    "Communicate to Front Desk, Housekeeping, and MOD"
  ],
  "adminReviewedDailyReports": [
    "Go to Stay PMS > Reports or Generated Reports",
    "Locate required daily reports (Arrivals, Departures, Shift Report, Out of Order Rooms, No-Show, Detailed Flash)",
    "Review for exceptions"
  ],
  "adminReviewedNoShowCancellation": [
    "Go to Reports or Generated Reports",
    "Locate Cancellations / No-Show report if used by property",
    "Review for guest or billing follow-up"
  ],
  "adminReviewedDuplicateReservations": [
    "Go to Reports or Generated Reports",
    "Locate Duplicate Reservations report if used by property",
    "Review possible duplicates and document corrections"
  ],
  "adminReviewedOOORoomList": [
    "Go to Rooms Mgmt, Dashboard room status, or Reports",
    "Filter Out of Order",
    "Review room number, reason, and return date if known"
  ],
  "adminReviewedRoomMoveTracking": [
    "Go to Reports or reservation search according to property process",
    "Review Room Move Tracking",
    "Identify pending or completed room moves"
  ],
  "adminReviewedGuestFollowUp": [
    "Check MOD log, shift notes, guest notes, and handoff notes",
    "Identify unresolved guest complaints, service recovery, billing, or maintenance follow-ups"
  ],
  "adminUpdatedGuestNotes": [
    "Open reservation",
    "Locate notes/comments section",
    "Enter clear operational note only when needed",
    "Save"
  ],
  "adminPreparedSummary": [
    "Summarize inventory risks, billing issues, VIPs, groups, guest issues, OOO rooms, and unresolved follow-up items"
  ],
  "adminConfirmChecklist": [
    "Before submitting, review each section",
    "Confirm completed items are accurate"
  ],
  "adminConfirmDocumented": [
    "Review open items",
    "Confirm concerns are included in notes and communicated to leadership"
  ],
  "adminConfirmCommunicated": [
    "Review unresolved issues",
    "Confirm leadership received the summary before end of shift"
  ],

  // ===== AGM CHECKLIST INSTRUCTIONS =====
  "agmReviewedHouseStatus": [
    "Go to Stay PMS > Front Desk/Home page or Dashboard",
    "Review occupancy, arrivals, departures, in-house guests, room status, and alerts"
  ],
  "agmReviewedArrivals": [
    "Go to Front Desk/Home page",
    "Select Arrivals tile",
    "Confirm today's business date",
    "Review total arrivals and priority arrivals"
  ],
  "agmReviewedDepartures": [
    "Go to Front Desk/Home page",
    "Select Departures tile",
    "Confirm today's business date",
    "Review due-outs, late checkouts, and balance concerns"
  ],
  "agmReviewedInHouseGuests": [
    "Go to Front Desk/Home page",
    "Select In-House tile",
    "Review current occupied rooms, VIPs, guest issues, and payment concerns"
  ],
  "agmReviewedRoomAvailability": [
    "Go to Dashboard > Room Availability",
    "Confirm date range",
    "Select Available view",
    "Click GO",
    "Identify room type risks"
  ],
  "agmReviewedSoldOutRooms": [
    "Go to Dashboard > Room Availability",
    "Select Sold view if needed",
    "Click GO",
    "Identify room types with zero, low, or negative availability"
  ],
  "agmReviewedVacantDirtyOOO": [
    "Go to Rooms Mgmt or Housekeeping view",
    "Filter by Vacant Ready, Dirty, and Out of Order",
    "Review operational impact"
  ],
  "agmConfirmedRoomAssignmentStrategy": [
    "Review assigned arrivals",
    "Confirm team is not pre-assigning standard arrivals unnecessarily",
    "Confirm only true priority rooms are protected"
  ],
  "agmReviewedVIPElite": [
    "Go to Arrivals tile",
    "Review VIP indicators and elite status",
    "Check MOD notes and special handling notes",
    "Confirm priority handling plan"
  ],
  "agmReviewedEarlyArrivals": [
    "Go to Arrivals tile",
    "Review expected arrival times and notes",
    "Confirm early arrivals are communicated to housekeeping"
  ],
  "agmReviewedAccessibility": [
    "Go to Arrivals tile",
    "Review room type and special request notes",
    "Confirm accessible room inventory is protected if needed"
  ],
  "agmReviewedConnecting": [
    "Open linked reservations or special request notes",
    "Confirm request feasibility and whether rooms need to be protected"
  ],
  "agmReviewedSuites": [
    "Go to Arrivals tile",
    "Sort or scan by room type",
    "Identify suites and specialty rooms",
    "Confirm priority usage"
  ],
  "agmReviewedServiceRecovery": [
    "Review MOD log, guest notes, and prior shift handoff",
    "Identify guests needing leadership follow-up or special handling"
  ],
  "agmReviewedMobileKey": [
    "Open affected reservation",
    "Look for VAL badge",
    "Confirm validation was completed or document why it could not be completed"
  ],
  "agmReviewedUnresolvedIssues": [
    "Check shift handoff, MOD log, guest notes, and open service recovery items",
    "Confirm ownership and next action"
  ],
  "agmConfirmedPMPlan": [
    "Review arrivals remaining, room status, priority rooms, staffing, and guest issue list",
    "Confirm front desk is ready for peak check-in"
  ],
  "agmReviewedDeparturesBalances": [
    "Go to Departures tile",
    "Identify balances due",
    "Open reservation > Payment tile",
    "Review amount and action needed"
  ],
  "agmReviewedInHouseBalances": [
    "Go to In-House tile",
    "Open reservations with balance concerns",
    "Payment tile",
    "Review balance, payment method, and authorization"
  ],
  "agmReviewedCheckedOutBalances": [
    "Go to Dashboard > Ledgers > City Ledger > Reservations",
    "Review checked-out, cancelled, or no-show reservations with outstanding balances"
  ],
  "agmReviewedDirectBillRouting": [
    "Open affected reservations",
    "Payment tile and routing/folio area",
    "Confirm billing and routing are correct"
  ],
  "agmReviewedTaxExempt": [
    "Open reservation",
    "Expand Estimated Charges",
    "Review Tax Exempt indicator",
    "Confirm setup and documentation"
  ],
  "agmReviewedCashPayment": [
    "Review shift handoff, payment notes, cash activity, and any unresolved payment issues",
    "Confirm follow-up owner"
  ],
  "agmReviewedFolioCorrections": [
    "Open affected reservation > Payment tile",
    "Review charges, payments, adjustments, and routing",
    "Approve or escalate according to property process"
  ],
  "agmDocumentedFinancialConcerns": [
    "List guest name, room/confirmation number, issue, amount, and next action",
    "Include in leadership notes"
  ],
  "agmConfirmedDepartureCount": [
    "Go to Departures tile",
    "Confirm due-out count",
    "Verify housekeeping leader received count and priority departures"
  ],
  "agmConfirmedStayoverCount": [
    "Go to In-House tile or Housekeeping view",
    "Confirm stayovers",
    "Verify housekeeping leader received count"
  ],
  "agmConfirmedPriorityList": [
    "Review arrivals for VIPs, accessibility needs, connecting/adjoining requests, suites, early arrivals, and service recovery guests",
    "Confirm housekeeping received true priority rooms only"
  ],
  "agmReviewedDirtyRooms": [
    "Go to Rooms Mgmt or Housekeeping view",
    "Filter Dirty",
    "Compare against arrivals and priority needs",
    "Identify risk"
  ],
  "agmReviewedOOORooms": [
    "Go to Rooms Mgmt or Dashboard room status",
    "Filter Out of Order",
    "Confirm room number, reason, and return-to-service expectation"
  ],
  "agmReviewedRoomMoves": [
    "Review in-house reservations and shift notes",
    "Identify room moves",
    "Confirm housekeeping and engineering are aligned"
  ],
  "agmConfirmedMaintenanceAssigned": [
    "Review guest complaints, OOO rooms, and maintenance notes",
    "Confirm owner and expected resolution"
  ],
  "agmEscalatedRoomReadiness": [
    "If priority rooms or room types are at risk",
    "Notify GM/MOD",
    "Coordinate front desk, housekeeping, and engineering plan"
  ],
  "agmReviewedGroupArrivals": [
    "Go to Arrivals tile",
    "Filter or scan by group/block name",
    "Or go to Dashboard > Group Rooms Control",
    "Review group arrivals"
  ],
  "agmReviewedGroupDepartures": [
    "Go to Departures tile",
    "Filter or scan by group/block name",
    "Review group guests due out today"
  ],
  "agmReviewedInHouseGroups": [
    "Go to In-House tile",
    "Filter or scan by group/block name",
    "Review current group rooms"
  ],
  "agmReviewedGroupPickup": [
    "Go to Dashboard > Group Rooms Control",
    "Enter date range and days to display",
    "Review picked-up and remaining rooms"
  ],
  "agmReviewedGroupBilling": [
    "Open group or group guest reservations",
    "Payment tile, routing, folio, and notes",
    "Confirm group billing expectations"
  ],
  "agmConfirmedGroupTiming": [
    "Review group notes, sales communication, or MOD handoff",
    "Communicate arrival timing and room needs to front desk and housekeeping"
  ],
  "agmReviewedInventoryRisk": [
    "Go to Dashboard > Room Availability",
    "Compare group rooms, available rooms, and OOO rooms",
    "Identify sell-out or oversell risk"
  ],
  "agmEscalatedGroupIssues": [
    "Document group name, room count, risk, guest impact, and action plan",
    "Notify GM"
  ],
  "agmReviewedChecklistCompletion": [
    "Open submitted checklists or review shift handoff",
    "Confirm associates completed required tasks and documented unresolved issues"
  ],
  "agmReviewedUnresolvedGuestIssues": [
    "Check MOD log, guest notes, and shift handoff",
    "Confirm every unresolved guest issue has an owner and next action"
  ],
  "agmReviewedStaffingTraining": [
    "Observe shift execution and checklist completion",
    "Document coaching needs, missed tasks, or training gaps"
  ],
  "agmReviewedWinsMisses": [
    "Summarize what went well, what caused friction, and what needs follow-up tomorrow"
  ],
  "agmPreparedSummary": [
    "Summarize occupancy, arrivals, departures, inventory risks, guest issues, billing issues, groups, staffing, and follow-up"
  ],
  "agmCommunicatedToGM": [
    "Send GM a concise summary of major guest, financial, staffing, inventory, or maintenance risks"
  ],
  "agmConfirmChecklist": [
    "Before submitting, review each section",
    "Confirm completed items are accurate"
  ],
  "agmConfirmReviewed": [
    "Confirm all critical operational areas were checked and documented"
  ],
  "agmConfirmOwnerAssigned": [
    "Review unresolved items",
    "Confirm each has an owner and next action"
  ],
  "agmConfirmGMUpdated": [
    "Confirm major risks or escalations were communicated to the GM"
  ],

  // ===== GM CHECKLIST INSTRUCTIONS =====
  "gmReviewedHouseStatus": [
    "Go to Stay PMS > Front Desk/Home page or Dashboard",
    "Review occupancy, arrivals, departures, in-house guests, and room status"
  ],
  "gmReviewedExpectedOccupancy": [
    "Go to Dashboard/Home page or Room Availability",
    "Confirm expected occupancy",
    "Compare against arrivals, departures, and OOO rooms"
  ],
  "gmReviewedArrivals": [
    "Go to Front Desk/Home page > Arrivals tile",
    "Confirm today's business date",
    "Review arrival volume and priority arrivals"
  ],
  "gmReviewedDepartures": [
    "Go to Front Desk/Home page > Departures tile",
    "Confirm today's business date",
    "Review departure volume, late checkouts, and balance concerns"
  ],
  "gmReviewedInHouseCount": [
    "Go to Front Desk/Home page > In-House tile",
    "Review current occupied rooms and guest list"
  ],
  "gmReviewedRoomAvailability": [
    "Go to Dashboard > Room Availability",
    "Confirm date range",
    "Select Available view",
    "Click GO",
    "Identify limited room types"
  ],
  "gmReviewedSoldOutRooms": [
    "Go to Dashboard > Room Availability",
    "Select Sold view if needed",
    "Click GO",
    "Review low, zero, or negative availability"
  ],
  "gmReviewedOOOImpact": [
    "Go to Rooms Mgmt or Dashboard room status",
    "Filter Out of Order",
    "Review room numbers, reasons, and expected return dates"
  ],
  "gmConfirmedInventoryPlan": [
    "If sold out, oversold, or impacted by OOO rooms",
    "Confirm AGM/MOD has a plan for arrivals, room moves, and guest recovery"
  ],
  "gmReviewedVIPArrivals": [
    "Go to Arrivals tile",
    "Review VIP indicators, elite status, MOD notes, and special handling notes",
    "Identify guests requiring GM awareness"
  ],
  "gmReviewedEliteArrivals": [
    "Go to Arrivals tile",
    "Review Marriott Bonvoy status and guest notes",
    "Identify Ambassador, Titanium, Platinum, repeat guests, or high-impact arrivals"
  ],
  "gmReviewedServiceRecovery": [
    "Review MOD log, guest notes, prior shift handoff, and leadership notes",
    "Identify guests needing recovery or GM follow-up"
  ],
  "gmReviewedUnresolvedComplaints": [
    "Check MOD log, guest notes, and handoff notes",
    "Confirm issue, action taken, and owner"
  ],
  "gmReviewedRoomMoves": [
    "Review shift notes and in-house reservations",
    "Identify room moves caused by maintenance, guest dissatisfaction, or inventory issue"
  ],
  "gmReviewedCompensation": [
    "Review affected reservation > Payment tile, folio, notes, and MOD communication",
    "Approve or guide recovery according to property standards"
  ],
  "gmConfirmedRecoveryOwner": [
    "For each unresolved guest issue",
    "Assign owner, next step, and timeline"
  ],
  "gmReviewedOpenBalanceRisks": [
    "Go to Dashboard > Ledgers > City Ledger > Reservations",
    "Review checked-out, cancelled, or no-show reservations with outstanding balances"
  ],
  "gmReviewedInHouseBalances": [
    "Go to In-House tile",
    "Open reservations with large or unusual balances",
    "Payment tile",
    "Review payment method and balance"
  ],
  "gmReviewedDeparturesBalances": [
    "Go to Departures tile",
    "Identify guests with balances",
    "Open reservation > Payment tile",
    "Confirm plan for payment, transfer, adjustment, or escalation"
  ],
  "gmReviewedDirectBillRouting": [
    "Open affected reservation",
    "Payment tile and routing/folio area",
    "Confirm billing setup and financial risk"
  ],
  "gmReviewedTaxExempt": [
    "Open affected reservation",
    "Expand Estimated Charges",
    "Review Tax Exempt indicator",
    "Confirm documentation and setup"
  ],
  "gmReviewedCashDiscrepancies": [
    "Review AGM/MOD report, shift handoff, cash activity, and payment notes",
    "Confirm discrepancy owner and action plan"
  ],
  "gmReviewedFolioAdjustments": [
    "Open affected reservation > Payment tile",
    "Review charges, payments, adjustments, and reason",
    "Confirm action is appropriate"
  ],
  "gmConfirmedFinancialOwner": [
    "List issue, amount, guest/account, owner, and next action"
  ],
  "gmReviewedGroupArrivalsDepartures": [
    "Go to Arrivals and Departures tiles",
    "Filter or scan by group/block name",
    "Review group movement for today"
  ],
  "gmReviewedGroupPickup": [
    "Go to Dashboard > Group Rooms Control",
    "Enter date range and days to display",
    "Review picked-up and remaining rooms"
  ],
  "gmReviewedGroupBilling": [
    "Open group or group guest reservations",
    "Payment tile, routing, folio, and notes",
    "Confirm billing risk or unresolved concerns"
  ],
  "gmReviewedGroupSpecialRequests": [
    "Review group notes, sales communication, or MOD handoff",
    "Identify arrival timing, room needs, VIPs, or operational concerns"
  ],
  "gmReviewedInventoryImpact": [
    "Compare Group Rooms Control, Room Availability, and Out of Order rooms",
    "Identify group-related sell-out or oversell risk"
  ],
  "gmConfirmedGroupPlan": [
    "Verify AGM/MOD, Front Desk, Housekeeping, and Sales are aligned",
    "Confirm group arrival/departure timing, room needs, and billing"
  ],
  "gmReviewedChecklistCompletion": [
    "Open submitted checklist records or dashboard",
    "Confirm each shift submitted required checklist and documented issues"
  ],
  "gmReviewedMissedItems": [
    "Review checklist submissions",
    "Identify repeated missed tasks, weak handoffs, or training gaps"
  ],
  "gmReviewedStaffingCoverage": [
    "Compare occupancy, arrivals, departures, groups, and known issues against staffing schedule",
    "Identify coverage concerns"
  ],
  "gmReviewedCoachingOpportunities": [
    "Review checklist gaps, guest issues, billing errors, or room assignment mistakes",
    "Identify coaching needed"
  ],
  "gmConfirmedRoomAssignmentDiscipline": [
    "Review assigned arrivals",
    "Confirm standard arrivals are not unnecessarily pre-assigned",
    "Confirm priority rooms are protected only when needed"
  ],
  "gmReviewedCommunicationQuality": [
    "Review handoff notes, priority rooms, late checkouts, and room readiness issues",
    "Identify communication breakdowns"
  ],
  "gmReviewedMaintenanceFollowUp": [
    "Review OOO rooms, guest maintenance complaints, and engineering follow-up",
    "Confirm issues are assigned and tracked"
  ],
  "gmAssignedOwners": [
    "List each unresolved issue with owner, next action, and deadline"
  ],
  "gmPreparedDailySummary": [
    "Summarize occupancy, arrivals, departures, revenue or financial risk, guest issues, group concerns, staffing, maintenance, and follow-up"
  ],
  "gmCommunicatedPriorities": [
    "Share top priorities, guest follow-ups, financial issues, inventory risks, and staffing concerns with AGM/MOD"
  ],
  "gmConfirmedTomorrowsRisks": [
    "Review next day arrivals, groups, OOO rooms, staffing, VIPs, and inventory risk",
    "Document items requiring early attention"
  ],
  "gmConfirmedAllOwnersAssigned": [
    "Review guest, financial, inventory, maintenance, staffing, and group issues",
    "Confirm each has owner and next action"
  ],
  "gmConfirmHouseStatus": [
    "Before submitting, review house status, inventory, arrivals, departures, and OOO room impact"
  ],
  "gmConfirmAllAreasReviewed": [
    "Review all sections",
    "Confirm critical risk areas were checked"
  ],
  "gmConfirmOwnersAssigned": [
    "Review unresolved items",
    "Confirm each issue has an owner, next action, and timeline"
  ],
  "gmConfirmAGMMODUpdated": [
    "Confirm leadership team was updated on guest recovery, inventory, billing, staffing, or maintenance priorities"
  ],

  // ===== SUPPORTING SYSTEMS: GXP =====
  "reviewedGXPOpenRequestsOvernight": [
    "Open GXP",
    "Search by open requests/cases for the property or by guest room if listed in handoff",
    "Review overnight complaints, service requests, amenities, wake-up calls if applicable, and maintenance follow-ups",
    "Update status or assign owner before AM rush"
  ],
  "reviewedGXPUnresolvedComplaints": [
    "Open GXP",
    "Filter open cases/requests by status Open, Pending, or Needs Follow-Up",
    "Review guest name, room number, issue, owner, and due time",
    "Add unresolved items to AM handoff notes or MOD follow-up"
  ],
  "reviewedGXPOpenCasesAM": [
    "Open GXP",
    "Filter cases by Open, Pending, or Needs Follow-Up",
    "Review guest name, room number, issue, owner, and due time",
    "Prioritize items affecting check-in or guest recovery"
  ],
  "reviewedGXPOpenCasesPM": [
    "Open GXP",
    "Filter open/pending cases",
    "Review guest name, room number, issue, owner, and due time",
    "Identify overnight follow-up items"
  ],
  "reviewedGXPWakeUpCalls": [
    "Open GXP",
    "Filter requests by wake-up call, overnight request, or due time if applicable",
    "Verify guest name, room number, requested time, and completion process"
  ],
  "reviewedGXPPreArrivalRequests": [
    "Open GXP",
    "Filter requests/cases by arrival date or search guest names from today's arrival list",
    "Review amenities, special requests, complaints, or follow-up items",
    "Coordinate with housekeeping, MOD, or appropriate department"
  ],
  "updatedClosedGXPCases": [
    "Open GXP",
    "Review open cases handled during AM shift",
    "Update notes, status, owner, or resolution",
    "Close only if fully completed according to property process"
  ],
  "addedUnresolvedGXPToPMHandoff": [
    "Open GXP",
    "Filter open or pending cases",
    "List guest name, room number, issue, owner, and next action",
    "Include unresolved items in PM Handoff Notes"
  ],
  "checkedGXPBeforeVIPCheckIn": [
    "Before completing check-in for VIP or recovery guest, open GXP",
    "Search guest by name or room number if assigned",
    "Review active requests, complaints, amenities, or follow-up items",
    "Confirm handling plan with MOD if needed"
  ],
  "submittedGXPCaseComplaint": [
    "Open GXP",
    "Create or open guest case/request",
    "Enter guest name, room number, issue, department owner, urgency, and action taken",
    "Update status before handoff"
  ],
  "documentedUnresolvedGXPCasesNight": [
    "Open GXP",
    "Filter open/pending cases",
    "Document guest name, room number, issue, owner, due time, and next action",
    "Include in Night Shift Handoff Notes"
  ],
  "addedUnresolvedGXPCasesAMHandoff": [
    "Open GXP",
    "Filter open/pending cases",
    "Document guest name, room number, issue, owner, due time, and next action",
    "Include in AM Shift Handoff Notes"
  ],
  "createdGXPCaseOvernightComplaint": [
    "Open GXP",
    "Create or update case",
    "Include guest name, room number, issue, action taken, owner, and follow-up needed",
    "Add unresolved item to AM handoff"
  ],
  "adminReviewedGXPPreArrivalCases": [
    "Open GXP",
    "Filter open cases/requests by arrival date, guest name, room number, or status",
    "Review amenities, complaints, requests, and follow-up items",
    "Assign owner or add to operations summary"
  ],
  "adminReviewedGXPAgingCases": [
    "Open GXP",
    "Filter Open, Pending, or overdue cases",
    "Sort by due time or age if available",
    "Identify missed follow-ups",
    "Assign owner and document in Admin Summary"
  ],
  "adminAuditedGXPCompletion": [
    "Open GXP",
    "Review completed cases/requests for the day",
    "Confirm notes and resolution are clear",
    "Reopen or follow up if completion is inaccurate or guest issue is unresolved"
  ],
  "agmReviewedGXPServiceRecovery": [
    "Open GXP",
    "Filter cases by Open, Pending, complaint, service recovery, or overdue status",
    "Review guest name, room number, issue, owner, and next action",
    "Confirm leadership follow-up"
  ],
  "agmReviewedUnresolvedGXPBeforeLeaving": [
    "Open GXP",
    "Filter open/pending/overdue cases",
    "Confirm each issue has owner, due time, and next action",
    "Escalate guest-impacting issues to GM if needed"
  ],
  "agmReviewedGXPGPSCoaching": [
    "Review whether guest requests, complaints, service recovery, VIP preferences, and recognition items were documented and acted on properly",
    "Document coaching or training opportunities in AGM Leadership Summary"
  ],
  "gmReviewedGXPHighImpactCases": [
    "Open GXP",
    "Filter complaints, service recovery, overdue, or high-priority cases",
    "Review guest impact, owner, action taken, and next step",
    "Assign leadership follow-up if needed"
  ],
  "gmReviewedGXPFollowUpDiscipline": [
    "Open GXP or review leadership summary",
    "Confirm open guest cases have owners, overdue items are addressed, and complaints are not being left unresolved between shifts"
  ],

  // ===== SUPPORTING SYSTEMS: GPS =====
  "reviewedGPSPreferencesVIP": [
    "Open GPS",
    "Search VIP, elite, or high-touch guest by name, Bonvoy number, or confirmation number",
    "Review preferences, stay history, recognition notes, and special handling needs",
    "Document only operationally useful items in handoff or Stay PMS notes"
  ],
  "reviewedGPSNotesVIPPending": [
    "Open GPS",
    "Search priority arrivals by guest name, Bonvoy number, or confirmation number",
    "Review preferences, recognition notes, and service history",
    "Communicate useful items to MOD or front desk team"
  ],
  "usedGPSForGuestRecognition": [
    "Open GPS for VIP, elite, repeat, or high-touch guest",
    "Review preference and recognition details",
    "Use only relevant operational information to personalize arrival experience"
  ],
  "documentedUnresolvedGPSFollowups": [
    "Review GPS notes used during PM shift",
    "Document only unresolved operational items such as amenity, room preference, or service recovery commitment",
    "Include in Night Shift Handoff Notes"
  ],
  "reviewedGPSEarlyVIPArrivals": [
    "Open GPS",
    "Search early VIP/high-touch arrivals by name, Bonvoy number, or confirmation number",
    "Review preferences and recognition notes",
    "Document only useful AM operational follow-up"
  ],
  "adminReviewedGPSProfilesVIP": [
    "Open GPS",
    "Search guest by name, Bonvoy number, or confirmation number",
    "Review preferences, stay history, recognition notes, and service recovery indicators",
    "Document only operationally necessary information"
  ],
  "agmReviewedGPSVIPNotes": [
    "Open GPS",
    "Search VIP/high-touch guests by name, Bonvoy number, or confirmation number",
    "Review preferences, recognition opportunities, and prior stay notes",
    "Confirm appropriate operational follow-up"
  ],
  "gmReviewedGPSVIPEliteInfo": [
    "Open GPS",
    "Search priority guests by name, Bonvoy number, or confirmation number",
    "Review preferences, loyalty recognition opportunities, stay history, and prior recovery notes",
    "Confirm leadership handling if needed"
  ],
  "gmReviewedGPSRecognitionDiscipline": [
    "Review VIP/high-touch handling with AGM or MOD",
    "Confirm GPS preferences and recognition details are being used appropriately without over-documenting unnecessary information"
  ],

  // ===== SUPPORTING SYSTEMS: EMPOWER RESAPP =====
  "reviewedEmpowerResAppQuestions": [
    "Open Empower ResApp",
    "Search guest by confirmation number, guest name, or Bonvoy number",
    "Use Empower ResApp for future-dated individual reservation changes or confirmation emails",
    "Do not create future-dated individual reservations in Stay PMS"
  ],
  "adminConfirmedEmpowerResAppUsage": [
    "Open Empower ResApp",
    "Search reservation by name, Bonvoy number, or confirmation number",
    "Use Empower ResApp for future reservation changes and confirmation emails",
    "Do not create future-dated individual reservations in Stay PMS"
  ],
  "agmConfirmedEmpowerResAppUsage": [
    "Verify future-dated individual reservation requests are handled in Empower ResApp",
    "Remind team not to create future-dated individual reservations directly in Stay PMS"
  ],

  // ===== SUPPORTING SYSTEMS: MGS / SERVICENOW =====
  "reviewedMGSTicketsOvernight": [
    "Open MGS/ServiceNow or review overnight handoff",
    "Identify any open Stay PMS, key encoder, payment device, Mobile Key, GXP, or access issues",
    "Confirm ticket number, current status, and workaround if applicable"
  ],
  "reviewedMGSOpenIssuesPM": [
    "Open MGS/ServiceNow or review AM handoff",
    "Check for open tickets related to Stay PMS, GXP, GPS, payment devices, key encoder, Mobile Key, or access issues",
    "Note workaround and escalation status"
  ],
  "reviewedMGSOpenIssuesNight": [
    "Open MGS/ServiceNow or review PM handoff",
    "Identify open issues affecting Stay PMS, reports, payment devices, key encoder, GXP, GPS, or night audit",
    "Document workaround and escalation status"
  ],
  "escalatedMGSTickets": [
    "If Stay PMS, GXP, GPS, payment device, key encoder, or Mobile Key issue remains unresolved, open MGS/ServiceNow",
    "Submit or update ticket with screenshots, error message, affected workstation/device, and steps already attempted"
  ],
  "escalatedDeviceIssueMGS": [
    "After basic troubleshooting and MOD notification, open MGS/ServiceNow",
    "Create ticket with system/device name, workstation/location, screenshots, error message, date/time, affected guest if applicable, and steps already attempted"
  ],
  "documentedUnresolvedMGSTicketsNight": [
    "Review open tickets from PM shift",
    "Document ticket number, system/device affected, issue, workaround, and next expected action",
    "Include in Night Shift Handoff Notes"
  ],
  "addedUnresolvedMGSTicketsAMHandoff": [
    "Open MGS/ServiceNow or ticket log",
    "Document ticket number, system/device affected, issue, workaround, and current status",
    "Include in AM Shift Handoff Notes"
  ],
  "documentedPaymentDeviceMGS": [
    "If Lane/SRED device fails or is unavailable, confirm device connection and retry according to property process",
    "Do not manually enter authorization",
    "Notify MOD",
    "Create/update MGS/ServiceNow ticket with screenshots, device location, and error message"
  ],
  "confirmedReportAuditIssuesMGS": [
    "If required reports fail, appear blank unexpectedly, or audit process errors occur, verify business date and report criteria",
    "Take screenshot",
    "Create/update MGS/ServiceNow ticket with report name, date range, business date, error message, and steps attempted"
  ],
  "adminReviewedMGSOpenTickets": [
    "Open MGS/ServiceNow",
    "Review tickets for Stay PMS, GXP, GPS, payment devices, key encoder, Mobile Key, reports, or access issues",
    "Document ticket number, status, owner, and workaround"
  ],
  "agmReviewedUnresolvedMGSBeforeLeaving": [
    "Open MGS/ServiceNow",
    "Review open system, device, access, report, Stay PMS, GXP, GPS, or Mobile Key tickets",
    "Document ticket number, impact, workaround, and escalation status"
  ],
  "gmReviewedSystemFinancialIssues": [
    "Review MGS/ServiceNow tickets related to Stay PMS reports, payment devices, authorizations, folios, ledgers, or audit issues",
    "Confirm workaround, owner, and expected resolution"
  ],
  "gmReviewedMGSEscalationDiscipline": [
    "Review open system/device tickets",
    "Confirm team is submitting tickets with screenshots, error messages, property code, system name, affected device/workstation, and steps already attempted"
  ],
}

// Helper function to get instructions for a specific task ID
export function getInstructions(taskId: string): string[] | null {
  return pmsInstructions[taskId] || null
}



