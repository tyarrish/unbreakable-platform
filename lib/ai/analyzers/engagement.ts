import { getAnthropicClient, DEFAULT_MODEL, MAX_TOKENS } from '../client'
import { ENGAGEMENT_ANALYSIS_SYSTEM_PROMPT } from '../prompts'

export interface UserEngagementData {
  userId: string
  userName: string
  email: string
  lastLogin: string | null
  loginsPastWeek: number
  loginsPreviousWeek: number
  postsPastWeek: number
  postsPreviousWeek: number
  responsesPastWeek: number
  lastPartnerInteraction: string | null
}

export interface EngagementFlag {
  userId: string
  flagType: 'red' | 'yellow' | 'green'
  reason: string
  context: Record<string, any>
  recommendedAction: string
}

/**
 * Analyze user engagement patterns and generate flags
 * This identifies who needs attention (red/yellow) and who should be celebrated (green)
 */
export async function analyzeEngagement(
  users: UserEngagementData[]
): Promise<EngagementFlag[]> {
  const flags: EngagementFlag[] = []

  // First, apply rule-based analysis for clear patterns
  for (const user of users) {
    const ruleBasedFlags = analyzeUserWithRules(user)
    flags.push(...ruleBasedFlags)
  }

  // Then, optionally use AI for more nuanced pattern detection
  // (This is expensive, so we only do it for edge cases or weekly analysis)

  return flags
}

/**
 * Rule-based engagement analysis
 * Fast and deterministic for common patterns
 */
function analyzeUserWithRules(user: UserEngagementData): EngagementFlag[] {
  const flags: EngagementFlag[] = []
  const daysSinceLastLogin = user.lastLogin
    ? Math.floor((Date.now() - new Date(user.lastLogin).getTime()) / (1000 * 60 * 60 * 24))
    : 999

  // RED FLAGS (immediate attention)

  // No login for 10+ days
  if (daysSinceLastLogin >= 10) {
    flags.push({
      userId: user.userId,
      flagType: 'red',
      reason: 'No login for 10+ days',
      context: {
        lastLogin: user.lastLogin,
        daysSinceLogin: daysSinceLastLogin,
        previousActivity: user.loginsPreviousWeek > 0 ? 'active' : 'inactive',
      },
      recommendedAction:
        'Send personal check-in. They may have dropped out or be facing challenges.',
    })
  }

  // Sudden silence after high activity
  if (
    user.postsPreviousWeek >= 3 &&
    user.postsPastWeek === 0 &&
    user.loginsPastWeek > 0
  ) {
    flags.push({
      userId: user.userId,
      flagType: 'red',
      reason: 'Sudden silence after high activity',
      context: {
        postsPreviousWeek: user.postsPreviousWeek,
        postsPastWeek: user.postsPastWeek,
        stillLoggingIn: true,
      },
      recommendedAction:
        "Something changed. Check in personally - they're still showing up but stopped contributing.",
    })
  }

  // Partner ghosting (14+ days)
  const daysSincePartnerInteraction = user.lastPartnerInteraction
    ? Math.floor(
        (Date.now() - new Date(user.lastPartnerInteraction).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 999

  if (daysSincePartnerInteraction >= 14 && user.loginsPastWeek > 0) {
    flags.push({
      userId: user.userId,
      flagType: 'red',
      reason: 'Partner relationship broken - 14+ days no interaction',
      context: {
        lastPartnerInteraction: user.lastPartnerInteraction,
        daysSinceInteraction: daysSincePartnerInteraction,
      },
      recommendedAction:
        'Partner relationship may have failed. Consider facilitating reconnection or re-pairing.',
    })
  }

  // YELLOW FLAGS (monitor)

  // Lurker pattern
  if (
    user.loginsPastWeek >= 4 &&
    user.postsPastWeek === 0 &&
    user.responsesPastWeek === 0
  ) {
    flags.push({
      userId: user.userId,
      flagType: 'yellow',
      reason: 'Lurker - consuming but not contributing',
      context: {
        logins: user.loginsPastWeek,
        posts: user.postsPastWeek,
        responses: user.responsesPastWeek,
        pattern: 'consistent_lurking',
      },
      recommendedAction:
        'Invite them to share. They may need permission or encouragement to contribute.',
    })
  }

  // Declining engagement trend
  if (
    user.loginsPreviousWeek >= 4 &&
    user.loginsPastWeek <= 2 &&
    user.loginsPastWeek > 0
  ) {
    flags.push({
      userId: user.userId,
      flagType: 'yellow',
      reason: 'Declining engagement trend',
      context: {
        previousLogins: user.loginsPreviousWeek,
        currentLogins: user.loginsPastWeek,
        trend: 'declining',
      },
      recommendedAction:
        'Engagement is slipping. Gentle check-in before it becomes a red flag.',
    })
  }

  // GREEN FLAGS (celebrate)

  // Breakthrough: lurker became contributor
  if (
    user.postsPreviousWeek === 0 &&
    user.postsPastWeek >= 2 &&
    user.loginsPreviousWeek >= 3
  ) {
    flags.push({
      userId: user.userId,
      flagType: 'green',
      reason: 'Breakthrough - lurker became contributor',
      context: {
        previousPosts: user.postsPreviousWeek,
        currentPosts: user.postsPastWeek,
        quality: 'needs_review',
      },
      recommendedAction:
        'Celebrate this breakthrough. Acknowledge their contribution personally.',
    })
  }

  // Consistent high engagement
  if (
    user.loginsPastWeek >= 5 &&
    user.postsPastWeek >= 2 &&
    user.responsesPastWeek >= 3
  ) {
    flags.push({
      userId: user.userId,
      flagType: 'green',
      reason: 'Consistent high-quality engagement',
      context: {
        logins: user.loginsPastWeek,
        posts: user.postsPastWeek,
        responses: user.responsesPastWeek,
        balance: 'contributing and supporting',
      },
      recommendedAction:
        'Community anchor. Consider highlighting their contributions or inviting them to mentor others.',
    })
  }

  return flags
}

/**
 * AI-powered engagement analysis (optional, for deeper insights)
 * Use this for weekly reports or edge cases that need human-like judgment
 */
export async function analyzeEngagementWithAI(
  users: UserEngagementData[]
): Promise<EngagementFlag[]> {
  const anthropic = getAnthropicClient()

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS.ENGAGEMENT_ANALYSIS,
      system: ENGAGEMENT_ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyze these user engagement patterns and identify flags:

${JSON.stringify(users, null, 2)}

Return JSON array of flags:
[
  {
    "user_id": "uuid",
    "flag_type": "red|yellow|green",
    "reason": "Specific pattern observed",
    "context": {},
    "recommended_action": "What to do"
  }
]`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as EngagementFlag[]
      }
    }

    return []
  } catch (error) {
    console.error('Error analyzing engagement with AI:', error)
    return []
  }
}

