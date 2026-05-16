import { NextRequest, NextResponse } from 'next/server'
import { sendChecklistEmail, type ChecklistSubmission, type ChecklistType } from '@/lib/email'
import { saveChecklistToOneDrive } from '@/lib/onedrive'

const validChecklistTypes: ChecklistType[] = ['am', 'pm', 'night', 'admin', 'agm', 'gm', 'sales', 'housekeeping', 'engineering']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { checklistType, associateName, date, shiftStartTime, shiftEndTime, managerOnDuty, data } = body

    // Validate required fields
    if (!checklistType || !validChecklistTypes.includes(checklistType)) {
      return NextResponse.json(
        { error: 'Invalid checklist type' },
        { status: 400 }
      )
    }

    if (!associateName || !date || !shiftStartTime || !shiftEndTime || !managerOnDuty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const submission: ChecklistSubmission = {
      checklistType,
      associateName,
      date,
      shiftStartTime,
      shiftEndTime,
      managerOnDuty,
      data,
      submittedAt: new Date().toISOString(),
    }

    // Send email notification
    const emailResult = await sendChecklistEmail(submission)
    
    // Save to OneDrive
    const oneDriveResult = await saveChecklistToOneDrive(submission)

    // Return combined results
    return NextResponse.json({
      success: true,
      email: emailResult,
      oneDrive: oneDriveResult,
      message: 'Checklist submitted successfully',
    })
  } catch (error) {
    console.error('Checklist submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit checklist', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}




