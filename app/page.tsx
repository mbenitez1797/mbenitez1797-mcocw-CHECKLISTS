import { SmartInventorySummary } from "@/components/smart-inventory-summary"
import Link from "next/link"
import { Sun, Sunset, Moon, ClipboardList, UserCog, Crown, Target, Sparkles, Wrench } from "lucide-react"

const frontDeskShifts = [
  {
    name: "AM Shift",
    description: "7:00 AM - 3:00 PM",
    longDescription: "Prepare departures, keep Stay PMS clean, communicate with housekeeping, and make PM check-ins smooth.",
    href: "/am",
    icon: Sun,
    color: "bg-amber-50 border-amber-200 hover:border-amber-300",
    iconColor: "text-amber-600",
  },
  {
    name: "PM Shift",
    description: "3:00 PM - 11:00 PM",
    longDescription: "Manage arrivals smoothly, protect room inventory, resolve guest/payment issues, prepare handoff for night crew.",
    href: "/pm",
    icon: Sunset,
    color: "bg-orange-50 border-orange-200 hover:border-orange-300",
    iconColor: "text-orange-600",
  },
  {
    name: "Night Audit",
    description: "11:00 PM - 7:00 AM",
    longDescription: "Manage late arrivals, review payments and folios, complete audit, prepare reports, and leave clear AM handoff.",
    href: "/night",
    icon: Moon,
    color: "bg-indigo-50 border-indigo-200 hover:border-indigo-300",
    iconColor: "text-indigo-600",
  },
]

const operationsChecklists = [
  {
    name: "Housekeeping",
    description: "Housekeeping Manager",
    longDescription: "Manage room board alignment, PM/OOO status, rush room coordination, and turnover reporting with Front Desk.",
    href: "/housekeeping",
    icon: Sparkles,
    color: "bg-pink-50 border-pink-200 hover:border-pink-300",
    iconColor: "text-pink-600",
  },
  {
    name: "Engineering",
    description: "Engineering/Maintenance",
    longDescription: "Track work orders, OOO room status, PM schedules, safety systems, and escalation coordination.",
    href: "/engineering",
    icon: Wrench,
    color: "bg-gray-50 border-gray-200 hover:border-gray-300",
    iconColor: "text-gray-600",
  },
]

const leadershipChecklists = [
  {
    name: "Admin",
    description: "Operations Admin",
    longDescription: "Verify clean reservations, correct billing, accurate reports, guest follow-up, group readiness, and smooth handoff.",
    href: "/admin",
    icon: ClipboardList,
    color: "bg-purple-50 border-purple-200 hover:border-purple-300",
    iconColor: "text-purple-600",
  },
  {
    name: "Sales Manager",
    description: "Sales & Groups",
    longDescription: "Manage leads, groups, events, room blocks, ResLink needs, billing/routing, data quality, and operational handoff.",
    href: "/sales",
    icon: Target,
    color: "bg-amber-50 border-amber-200 hover:border-amber-300",
    iconColor: "text-amber-600",
  },
  {
    name: "AGM",
    description: "Assistant GM",
    longDescription: "Verify operational readiness, front desk execution, inventory control, billing exceptions, and housekeeping alignment.",
    href: "/agm",
    icon: UserCog,
    color: "bg-teal-50 border-teal-200 hover:border-teal-300",
    iconColor: "text-teal-600",
  },
  {
    name: "GM",
    description: "General Manager",
    longDescription: "Review daily hotel readiness, guest impact, financial exceptions, inventory risk, and team accountability.",
    href: "/gm",
    icon: Crown,
    color: "bg-slate-100 border-slate-300 hover:border-slate-400",
    iconColor: "text-slate-700",
  },
]

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">
            Front Desk Daily Checklist
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">
            Select your shift or role to complete the daily checklist. Each checklist ensures proper handoff between shifts and maintains Stay PMS accuracy.
          </p>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border max-w-xl mx-auto">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Room Assignment Rule:</strong> Do not pre-assign all arrivals. Standard arrivals should remain unassigned so the desk has flexibility based on who arrives first. Only pre-assign true priority arrivals.
            </p>
          </div>
        </header>

        <section className="mb-8">
          <SmartInventorySummary />
        </section>

        {/* Front Desk Shifts */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Front Desk Shifts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {frontDeskShifts.map((shift) => {
              const Icon = shift.icon
              return (
                <Link
                  key={shift.name}
                  href={shift.href}
                  className={`group flex flex-col p-6 rounded-xl border-2 transition-all duration-200 ${shift.color}`}
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                    <Icon className={`w-6 h-6 ${shift.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">{shift.name}</h3>
                  <p className="text-sm font-medium text-muted-foreground mb-3">{shift.description}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{shift.longDescription}</p>
                  <div className="mt-4 text-sm font-medium text-foreground group-hover:underline">
                    Start Checklist
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Operations Checklists */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Operations Checklists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {operationsChecklists.map((checklist) => {
              const Icon = checklist.icon
              return (
                <Link
                  key={checklist.name}
                  href={checklist.href}
                  className={`group flex flex-col p-6 rounded-xl border-2 transition-all duration-200 ${checklist.color}`}
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                    <Icon className={`w-6 h-6 ${checklist.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">{checklist.name}</h3>
                  <p className="text-sm font-medium text-muted-foreground mb-3">{checklist.description}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{checklist.longDescription}</p>
                  <div className="mt-4 text-sm font-medium text-foreground group-hover:underline">
                    Start Checklist
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Leadership Checklists */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Leadership Checklists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadershipChecklists.map((checklist) => {
              const Icon = checklist.icon
              return (
                <Link
                  key={checklist.name}
                  href={checklist.href}
                  className={`group flex flex-col p-6 rounded-xl border-2 transition-all duration-200 ${checklist.color}`}
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                    <Icon className={`w-6 h-6 ${checklist.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">{checklist.name}</h3>
                  <p className="text-sm font-medium text-muted-foreground mb-3">{checklist.description}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{checklist.longDescription}</p>
                  <div className="mt-4 text-sm font-medium text-foreground group-hover:underline">
                    Start Checklist
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}






