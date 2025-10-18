import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getAnthropicClient, DEFAULT_MODEL } from '@/lib/ai/client'

/**
 * Create AI-generated welcome discussion for Week 1
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
      .select('roles')
      .eq('id', user.id)
      .single()

    if (!profile || !(profile as any)?.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate welcome discussion with AI
    const anthropic = getAnthropicClient()

    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1000,
      system: `You are creating a welcome discussion for Week 1 of the Rogue Leadership Training Experience.

Your job:
- Create a discussion that invites cohort members to introduce themselves
- Focus on WHY they're here and what they're hoping to get from the program
- Make it authentic, not corporate or forced
- Use Trever's voice (direct, grounded)
- Encourage vulnerability over performance

Return JSON:
{
  "title": "Discussion title (compelling, 5-7 words)",
  "content": "Opening post content in HTML (2-3 paragraphs)"
}`,
      messages: [
        {
          role: 'user',
          content: `Generate a Week 1 welcome discussion that invites the cohort to:
- Share why they joined
- Name what they're hoping to work on
- Be real, not polished

Make it feel like Trever wrote it - direct and genuine.`,
        },
      ],
    })

    const aiContent = message.content[0]
    if (aiContent.type !== 'text') {
      throw new Error('Unexpected AI response')
    }

    const jsonMatch = aiContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse AI response')
    }

    const { title, content } = JSON.parse(jsonMatch[0])

    // Create discussion using service role
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: discussion, error } = await supabaseAdmin
      .from('discussion_threads')
      .insert({
        title,
        content_html: content,
        created_by: user.id,
        is_pinned: true, // Pin the welcome discussion
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      discussion: {
        id: discussion.id,
        title,
      },
    })
  } catch (error: any) {
    console.error('Error creating welcome discussion:', error)
    return NextResponse.json(
      { error: 'Failed to create welcome discussion', details: error.message },
      { status: 500 }
    )
  }
}

