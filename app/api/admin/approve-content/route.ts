import { NextRequest, NextResponse } from 'next/server'
import { approveDashboardContent } from '@/lib/supabase/queries/ai-dashboard'
import { createClient } from '@/lib/supabase/server'

/**
 * Approve dashboard content and set as active
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { contentId } = body

    if (!contentId) {
      return NextResponse.json({ error: 'contentId is required' }, { status: 400 })
    }

    const success = await approveDashboardContent(contentId, user.id)

    if (!success) {
      throw new Error('Failed to approve content')
    }

    return NextResponse.json({
      success: true,
      message: 'Content approved and activated',
    })
  } catch (error: any) {
    console.error('Error approving content:', error)
    return NextResponse.json(
      { error: 'Failed to approve content', details: error.message },
      { status: 500 }
    )
  }
}

