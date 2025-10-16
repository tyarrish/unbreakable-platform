/**
 * Extract themes from discussion content
 * Used to inform hero message generation and community context
 */

const COMMON_LEADERSHIP_THEMES = [
  'delegation',
  'trust',
  'difficult conversations',
  'feedback',
  'impostor syndrome',
  'conflict',
  'boundaries',
  'vulnerability',
  'decision-making',
  'fear',
  'authenticity',
  'presence',
  'perfectionism',
  'control',
  'uncertainty',
  'failure',
  'accountability',
  'team dynamics',
  'burnout',
  'work-life balance',
]

/**
 * Extract themes from discussion text
 * Simple keyword-based approach with weighting
 */
export function extractThemes(discussions: string[]): string[] {
  const allText = discussions.join(' ').toLowerCase()
  const themeScores: Record<string, number> = {}

  // Count theme occurrences
  for (const theme of COMMON_LEADERSHIP_THEMES) {
    const regex = new RegExp(theme.replace(/\s+/g, '\\s+'), 'gi')
    const matches = allText.match(regex)
    if (matches) {
      themeScores[theme] = matches.length
    }
  }

  // Sort by frequency and return top 3
  const sortedThemes = Object.entries(themeScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([theme]) => theme)

  return sortedThemes.length > 0 ? sortedThemes : ['personal leadership challenges']
}

/**
 * Extract themes from structured discussion data
 */
export function extractThemesFromDiscussions(
  discussions: Array<{ title: string; content: string }>
): string[] {
  const texts = discussions.map((d) => `${d.title} ${d.content}`)
  return extractThemes(texts)
}

/**
 * Determine engagement level based on activity
 */
export function determineEngagementLevel(
  activeMembersThisWeek: number,
  totalMembers: number
): 'high' | 'medium' | 'low' {
  const percentage = (activeMembersThisWeek / totalMembers) * 100

  if (percentage >= 70) return 'high'
  if (percentage >= 40) return 'medium'
  return 'low'
}

