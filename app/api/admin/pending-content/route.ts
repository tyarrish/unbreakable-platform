import { NextResponse } from 'next/server'
import { getPendingDashboardContent } from '@/lib/supabase/queries/ai-dashboard'

/**
 * Get pending dashboard content for admin review
 */
export async function GET() {
  try {
    const pendingContent = await getPendingDashboardContent()

    return NextResponse.json({
      success: true,
      content: pendingContent,
    })
  } catch (error: any) {
    console.error('Error fetching pending content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending content', details: error.message },
      { status: 500 }
    )
  }
}

