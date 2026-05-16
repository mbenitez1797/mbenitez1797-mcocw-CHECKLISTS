"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Monitor, MessageSquare, User, Calendar, Headphones, CreditCard, Key, Smartphone } from "lucide-react"

const systems = [
  {
    name: "Stay PMS",
    icon: Monitor,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    useFor: "Arrivals, departures, in-house guests, room inventory, check-in/out, folios, payments, reservations.",
    path: "Open Stay PMS > Front Desk/Home page or Dashboard > Select tile for Arrivals, Departures, In-House, or Rooms."
  },
  {
    name: "GXP",
    icon: MessageSquare,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    useFor: "Guest requests, cases, complaints, service recovery, maintenance follow-up, amenities, wake-up calls.",
    path: "Open GXP > Search guest by name or room number > Review open cases, requests, traces, complaints > Update status, notes, owner before handoff."
  },
  {
    name: "GPS",
    icon: User,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    useFor: "Guest planning, loyalty/preference review, elite/VIP notes, guest profile details, stay history, preferences.",
    path: "Open GPS > Search guest by name, Bonvoy number, or confirmation number > Review preferences, elite status, notes, stay history > Document useful items in handoff."
  },
  {
    name: "Empower ResApp",
    icon: Calendar,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    useFor: "Future individual reservations, reservation modifications, confirmation emails, reservation support outside same-day operations.",
    path: "Open Empower ResApp > Search by confirmation number, guest name, or Bonvoy number > Modify future reservation or resend confirmation. Do not create future reservations in Stay PMS."
  },
  {
    name: "MGS / ServiceNow",
    icon: Headphones,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950",
    useFor: "System issues, device issues, access issues, Stay PMS errors, payment device problems, key encoder issues.",
    path: "Open MGS or ServiceNow > Search KB if needed > Create ticket with property code, system name, screenshots, error message, affected guest, date/time, steps attempted."
  },
  {
    name: "Payment Device / FreedomPay",
    icon: CreditCard,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    useFor: "Lane/SRED payment device issues, missing card reader, failed authorization, payment device troubleshooting.",
    path: "Confirm device is connected > Retry payment through approved Lane/SRED device > Do not manually enter CC auth > If error continues, notify MOD and submit MGS ticket."
  },
  {
    name: "Key Encoder",
    icon: Key,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
    useFor: "Physical key issues, encoder errors, key copy issues.",
    path: "In Stay PMS, open reservation > Select Key tile > Review key status. For encoder error, restart encoder first. If issue continues, escalate via MGS with screenshots."
  },
  {
    name: "Mobile Key",
    icon: Smartphone,
    color: "text-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-950",
    useFor: "Mobile key validation issues, digital key status, app-based key troubleshooting.",
    path: "In Stay PMS, open reservation > Select Key tile > Review digital key status > Look for VAL badge > Complete validation before issuing key."
  },
]

export function QuickReferenceCard() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="mb-6 border-2 border-primary/20">
      <CardHeader 
        className="cursor-pointer pb-3" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            Where to Find It - Quick Reference
          </CardTitle>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        {!isExpanded && (
          <p className="text-sm text-muted-foreground mt-1">
            Tap to expand system reference guide
          </p>
        )}
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid gap-4">
            {systems.map((system) => {
              const Icon = system.icon
              return (
                <div 
                  key={system.name} 
                  className={`rounded-lg p-4 ${system.bgColor}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${system.color} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold ${system.color}`}>{system.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Use for:</span> {system.useFor}
                      </p>
                      <p className="text-sm text-foreground mt-2">
                        <span className="font-medium">Path:</span> {system.path}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      )}
    </Card>
  )
}



