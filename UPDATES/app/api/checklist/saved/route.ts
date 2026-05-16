import { NextRequest, NextResponse } from 'next/server'
import { getSavedChecklists } from '@/lib/onedrive'
import type { ChecklistType } from '@/lib/email'

const validChecklistTypes: ChecklistType[] = ['am', 'pm', 'night', 'admin', 'agm', 'gm']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const checklistType = searchParams.get('type') as ChecklistType | null
    const yearMonth = searchParams.get('yearMonth') || undefined

    if (!checklistType || !validChecklistTypes.includes(checklistType)) {
      return NextResponse.json(
        { error: 'Invalid or missing checklist type' },
        { status: 400 }
      )
    }

    const result = await getSavedChecklists(checklistType, yearMonth)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      files: result.files,
    })
  } catch (error) {
    console.error('Error fetching saved checklists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved checklists' },
      { status: 500 }
    )
  }
}



