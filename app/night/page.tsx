import { StreamlinedNightForm } from "@/components/streamlined-night-form"
import { SmartInventorySummary } from "@/components/smart-inventory-summary"

export const metadata = {
  title: "Night Audit Checklist | Front Desk Checklists",
  description: "Night Audit daily checklist for hotel operations",
}

export default function NightPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <SmartInventorySummary />
      <StreamlinedNightForm />
    </div>
  )
}



