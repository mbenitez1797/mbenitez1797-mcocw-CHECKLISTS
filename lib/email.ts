import { Resend } from 'resend'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

export type ChecklistType = 'am' | 'pm' | 'night' | 'admin' | 'agm' | 'gm' | 'sales' | 'housekeeping' | 'engineering'

const checklistNames: Record<ChecklistType, string> = {
  am: 'AM Front Desk Daily Checklist',
  pm: 'PM Front Desk Daily Checklist',
  night: 'Night Audit Daily Checklist',
  admin: 'Admin Daily Checklist',
  agm: 'AGM Daily Checklist',
  gm: 'GM Daily Checklist',
  sales: 'Sales Daily Checklist',
  housekeeping: 'Housekeeping Daily Checklist',
  engineering: 'Engineering Daily Checklist',
}

export interface ChecklistSubmission {
  checklistType: ChecklistType
  associateName: string
  date: string
  shiftStartTime: string
  shiftEndTime: string
  managerOnDuty: string
  data: Record<string, unknown>
  submittedAt: string
}

function formatChecklistDataForEmail(data: Record<string, unknown>): string {
  let html = ''
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === '') continue
    
    const formattedKey = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
    
    if (Array.isArray(value)) {
      if (value.length > 0) {
        html += `<p><strong>${formattedKey}:</strong></p><ul>`
        for (const item of value) {
          html += `<li>${item}</li>`
        }
        html += '</ul>'
      }
    } else if (typeof value === 'object') {
      html += `<p><strong>${formattedKey}:</strong></p>`
      html += formatChecklistDataForEmail(value as Record<string, unknown>)
    } else {
      html += `<p><strong>${formattedKey}:</strong> ${value}</p>`
    }
  }
  
  return html
}

export async function sendChecklistEmail(submission: ChecklistSubmission): Promise<{ success: boolean; error?: string }> {
  const recipientEmails = process.env.CHECKLIST_RECIPIENT_EMAILS?.split(',').map(e => e.trim()) || []
  
  if (recipientEmails.length === 0) {
    console.error('No recipient emails configured')
    return { success: false, error: 'No recipient emails configured' }
  }

  const checklistName = checklistNames[submission.checklistType]
  const subject = `${checklistName} - ${submission.associateName} - ${submission.date}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
        .header { background-color: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; }
        .section { margin-bottom: 20px; padding: 15px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb; }
        .section-title { font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
        .meta-item { background-color: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb; }
        .meta-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
        .meta-value { font-size: 14px; font-weight: 600; color: #111827; }
        ul { margin: 5px 0; padding-left: 20px; }
        li { margin: 3px 0; }
        p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">${checklistName}</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Submitted on ${new Date(submission.submittedAt).toLocaleString()}</p>
      </div>
      <div class="content">
        <div class="meta">
          <div class="meta-item">
            <div class="meta-label">Associate Name</div>
            <div class="meta-value">${submission.associateName}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Date</div>
            <div class="meta-value">${submission.date}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Shift Time</div>
            <div class="meta-value">${submission.shiftStartTime} - ${submission.shiftEndTime}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Manager on Duty</div>
            <div class="meta-value">${submission.managerOnDuty}</div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Checklist Details</div>
          ${formatChecklistDataForEmail(submission.data)}
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const resend = getResendClient()
    if (!resend) {
      return { success: false, error: 'RESEND_API_KEY is not configured' }
    }

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Checklist System <onboarding@resend.dev>',
      to: recipientEmails,
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}



