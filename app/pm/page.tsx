import { StreamlinedPMForm } from "@/components/streamlined-pm-form"
import { SmartInventorySummary } from "@/components/smart-inventory-summary"
import { ChecklistBrowserAutosave } from "@/components/checklist-browser-autosave"

export const metadata = {
  title: "PM Front Desk Checklist | Front Desk Checklists",
  description: "PM Front Desk daily checklist for hotel operations",
}

export default function PMPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <SmartInventorySummary />
      <ChecklistBrowserAutosave checklistType="pm" title="PM Front Desk Checklist" cutoffLabel="11:00 PM" />
      <StreamlinedPMForm />
    </div>
  )
}
