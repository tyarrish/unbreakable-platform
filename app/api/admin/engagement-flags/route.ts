import { NextRequest, NextResponse } from 'next/server'
import { getEngagementFlags, resolveEngagementFlag } from '@/lib/supabase/queries/ai-dashboard'
import { createClient } from '@/lib/supabase/server'

/**
 * Get engagement flags with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const flagType = searchParams.get('type') as 'red' | 'yellow' | 'green' | null
    const resolved = searchParams.get('resolved') === 'true' ? true : searchParams.get('resolved') === 'false' ? false : undefined

    const flags = await getEngagementFlags(flagType || undefined, resolved)

    return NextResponse.json({
      success: true,
      flags,
    })
  } catch (error: any) {
    console.error('Error fetching engagement flags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch engagement flags', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Resolve an engagement flag
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
    const { flagId, notes } = body

    if (!flagId) {
      return NextResponse.json({ error: 'flagId is required' }, { status: 400 })
    }

    const success = await resolveEngagementFlag(flagId, user.id, notes)

    if (!success) {
      throw new Error('Failed to resolve flag')
    }

    return NextResponse.json({
      success: true,
      message: 'Flag resolved',
    })
  } catch (error: any) {
    console.error('Error resolving engagement flag:', error)
    return NextResponse.json(
      { error: 'Failed to resolve flag', details: error.message },
      { status: 500 }
    )
  }
}

