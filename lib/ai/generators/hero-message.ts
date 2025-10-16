import { getAnthropicClient, DEFAULT_MODEL, MAX_TOKENS } from '../client'
import { HERO_MESSAGE_SYSTEM_PROMPT, generateCommunityContextPrompt } from '../prompts'

export interface HeroMessageContext {
  currentWeek: number
  currentModule: string
  activeMembersThisWeek: number
  totalMembers: number
  discussionThemes: string[]
  nextEvent: string | null
  engagementLevel: 'high' | 'medium' | 'low'
}

/**
 * Generate dynamic hero message for dashboard
 * This message reflects the current state of the community and challenges members
 */
export async function generateHeroMessage(context: HeroMessageContext): Promise<string> {
  const anthropic = getAnthropicClient()

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS.HERO_MESSAGE,
      system: HERO_MESSAGE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: generateCommunityContextPrompt(context),
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      return content.text.trim()
    }

    throw new Error('Unexpected response format from AI')
  } catch (error) {
    console.error('Error generating hero message:', error)
    // Fallback message
    return `Week ${context.currentWeek}: ${context.currentModule}. What question are you sitting with right now?`
  }
}

