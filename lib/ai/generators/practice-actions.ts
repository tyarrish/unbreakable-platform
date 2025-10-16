import { getAnthropicClient, DEFAULT_MODEL, MAX_TOKENS } from '../client'
import { PRACTICE_ACTIONS_SYSTEM_PROMPT, generateUserContextPrompt } from '../prompts'

export interface UserActivityContext {
  userId: string
  userName: string
  daysActiveThisWeek: number
  postsThisWeek: number
  responsesToOthers: number
  modulesCompleted: number
  lastPartnerInteraction: string | null
  currentWeek: number
  currentModule: string
  nextEvent: string | null
}

export interface PracticeAction {
  action: string
  why: string
  priority: number
  category: 'connect' | 'reflect' | 'engage' | 'practice' | 'read'
}

/**
 * Generate personalized practice actions for a user
 * Actions are based on their behavior pattern and push them toward their growth edge
 */
export async function generatePracticeActions(
  context: UserActivityContext
): Promise<PracticeAction[]> {
  const anthropic = getAnthropicClient()

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS.PRACTICE_ACTIONS,
      system: PRACTICE_ACTIONS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: generateUserContextPrompt(context),
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      // Parse JSON response
      const jsonMatch = content.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as PracticeAction[]
        return parsed.slice(0, 4) // Max 4 actions
      }
    }

    // Fallback: Generic actions based on week
    return getDefaultActions(context)
  } catch (error) {
    console.error('Error generating practice actions:', error)
    return getDefaultActions(context)
  }
}

/**
 * Generate practice actions for multiple users
 */
export async function generateBatchPracticeActions(
  users: UserActivityContext[]
): Promise<Record<string, PracticeAction[]>> {
  const results: Record<string, PracticeAction[]> = {}

  // Generate in parallel batches of 5 to avoid rate limits
  const batchSize = 5
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize)
    const batchPromises = batch.map(async (user) => {
      const actions = await generatePracticeActions(user)
      return { userId: user.userId, actions }
    })

    const batchResults = await Promise.all(batchPromises)
    batchResults.forEach(({ userId, actions }) => {
      results[userId] = actions
    })

    // Small delay between batches
    if (i + batchSize < users.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return results
}

/**
 * Fallback default actions based on context
 */
function getDefaultActions(context: UserActivityContext): PracticeAction[] {
  const actions: PracticeAction[] = []

  // If no partner interaction, prioritize that
  if (!context.lastPartnerInteraction || context.lastPartnerInteraction === 'No recent interaction') {
    actions.push({
      action: 'Reach out to your accountability partner with a voice message or call',
      why: "You haven't connected recently. Strong partnerships are built on consistent communication.",
      priority: 1,
      category: 'connect',
    })
  }

  // If lurking, push to contribute
  if (context.daysActiveThisWeek >= 3 && context.postsThisWeek === 0) {
    actions.push({
      action: 'Post one specific challenge you\'re facing in the discussions',
      why: "You've been observing. Time to jump in. The community needs your perspective.",
      priority: 2,
      category: 'engage',
    })
  }

  // If posting but not responding
  if (context.postsThisWeek > 0 && context.responsesToOthers === 0) {
    actions.push({
      action: 'Respond meaningfully to two cohort members\' posts',
      why: 'Leadership is about helping others work through their challenges.',
      priority: 2,
      category: 'engage',
    })
  }

  // Generic reflection action
  actions.push({
    action: 'Reflect on one leadership challenge from this week and what it revealed about you',
    why: 'The obstacle shows you where your growth edge is.',
    priority: 3,
    category: 'reflect',
  })

  // If there's an event coming
  if (context.nextEvent) {
    actions.push({
      action: `Prepare for ${context.nextEvent}: bring a real leadership challenge to discuss`,
      why: 'Live sessions are most valuable when you come ready to work, not just listen.',
      priority: 1,
      category: 'practice',
    })
  }

  return actions.slice(0, 4)
}

