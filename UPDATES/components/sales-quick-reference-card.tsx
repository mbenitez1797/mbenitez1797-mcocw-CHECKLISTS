"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ExternalLink, Target, Users, Building2, Plane, Link2, Smartphone, MessageSquare, UserCheck, Wrench } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const salesSystems = [
  {
    name: "OneSource",
    icon: Target,
    useFor: "New leads, emergency response leads, last-minute group opportunities, lead follow-up.",
    path: "Open OneSource > review new leads > sort by arrival date > prioritize short-term arrivals and emergency response leads > document action taken.",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    name: "CI / SFAWeb",
    icon: Users,
    useFor: "Lead management, opportunity/quote management, response status, group/event details, data quality, sales process tracking.",
    path: "Open CI or SFAWeb > search opportunity or quote > review customer, dates, rooms, function space, response status, business type, group type, and required fields > update as needed.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    name: "Stay PMS",
    icon: Building2,
    useFor: "Group bookings, group room control, function room calendar, group billing/routing, group codes, group pickup, room block review.",
    path: "Open Stay PMS > use Groups, Dashboard > Group Rooms Control, Function Room Calendar, or guest/group reservation as needed.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    name: "Amadeus CRS",
    icon: Plane,
    useFor: "CRS confirmation verification, group interface validation, CRS visibility, group block data review where access allows.",
    path: "Open Amadeus CRS > search group or confirmation if access permits > verify group interface or CRS-related details. If view-only, document findings and escalate edits to the correct role.",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    name: "ResLink",
    icon: Link2,
    useFor: "Guest booking links for groups, secure guest reservations, group code validation, ResLink troubleshooting.",
    path: "Open ResLink > use correct Stay PMS group code > confirm group has interfaced to Amadeus CRS > create or review booking link according to property process.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    name: "Empower ResApp",
    icon: Smartphone,
    useFor: "Future individual reservations, individual reservation modifications, confirmation emails.",
    path: "Open Empower ResApp > search by guest name, confirmation number, or Bonvoy number > create/modify future individual reservations or send confirmation emails as permitted. Do not create future-dated individual reservations in Stay PMS.",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    name: "GXP",
    icon: MessageSquare,
    useFor: "Group/VIP guest requests, complaints, amenities, service recovery, sales-related guest follow-up.",
    path: "Open GXP > search by guest name, room number, group, or case status > review open cases, requests, amenities, complaints, and owner > update status before handoff.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    name: "GPS",
    icon: UserCheck,
    useFor: "VIP, elite, repeat guest, high-touch group contact preferences and recognition opportunities.",
    path: "Open GPS > search guest by name, Bonvoy number, or confirmation number > review preferences, history, recognition notes, and relevant service details > communicate useful operational items only.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    name: "MGS / ServiceNow",
    icon: Wrench,
    useFor: "System issues, access issues, Stay PMS errors, ResLink errors, Amadeus CRS issues, CI/SFAWeb issues, payment/key device issues if sales is involved.",
    path: "Open MGS or Marriott Service Portal / ServiceNow > search KB if needed > submit ticket with property code, system name, screenshots, error message, affected group/reservation, date/time, and steps already attempted.",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
  },
]

export function SalesQuickReferenceCard() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-amber-900 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Sales Manager Quick Reference
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Hide Systems
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show Systems
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-amber-700">
          Reference guide for sales-related systems - click to expand for detailed paths
        </p>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-2">
          <div className="grid gap-3">
            {salesSystems.map((system) => {
              const Icon = system.icon
              return (
                <div
                  key={system.name}
                  className={`rounded-lg p-3 ${system.bgColor} border border-${system.color.replace('text-', '')}/20`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                      <Icon className={`w-5 h-5 ${system.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${system.color}`}>{system.name}</h4>
                        <ExternalLink className={`w-3 h-3 ${system.color} opacity-60`} />
                      </div>
                      <p className="text-sm text-foreground/80 mb-2">
                        <span className="font-medium">Use for:</span> {system.useFor}
                      </p>
                      <p className="text-xs text-foreground/60 bg-white/50 rounded p-2">
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



