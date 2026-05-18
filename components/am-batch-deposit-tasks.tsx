"use client"

import { useState } from "react"
import { CreditCard } from "lucide-react"
import { ChecklistSection, ChecklistTask } from "@/components/checklist-task"

export function AMBatchDepositTasks() {
  const [batchDepositsCollected, setBatchDepositsCollected] = useState(false)
  const [dayOfDepositsPrepared, setDayOfDepositsPrepared] = useState(false)

  return (
    <ChecklistSection
      title="Batch Deposit Processing"
      description="Page 2 AM focus: collect scheduled deposits first, then clean up day-of deposits before arrivals hit the desk. Because nothing says 'welcome' like discovering payment chaos at check-in."
    >
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <div className="flex items-start gap-2">
          <CreditCard className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">AM Deposit Workflow</div>
            <p className="mt-1">
              Complete batch processing first. Then review day-of arrivals for virtual cards, blank subtype cards, third-party reservations, and redemption stays that need manual payment or incidental folio setup.
            </p>
          </div>
        </div>
      </div>

      <ChecklistTask
        id="collectBatchDeposits"
        label="Collect all scheduled deposits through Batch Operations"
        instruction="Stay PMS > Front Desk > Batch Operations > Deposits To > Select All > Run. Confirm successful deposits. Any kickbacks are usually Expedia reservations that cannot be charged the same day; note them for manual review instead of wrestling the PMS like it owes you money."
        expandedInstruction="Go to Front Desk, then Batch Operations, then Deposits To. Select all deposit-eligible reservations and run the batch. Review any kicked-back deposits. Expedia reservations commonly fail because they cannot be charged on the same day, so they should be tracked for manual/day-of follow-up."
        systems={["Stay PMS", "Ledger"]}
        checked={batchDepositsCollected}
        onCheckedChange={setBatchDepositsCollected}
      />

      <ChecklistTask
        id="collectDayOfDeposits"
        label="Collect day-of deposits and prepare incidental folios"
        instruction="Stay PMS > Front Desk > Batch Operations > Check-In > review the Subtype Card. Look for arrivals where subtype says Virtual Card or is blank. These are usually third-party reservations or redemption stays. Open each reservation, manually take the required payment/deposit, then create the incidental folio by going to Routing Rules and adding Incidentals Only. This keeps check-in from becoming a tiny financial hostage situation."
        expandedInstruction="Go to Stay PMS > Front Desk > Batch Operations > Check-In. Scan the Subtype Card and prioritize reservations marked Virtual Card or with a blank subtype. For each one, open the reservation, verify the payment source, manually take the required payment/deposit when appropriate, then go to Routing Rules and add Incidentals Only to create the incidental folio."
        systems={["Stay PMS", "Ledger"]}
        checked={dayOfDepositsPrepared}
        onCheckedChange={setDayOfDepositsPrepared}
      />
    </ChecklistSection>
  )
}
