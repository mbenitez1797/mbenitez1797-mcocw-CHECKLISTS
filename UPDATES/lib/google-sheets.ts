/**
 * Google Sheets Integration for Checklist Export
 * 
 * ==========================================
 * SETUP INSTRUCTIONS FOR GOOGLE CLOUD
 * ==========================================
 * 
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 
 * 2. Create a new project or select an existing one
 * 
 * 3. Enable the Google Sheets API:
 *    - Go to "APIs & Services" > "Library"
 *    - Search for "Google Sheets API"
 *    - Click "Enable"
 * 
 * 4. Create a Service Account:
 *    - Go to "APIs & Services" > "Credentials"
 *    - Click "Create Credentials" > "Service Account"
 *    - Give it a name (e.g., "checklist-export")
 *    - Click "Create and Continue"
 *    - Skip the optional steps and click "Done"
 * 
 * 5. Create a Service Account Key:
 *    - Click on your new service account
 *    - Go to "Keys" tab
 *    - Click "Add Key" > "Create new key"
 *    - Select "JSON" and click "Create"
 *    - A JSON file will download - keep this safe!
 * 
 * 6. Share your Google Sheet:
 *    - Create a new Google Sheet (or use existing)
 *    - Click "Share" button
 *    - Add the service account email (found in the JSON file as "client_email")
 *    - Give it "Editor" access
 *    - Copy the Sheet ID from the URL (the long string between /d/ and /edit)
 * 
 * 7. Set Environment Variables:
 *    - GOOGLE_SERVICE_ACCOUNT_EMAIL: The "client_email" from the JSON file
 *    - GOOGLE_PRIVATE_KEY: The "private_key" from the JSON file (include the full key with -----BEGIN/END-----)
 *    - GOOGLE_SPREADSHEET_ID: The ID from your Google Sheet URL
 * 
 * Example Sheet URL: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * The Sheet ID would be: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
 */

import { google } from 'googleapis'

// Type definitions
export interface ChecklistExportData {
  checklistType: 'am' | 'pm' | 'night' | 'admin' | 'agm' | 'gm'
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
  submittedAt: string
}

// Initialize the Google Sheets API client
function getGoogleSheetsClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  
  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Google Sheets credentials not configured. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.')
  }
  
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  
  return google.sheets({ version: 'v4', auth })
}

// Get the spreadsheet ID from environment
function getSpreadsheetId(): string {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
  
  if (!spreadsheetId) {
    throw new Error('Google Spreadsheet ID not configured. Please set GOOGLE_SPREADSHEET_ID environment variable.')
  }
  
  return spreadsheetId
}

// Get or create a sheet for the specific checklist type
async function getOrCreateSheet(sheets: ReturnType<typeof google.sheets>, spreadsheetId: string, sheetName: string) {
  try {
    // Get all sheets in the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    })
    
    const existingSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === sheetName
    )
    
    if (existingSheet) {
      return existingSheet.properties?.sheetId
    }
    
    // Create the sheet if it doesn't exist
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    })
    
    const newSheetId = response.data.replies?.[0]?.addSheet?.properties?.sheetId
    
    // Add headers to the new sheet
    const headers = [
      'Submitted At',
      'Date',
      'Associate Name',
      'Shift Start',
      'Shift End',
      'Manager on Duty',
      'Completed Tasks',
      'Incomplete Tasks',
      'Notes',
      'GXP Open Cases',
      'GPS VIP Follow-Up',
      'Empower ResApp Follow-Up',
      'MGS/ServiceNow Tickets',
      'Payment/Device Issues',
      'Owner',
      'Next Action',
    ]
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:P1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    })
    
    // Format the header row (bold, background color)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: newSheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.4, blue: 0.6 },
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId: newSheetId,
                gridProperties: { frozenRowCount: 1 },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      },
    })
    
    return newSheetId
  } catch (error) {
    console.error('Error getting/creating sheet:', error)
    throw error
  }
}

// Format checklist type for sheet name
function getSheetName(checklistType: string): string {
  const names: Record<string, string> = {
    am: 'AM Shift',
    pm: 'PM Shift',
    night: 'Night Audit',
    admin: 'Admin',
    agm: 'AGM',
    gm: 'GM',
  }
  return names[checklistType] || checklistType.toUpperCase()
}

// Export checklist data to Google Sheets
export async function exportToGoogleSheets(data: ChecklistExportData): Promise<{ success: boolean; error?: string; sheetUrl?: string }> {
  try {
    const sheets = getGoogleSheetsClient()
    const spreadsheetId = getSpreadsheetId()
    const sheetName = getSheetName(data.checklistType)
    
    // Ensure the sheet exists
    await getOrCreateSheet(sheets, spreadsheetId, sheetName)
    
    // Format the row data
    const row = [
      data.submittedAt,
      data.date,
      data.associateName,
      data.shiftStartTime || '',
      data.shiftEndTime || '',
      data.managerOnDuty || '',
      data.completedTasks.join(', '),
      data.incompleteTasks.join(', '),
      data.notes || '',
      data.supportingSystemsSummary?.gxpOpenCases || '',
      data.supportingSystemsSummary?.gpsVipFollowUp || '',
      data.supportingSystemsSummary?.empowerResAppFollowUp || '',
      data.supportingSystemsSummary?.mgsServiceNowTickets || '',
      data.supportingSystemsSummary?.paymentDeviceKeyEncoderIssues || '',
      data.supportingSystemsSummary?.owner || '',
      data.supportingSystemsSummary?.nextAction || '',
    ]
    
    // Append the row to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:P`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    })
    
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`
    
    return { success: true, sheetUrl }
  } catch (error) {
    console.error('Error exporting to Google Sheets:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export to Google Sheets',
    }
  }
}

// Get all submissions from a specific sheet
export async function getSubmissionsFromSheet(checklistType: string): Promise<{ success: boolean; data?: string[][]; error?: string }> {
  try {
    const sheets = getGoogleSheetsClient()
    const spreadsheetId = getSpreadsheetId()
    const sheetName = getSheetName(checklistType)
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:P`,
    })
    
    return { success: true, data: response.data.values as string[][] }
  } catch (error) {
    console.error('Error reading from Google Sheets:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read from Google Sheets',
    }
  }
}



