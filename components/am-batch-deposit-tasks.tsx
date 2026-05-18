"use client"

import { useState } from "react"
import { CreditCard, MessageSquare } from "lucide-react"
import { ChecklistSection, ChecklistTask } from "@/components/checklist-task"

export function AMBatchDepositTasks() {
  const [batchDepositsCollected, setBatchDepositsCollected] = useState(false)
  const [dayOfDepositsPrepared, setDayOfDepositsPrepared] = useState(false)
  const [gxpGpsReviewed, setGxpGpsReviewed] = useState(false)

  return (
    <ChecklistSection
      title="Deposits, Incidentals, and GXP/GPS Standards"
      description="Complete deposit processing, prepare incidental folios, and review GXP/GPS follow-up before the shift gets spicy."
    >
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <div className="flex items-start gap-2">
          <CreditCard className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">Deposit Workflow</div>
            <p className="mt-1">
              Complete scheduled batch deposits first. Then review day-of arrivals for virtual cards, blank subtype cards, third-party reservations, and redemption stays that need manual payment or incidental folio setup.
            </p>
          </div>
        </div>
      </div>

      <ChecklistTask
        id="collectBatchDeposits"
        label="Collect all scheduled deposits through Batch Operations"
        instruction="Stay PMS > Front Desk > Batch Operations > Deposits To > Select All > Run. Confirm successful deposits. Review any kickbacks; Expedia or same-day third-party reservations may not allow same-day charging, so note them for manual follow-up."
        expandedInstruction="Go to Front Desk, then Batch Operations, then Deposits To. Select all deposit-eligible reservations and run the batch. Review any kicked-back deposits. Expedia reservations commonly fail because they cannot be charged on the same day, so they should be tracked for manual/day-of follow-up."
        systems={["Stay PMS", "Ledger"]}
        checked={batchDepositsCollected}
        onCheckedChange={setBatchDepositsCollected}
      />

      <ChecklistTask
        id="collectDayOfDeposits"
        label="Collect day-of deposits and prepare incidental folios"
        instruction="Stay PMS > Front Desk > Batch Operations > Check-In > review the Subtype Card. Look for arrivals where subtype says Virtual Card or is blank. These are usually third-party reservations or redemption stays. Open each reservation, manually take the required payment/deposit, then create the incidental folio by going to Routing Rules and adding Incidentals Only."
        expandedInstruction="Go to Stay PMS > Front Desk > Batch Operations > Check-In. Scan the Subtype Card and prioritize reservations marked Virtual Card or with a blank subtype. For each one, open the reservation, verify the payment source, manually take the required payment/deposit when appropriate, then go to Routing Rules and add Incidentals Only to create the incidental folio."
        systems={["Stay PMS", "Ledger"]}
        checked={dayOfDepositsPrepared}
        onCheckedChange={setDayOfDepositsPrepared}
      />

      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
        <div className="flex items-start gap-2">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">GXP / GPS Daily Standard</div>
            <p className="mt-1">
              GXP and GPS should be reviewed every shift for guest requests, defects, CEC items, amenities, work orders, arrival recognition, and unresolved follow-up.
            </p>
          </div>
        </div>
      </div>

      <ChecklistTask
        id="reviewGxpGpsStandards"
        label="Review GXP/GPS cases, guest recognition, and follow-up"
        instruction="Open GXP and GPS. Review open guest and associate-facing cases, requests, defects, amenities, CEC items, work orders, and follow-up items. Review GPS Highly Actionable arrivals, guest preferences, repeat guest history, prior service opportunities, and negative case history. Close resolved requests/defects within priority standards, keep CEC cases on track for 72-hour resolution, and include unresolved trends in line-up or handoff."
        expandedInstruction="Minimum standard: create, manage, and close guest-related cases including amenities, service requests, guest-identified defects, and problem resolution. Create and manage property-related cases including Marriott Bonvoy support, missing stay/redemption certificate issues, associate-reported requests, product defects, security incidents, and work orders. Use GXP reports/dashboards and GPS pre-arrival planning to identify recurring issues, recognize repeat guests, and prevent repeat service failures."
        systems={["GXP", "GPS", "Reports"]}
        checked={gxpGpsReviewed}
        onCheckedChange={setGxpGpsReviewed}
      />
    </ChecklistSection>
  )
}
