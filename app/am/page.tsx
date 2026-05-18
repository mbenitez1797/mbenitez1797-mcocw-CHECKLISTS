import { StreamlinedAMForm } from "@/components/streamlined-am-form"
import { SmartInventorySummary } from "@/components/smart-inventory-summary"
import { ChecklistBrowserAutosave } from "@/components/checklist-browser-autosave"

export const metadata = {
  title: "AM Front Desk Checklist | Front Desk Checklists",
  description: "AM Front Desk daily checklist for hotel operations",
}

export default function AMPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <SmartInventorySummary />
      <ChecklistBrowserAutosave checklistType="am" title="AM Front Desk Checklist" cutoffLabel="3:00 PM" />
      <StreamlinedAMForm />
    </div>
  )
}
