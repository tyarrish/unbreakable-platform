import Anthropic from '@anthropic-ai/sdk'

let anthropicClient: Anthropic | null = null

/**
 * Get Anthropic client singleton
 * Ensures we only create one instance across the application
 */
export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }

    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  return anthropicClient
}

/**
 * Default model for dashboard generation
 */
export const DEFAULT_MODEL = 'claude-sonnet-4-20250514'

/**
 * Maximum tokens for different content types
 */
export const MAX_TOKENS = {
  HERO_MESSAGE: 300,
  ACTIVITY_FEED: 1500,
  PRACTICE_ACTIONS: 2000,
  ENGAGEMENT_ANALYSIS: 3000,
} as const

