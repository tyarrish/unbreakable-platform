import { getAnthropicClient, DEFAULT_MODEL, MAX_TOKENS } from '../client'

export interface DiscussionPromptContext {
  currentWeek: number
  currentModule: string
  recentDiscussionThemes: string[]
  stuckDiscussions: Array<{ title: string; lastActivity: string }>
  cohortSize: number
  activeParticipants: number
}

const DISCUSSION_PROMPT_SYSTEM = `You are generating discussion prompts for the Rogue Leadership Training Experience, a Stoic-influenced leadership development program.

Your job:
- Create a thought-provoking discussion prompt for the cohort
- Tie it to the current module theme
- Make it specific and actionable (not generic)
- Push people toward vulnerability and real work
- Reference what's actually happening in the community if relevant

Voice:
- Direct, grounded, challenging
- No corporate speak or motivational fluff
- Questions that make people think
- Rooted in Stoic principles

Format:
Return a JSON object with:
{
  "title": "Compelling discussion title (6-8 words)",
  "prompt": "The opening question or framing (2-3 sentences that challenge and invite)",
  "why": "Why this matters right now for the cohort (1 sentence)"
}

Examples of good prompts:
- Title: "The Conversation You're Avoiding"
  Prompt: "There's a conversation you know you need to have but keep delaying. What makes it hard? Not the logistics. The actual fear."
  Why: "Week 3 is when people start identifying their patterns of avoidance."

- Title: "When Delegation Feels Like Abandonment"  
  Prompt: "You gave your team a project and stepped back. Now it's going sideways. At what point does trust become neglect?"
  Why: "Your cohort is wrestling with the line between autonomy and support."

Do NOT create generic prompts like:
- "What did you learn this week?"
- "Share your leadership journey"
- "How can we support each other?"`

/**
 * Generate a discussion prompt for the current week
 */
export async function generateDiscussionPrompt(
  context: DiscussionPromptContext
): Promise<{ title: string; prompt: string; why: string } | null> {
  const anthropic = getAnthropicClient()

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS.HERO_MESSAGE,
      system: DISCUSSION_PROMPT_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Generate a discussion prompt for this week.

Context:
- Week: Week ${context.currentWeek}
- Module: ${context.currentModule}
- Recent themes emerging: ${context.recentDiscussionThemes.join(', ') || 'None yet'}
- Cohort engagement: ${context.activeParticipants} of ${context.cohortSize} active
${context.stuckDiscussions.length > 0 ? `- Discussions that need energy: ${context.stuckDiscussions.map(d => d.title).join(', ')}` : ''}

Generate a prompt that meets the cohort where they actually are.

Return ONLY valid JSON, no other text:
{
  "title": "...",
  "prompt": "...",
  "why": "..."
}`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    }

    return null
  } catch (error) {
    console.error('Error generating discussion prompt:', error)
    return null
  }
}

