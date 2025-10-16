import { getAnthropicClient, DEFAULT_MODEL } from '../client'

export interface CohortHealthContext {
  weekNumber: number
  moduleName: string
  totalMembers: number
  activeThisWeek: number
  activePreviousWeek: number
  newDiscussions: number
  totalResponses: number
  topContributors: Array<{ name: string; posts: number }>
  lurkers: number
  redFlags: Array<{ name: string; reason: string }>
  yellowFlags: Array<{ name: string; reason: string }>
  greenFlags: Array<{ name: string; reason: string }>
  emergingThemes: string[]
  stuckDiscussions: Array<{ title: string; views: number; responses: number }>
}

const HEALTH_REPORT_SYSTEM = `You are generating a weekly cohort health report for Trever, the facilitator of the Rogue Leadership Training Experience.

Your job:
- Synthesize the cohort's state into actionable insights
- Highlight what needs attention vs what's working
- Be specific with names and numbers
- Suggest concrete next actions
- Use Trever's voice (direct, grounded, data-driven)

Structure:
1. Overall Health (1-2 sentences: How's the cohort doing?)
2. What's Working (2-3 bullet points of positive patterns)
3. What Needs Attention (2-3 bullet points with specific actions)
4. Emerging Themes (What the cohort is wrestling with)
5. Recommended Actions (3-4 specific things Trever should do this week)

Voice:
- Direct and actionable
- No corporate speak
- Specific names and numbers
- Clear priorities

Return as formatted HTML with proper structure.`

/**
 * Generate weekly cohort health report
 */
export async function generateHealthReport(
  context: CohortHealthContext
): Promise<string> {
  const anthropic = getAnthropicClient()

  try {
    const engagementChange =
      context.activePreviousWeek > 0
        ? ((context.activeThisWeek - context.activePreviousWeek) /
            context.activePreviousWeek) *
          100
        : 0

    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2000,
      system: HEALTH_REPORT_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Generate this week's cohort health report.

Data:
- Week: Week ${context.weekNumber}
- Module: ${context.moduleName}
- Total Members: ${context.totalMembers}
- Active This Week: ${context.activeThisWeek} (${Math.round((context.activeThisWeek / context.totalMembers) * 100)}%)
- Active Previous Week: ${context.activePreviousWeek}
- Engagement Change: ${engagementChange > 0 ? '+' : ''}${Math.round(engagementChange)}%
- New Discussions: ${context.newDiscussions}
- Total Responses: ${context.totalResponses}
- Lurkers: ${context.lurkers} (logging in but not contributing)

Top Contributors:
${context.topContributors.map(c => `- ${c.name}: ${c.posts} posts`).join('\n') || 'None yet'}

Red Flags (Need Immediate Attention):
${context.redFlags.map(f => `- ${f.name}: ${f.reason}`).join('\n') || 'None'}

Yellow Flags (Monitor):
${context.yellowFlags.map(f => `- ${f.name}: ${f.reason}`).join('\n') || 'None'}

Green Flags (Celebrate):
${context.greenFlags.map(f => `- ${f.name}: ${f.reason}`).join('\n') || 'None'}

Emerging Themes:
${context.emergingThemes.join(', ') || 'No clear patterns yet'}

Stuck Discussions (High views, low responses):
${context.stuckDiscussions.map(d => `- "${d.title}" (${d.views} views, ${d.responses} responses)`).join('\n') || 'None'}

Generate a comprehensive health report with specific, actionable insights. Return as formatted HTML.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      return content.text
    }

    return '<p>Unable to generate health report</p>'
  } catch (error) {
    console.error('Error generating health report:', error)
    return '<p>Error generating health report</p>'
  }
}

