import { NextRequest, NextResponse } from 'next/server'
import { exportToGoogleSheets, type ChecklistExportData } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
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
    } = body
    
    // Validate required fields
    if (!checklistType || !associateName || !date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: checklistType, associateName, date' },
        { status: 400 }
      )
    }
    
    const exportData: ChecklistExportData = {
      checklistType,
      associateName,
      date,
      shiftStartTime,
      shiftEndTime,
      managerOnDuty,
      completedTasks: completedTasks || [],
      incompleteTasks: incompleteTasks || [],
      notes,
      supportingSystemsSummary,
      submittedAt: new Date().toISOString(),
    }
    
    const result = await exportToGoogleSheets(exportData)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Checklist exported to Google Sheets successfully',
        sheetUrl: result.sheetUrl,
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process export request' },
      { status: 500 }
    )
  }
}



