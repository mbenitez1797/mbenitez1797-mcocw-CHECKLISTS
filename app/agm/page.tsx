import { StreamlinedAGMForm } from "@/components/streamlined-agm-form"
import { SmartInventorySummary } from "@/components/smart-inventory-summary"

export const metadata = {
  title: "AGM Checklist | Front Desk Checklists",
  description: "Assistant General Manager daily checklist for hotel operations",
}

export default function AGMPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <SmartInventorySummary />
      <StreamlinedAGMForm />
    </div>
  )
}



