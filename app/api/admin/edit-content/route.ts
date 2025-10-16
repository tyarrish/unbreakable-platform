import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Edit dashboard content before approval
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

    if (!profile || !['admin', 'super_admin'].includes((profile as { role: string }).role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { contentId, content } = body

    if (!contentId || !content) {
      return NextResponse.json(
        { error: 'contentId and content are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('dashboard_content')
      .update({ content } as any)
      .eq('id', contentId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Content updated',
    })
  } catch (error: any) {
    console.error('Error editing content:', error)
    return NextResponse.json(
      { error: 'Failed to edit content', details: error.message },
      { status: 500 }
    )
  }
}

