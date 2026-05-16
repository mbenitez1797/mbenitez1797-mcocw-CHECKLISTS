"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MessageSquare, User, Calendar, Headphones, CreditCard, Key, Smartphone } from "lucide-react"

interface SupportingSystemsData {
  gxpOpenCases: string
  gpsVipFollowUp: string
  empowerResAppFollowUp: string
  mgsServiceNowTickets: string
  paymentDeviceKeyEncoderIssues: string
  owner: string
  nextAction: string
}

interface SupportingSystemsSummaryProps {
  value: SupportingSystemsData
  onChange: (value: SupportingSystemsData) => void
}

export function SupportingSystemsSummary({ value, onChange }: SupportingSystemsSummaryProps) {
  const handleChange = (field: keyof SupportingSystemsData, newValue: string) => {
    onChange({ ...value, [field]: newValue })
  }

  return (
    <Card className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Headphones className="h-5 w-5" />
          Supporting Systems Follow-Up Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Document all open items from supporting systems before handoff
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* GXP Open Cases */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4 text-purple-600" />
            GXP Open Cases
          </Label>
          <Textarea
            placeholder="List open GXP cases: guest name, room #, issue, due time..."
            value={value.gxpOpenCases}
            onChange={(e) => handleChange("gxpOpenCases", e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* GPS/VIP Follow-Up */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4 text-green-600" />
            GPS/VIP Follow-Up
          </Label>
          <Textarea
            placeholder="VIP/elite preference items, recognition follow-ups..."
            value={value.gpsVipFollowUp}
            onChange={(e) => handleChange("gpsVipFollowUp", e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Empower ResApp Follow-Up */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-orange-600" />
            Empower ResApp Follow-Up
          </Label>
          <Textarea
            placeholder="Future reservation issues, confirmation requests..."
            value={value.empowerResAppFollowUp}
            onChange={(e) => handleChange("empowerResAppFollowUp", e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* MGS/ServiceNow Tickets */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Headphones className="h-4 w-4 text-red-600" />
            MGS/ServiceNow Tickets
          </Label>
          <Textarea
            placeholder="Ticket #, system affected, issue, workaround, status..."
            value={value.mgsServiceNowTickets}
            onChange={(e) => handleChange("mgsServiceNowTickets", e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Payment Device / Key Encoder Issues */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <div className="flex gap-1">
              <CreditCard className="h-4 w-4 text-amber-600" />
              <Key className="h-4 w-4 text-cyan-600" />
              <Smartphone className="h-4 w-4 text-teal-600" />
            </div>
            Payment Device / Key Encoder / Mobile Key Issues
          </Label>
          <Textarea
            placeholder="Device issues, workarounds in place, pending resolution..."
            value={value.paymentDeviceKeyEncoderIssues}
            onChange={(e) => handleChange("paymentDeviceKeyEncoderIssues", e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Owner and Next Action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Owner</Label>
            <Input
              placeholder="Who is responsible for follow-up?"
              value={value.owner}
              onChange={(e) => handleChange("owner", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Next Action</Label>
            <Input
              placeholder="What is the next step?"
              value={value.nextAction}
              onChange={(e) => handleChange("nextAction", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Default empty state for supporting systems data
export const defaultSupportingSystemsData: SupportingSystemsData = {
  gxpOpenCases: "",
  gpsVipFollowUp: "",
  empowerResAppFollowUp: "",
  mgsServiceNowTickets: "",
  paymentDeviceKeyEncoderIssues: "",
  owner: "",
  nextAction: "",
}

export type { SupportingSystemsData }



