import { getAnthropicClient, DEFAULT_MODEL, MAX_TOKENS } from '../client'
import { ACTIVITY_FEED_SYSTEM_PROMPT } from '../prompts'
import { formatRelativeTime } from '@/lib/utils/format-date'

export interface DiscussionPost {
  id: string
  title: string
  content_html: string
  author_name: string
  created_at: string
  response_count: number
}

export interface ActivityFeedItem {
  author: string
  preview: string
  discussion_id: string
  posted_relative: string
}

/**
 * Curate the most valuable discussion activity from the past 48 hours
 * AI selects based on depth, vulnerability, and insight - not just popularity
 */
export async function curateActivityFeed(
  discussions: DiscussionPost[]
): Promise<ActivityFeedItem[]> {
  const anthropic = getAnthropicClient()

  // If no discussions, return empty
  if (discussions.length === 0) {
    return []
  }

  try {
    // Prepare discussion data for AI
    const discussionData = discussions.map((d) => ({
      id: d.id,
      author: d.author_name,
      title: d.title,
      content: stripHtml(d.content_html),
      created_at: d.created_at,
      responses: d.response_count,
    }))

    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS.ACTIVITY_FEED,
      system: ACTIVITY_FEED_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here are all discussion posts from the past 48 hours:

${JSON.stringify(discussionData, null, 2)}

Return JSON array of the 4 best items (or fewer if there aren't 4 substantive posts):
[
  {
    "author": "First Last",
    "preview": "First 80 chars...",
    "discussion_id": "uuid",
    "posted_relative": "2 hours ago"
  }
]`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      // Parse JSON response
      const jsonMatch = content.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as ActivityFeedItem[]
        return parsed.slice(0, 4) // Ensure max 4 items
      }
    }

    // Fallback: Return most recent discussions
    return discussions.slice(0, 4).map((d) => ({
      author: d.author_name,
      preview: stripHtml(d.content_html).substring(0, 80) + '...',
      discussion_id: d.id,
      posted_relative: formatRelativeTime(new Date(d.created_at)),
    }))
  } catch (error) {
    console.error('Error curating activity feed:', error)

    // Fallback: Return most recent discussions
    return discussions.slice(0, 4).map((d) => ({
      author: d.author_name,
      preview: stripHtml(d.content_html).substring(0, 80) + '...',
      discussion_id: d.id,
      posted_relative: formatRelativeTime(new Date(d.created_at)),
    }))
  }
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

