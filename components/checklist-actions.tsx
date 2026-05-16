"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FileSpreadsheet, Printer, Trash2, MoreVertical, Loader2, Check, ExternalLink } from "lucide-react"

interface ChecklistActionsProps {
  checklistType: 'am' | 'pm' | 'night' | 'admin' | 'agm' | 'gm' | 'sales' | 'housekeeping' | 'engineering'
  associateName: string
  date: string
  shiftStartTime?: string
  shiftEndTime?: string
  managerOnDuty?: string
  completedTasks: string[]
  incompleteTasks: string[]
  notes?: string
  supportingSystemsSummary?: {
    gxpOpenCases?: string
    gpsVipFollowUp?: string
    empowerResAppFollowUp?: string
    mgsServiceNowTickets?: string
    paymentDeviceKeyEncoderIssues?: string
    owner?: string
    nextAction?: string
  }
  onClearAll?: () => void
  className?: string
}

export function ChecklistActions({
  checklistType,
  associateName,
  date,
  shiftStartTime,
  shiftEndTime,
  managerOnDuty,
  completedTasks,
  incompleteTasks,
  notes,
  supportingSystemsSummary,
  onClearAll,
  className,
}: ChecklistActionsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [sheetUrl, setSheetUrl] = useState<string | null>(null)
  const [showClearDialog, setShowClearDialog] = useState(false)

  const checklistTypeLabels: Record<string, string> = {
    am: 'AM Shift',
    pm: 'PM Shift',
    night: 'Night Audit',
    admin: 'Admin',
    agm: 'AGM',
    gm: 'GM',
    sales: 'Sales',
    housekeeping: 'Housekeeping',
    engineering: 'Engineering',
  }

  const handleExportToSheets = async () => {
    setIsExporting(true)
    setExportError(null)
    setExportSuccess(false)

    try {
      const response = await fetch('/api/checklist/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistType,
          associateName,
          date,
          shiftStartTime,
          shiftEndTime,
          managerOnDuty,
          completedTasks,
          incompleteTasks,
          notes,
          supportingSystemsSummary,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setExportSuccess(true)
        setSheetUrl(result.sheetUrl)
        setTimeout(() => setExportSuccess(false), 3000)
      } else {
        setExportError(result.error || 'Export failed')
      }
    } catch (error) {
      setExportError('Failed to connect to export service')
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrintToPDF = () => {
    // Create a printable version of the checklist
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow popups to print the checklist')
      return
    }

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${checklistTypeLabels[checklistType]} Checklist - ${formattedDate}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto;
            color: #1a1a1a;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e5e5;
          }
          .header h1 { 
            font-size: 24px; 
            margin-bottom: 8px; 
            color: #0f172a;
          }
          .header p { color: #64748b; font-size: 14px; }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 16px; 
            margin-bottom: 30px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
          }
          .info-item { }
          .info-item label { 
            font-size: 12px; 
            color: #64748b; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-item p { font-size: 14px; font-weight: 500; margin-top: 4px; }
          .section { margin-bottom: 24px; }
          .section h2 { 
            font-size: 16px; 
            margin-bottom: 12px; 
            color: #0f172a;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e5e5;
          }
          .task-list { list-style: none; }
          .task-list li { 
            padding: 8px 0; 
            font-size: 14px;
            display: flex;
            align-items: flex-start;
            gap: 8px;
          }
          .task-list li::before { 
            content: ''; 
            width: 16px; 
            height: 16px; 
            border: 2px solid #e5e5e5;
            border-radius: 3px;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .task-list.completed li::before { 
            background: #22c55e; 
            border-color: #22c55e;
          }
          .task-list.incomplete li::before { 
            background: #fef2f2; 
            border-color: #fecaca;
          }
          .notes { 
            background: #fffbeb; 
            padding: 16px; 
            border-radius: 8px; 
            font-size: 14px;
            border-left: 4px solid #f59e0b;
          }
          .notes p { white-space: pre-wrap; }
          .supporting-systems {
            background: #f0f9ff;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #0ea5e9;
          }
          .supporting-systems h3 {
            font-size: 14px;
            margin-bottom: 12px;
            color: #0369a1;
          }
          .supporting-systems .item {
            margin-bottom: 8px;
          }
          .supporting-systems .item label {
            font-size: 12px;
            color: #64748b;
          }
          .supporting-systems .item p {
            font-size: 13px;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 12px; 
            color: #94a3b8;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${checklistTypeLabels[checklistType]} Front Desk Checklist</h1>
          <p>${formattedDate}</p>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <label>Associate Name</label>
            <p>${associateName || 'Not specified'}</p>
          </div>
          <div class="info-item">
            <label>Manager on Duty</label>
            <p>${managerOnDuty || 'Not specified'}</p>
          </div>
          <div class="info-item">
            <label>Shift Start</label>
            <p>${shiftStartTime || 'Not specified'}</p>
          </div>
          <div class="info-item">
            <label>Shift End</label>
            <p>${shiftEndTime || 'Not specified'}</p>
          </div>
        </div>
        
        ${completedTasks.length > 0 ? `
        <div class="section">
          <h2>Completed Tasks (${completedTasks.length})</h2>
          <ul class="task-list completed">
            ${completedTasks.map(task => `<li>${task}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${incompleteTasks.length > 0 ? `
        <div class="section">
          <h2>Incomplete Tasks (${incompleteTasks.length})</h2>
          <ul class="task-list incomplete">
            ${incompleteTasks.map(task => `<li>${task}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${notes ? `
        <div class="section">
          <h2>Notes</h2>
          <div class="notes">
            <p>${notes}</p>
          </div>
        </div>
        ` : ''}
        
        ${supportingSystemsSummary && Object.values(supportingSystemsSummary).some(v => v) ? `
        <div class="section">
          <h2>Supporting Systems Summary</h2>
          <div class="supporting-systems">
            ${supportingSystemsSummary.gxpOpenCases ? `
            <div class="item">
              <label>GXP Open Cases</label>
              <p>${supportingSystemsSummary.gxpOpenCases}</p>
            </div>
            ` : ''}
            ${supportingSystemsSummary.gpsVipFollowUp ? `
            <div class="item">
              <label>GPS VIP Follow-Up</label>
              <p>${supportingSystemsSummary.gpsVipFollowUp}</p>
            </div>
            ` : ''}
            ${supportingSystemsSummary.mgsServiceNowTickets ? `
            <div class="item">
              <label>MGS/ServiceNow Tickets</label>
              <p>${supportingSystemsSummary.mgsServiceNowTickets}</p>
            </div>
            ` : ''}
            ${supportingSystemsSummary.owner ? `
            <div class="item">
              <label>Owner</label>
              <p>${supportingSystemsSummary.owner}</p>
            </div>
            ` : ''}
            ${supportingSystemsSummary.nextAction ? `
            <div class="item">
              <label>Next Action</label>
              <p>${supportingSystemsSummary.nextAction}</p>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
  }

  const handleClearAll = () => {
    setShowClearDialog(false)
    onClearAll?.()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <MoreVertical className="w-4 h-4 mr-2" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleExportToSheets} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : exportSuccess ? (
              <Check className="w-4 h-4 mr-2 text-green-600" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 mr-2" />
            )}
            {isExporting ? 'Exporting...' : exportSuccess ? 'Exported!' : 'Export to Google Sheets'}
          </DropdownMenuItem>
          
          {sheetUrl && (
            <DropdownMenuItem asChild>
              <a href={sheetUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Spreadsheet
              </a>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={handlePrintToPDF}>
            <Printer className="w-4 h-4 mr-2" />
            Print / Save as PDF
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowClearDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {exportError && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg text-sm">
          {exportError}
        </div>
      )}

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Checklist Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all entered data and reset the checklist to its initial state. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}



