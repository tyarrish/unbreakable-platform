# AI Dashboard System Documentation

## Overview

The AI Dashboard System uses Claude Sonnet 4.5 (Anthropic API) to automatically generate personalized, depth-focused dashboard content that reflects the real state of your leadership cohort. It runs daily at 5am via Vercel Cron, creating content that requires your approval before going live.

## Architecture

```
Supabase (data) 
→ Vercel Cron Job (5am daily) 
→ API Route (/api/cron/generate-dashboard)
→ Anthropic API (Claude Sonnet 4.5)
→ Supabase (saves generated content)
→ Admin Review (/admin/dashboard-review)
→ Approval → Content goes live
→ Dashboard displays approved content
```

## Philosophy

This system shifts the dashboard from:
- **Gamified metrics** (completion %, points, badges) → **Meaningful engagement** (depth, vulnerability, connection)
- **"You're behind"** messaging → **"Here's what's alive"** curiosity
- **Quantity tracking** (hours logged, items completed) → **Quality invitation** (substantive conversations, growth edges)
- **Static content** → **Dynamic reflection of community state**

## How the AI Makes Decisions

### Hero Message Generation
The AI analyzes:
- Current program week and module
- Discussion themes from past 48 hours (extracted from actual post content)
- Engagement level (% of cohort active this week)
- Upcoming events
- Overall community energy

It generates a 1-2 sentence message that:
- Reflects where the cohort actually is
- Creates curiosity without pressure
- Uses Trever's voice (grounded, direct, no corporate speak)
- References real community activity

**Example outputs:**
- "The Obstacle Is The Way. Month 1 asks: What are you avoiding?"
- "Your cohort has posted 23 reflections this week. What's yours?"
- "The hardest leadership questions don't have easy answers. What question are you sitting with right now?"

### Activity Feed Curation
The AI reviews all discussions from past 48 hours and selects the 4 most:
- Vulnerable (not performative)
- Insightful (not shallow agreement)
- Substantive (real struggles, genuine questions)

It prioritizes:
- Different voices (not the same 2 people)
- Depth over popularity
- Real work over achievement theater

### Personalized Practice Actions
For each user, the AI analyzes:
- Days active this week
- Posts vs responses (contribution pattern)
- Module progress vs discussion engagement
- Partner interaction frequency
- Behavior pattern (lurker, balanced, one-way contributor)

It generates 3-4 specific actions that:
- Push them toward their growth edge (what they're avoiding)
- Are concrete and doable
- Match current module themes
- Use Trever's voice

**Behavior patterns recognized:**
- Lurker: High logins, zero posts → "Post one specific challenge you're facing"
- Module rusher: High content consumption, low community engagement → "Bring one insight to the cohort"
- One-way contributor: Posts but doesn't respond → "Help two others work through their challenges"
- Highly engaged: Celebrate and push to next level

## Database Schema

### `dashboard_content`
Stores all generated content with approval workflow.

**Fields:**
- `content_type`: 'hero_message' | 'cohort_activity' | 'practice_actions' | 'full_dashboard'
- `content`: JSONB (the actual generated content)
- `generated_at`: When AI created it
- `approved`: Boolean (needs admin approval)
- `approved_by`: Admin who approved
- `active`: Boolean (currently displayed on dashboard)
- `generation_context`: What data informed the generation

### `user_activity_snapshot`
Daily engagement snapshots for AI analysis.

**Fields:**
- `user_id`: User reference
- `snapshot_date`: Date of snapshot
- `logins_count`: Number of logins that day
- `posts_count`: Discussion posts created
- `responses_count`: Responses to others
- `modules_completed`: Total modules completed
- `last_login`: Timestamp
- `last_partner_interaction`: Last partner activity
- `engagement_score`: Calculated engagement metric

### `engagement_flags`
Red/yellow/green flags for users needing attention.

**Fields:**
- `user_id`: User reference
- `flag_type`: 'red' | 'yellow' | 'green'
- `flag_reason`: Why this was flagged
- `context`: Additional data (JSON)
- `resolved`: Boolean
- `resolved_by`: Admin who resolved
- `resolved_notes`: What action was taken

### `program_settings`
Global program state (current week, module).

**Fields:**
- `setting_key`: 'current_week' | 'current_module' | 'program_start_date'
- `setting_value`: JSONB value
- `updated_by`: Admin who updated

## Daily Workflow

### Automated (No Human Intervention)
1. **5:00 AM**: Generate Dashboard Content cron runs
   - Gathers community context (discussions, activity, events)
   - Calls AI to generate hero message, activity feed, practice actions
   - Saves to database with `approved: false`

2. **6:00 AM**: Analyze Engagement cron runs
   - Reviews all user activity from past 14 days
   - Generates engagement flags (red/yellow/green)
   - Saves flags to database

### Manual (Requires Admin Action)
3. **Morning Review** (when you wake up):
   - Visit `/admin/dashboard-review`
   - Review generated content
   - Edit if needed (text editing for hero message, JSON for activity feed)
   - Click "Approve & Activate"
   - Content goes live immediately

4. **Check Engagement Flags**:
   - Visit `/admin/engagement-flags`
   - Review red flags (immediate attention)
   - Review yellow flags (monitoring needed)
   - Celebrate green flags (breakthroughs)
   - Resolve flags with notes

## Environment Variables Required

```env
# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Vercel Cron (generate random secure string)
CRON_SECRET=your_random_secret_here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Cost Estimates

### Anthropic API (Claude Sonnet 4.5)
- **Input tokens**: $3 per million tokens
- **Output tokens**: $15 per million tokens

### Daily Usage (25-user cohort):
- Hero message: ~1K input, ~100 output = $0.003 + $0.0015 = $0.0045
- Activity feed: ~10K input, ~500 output = $0.03 + $0.0075 = $0.0375
- Practice actions (25 users): ~50K input, ~2K output = $0.15 + $0.03 = $0.18

**Total per day**: ~$0.22  
**Total per month**: ~$6.60

This is negligible compared to your time saved reviewing and manually creating personalized content.

## Troubleshooting

### Content not generating
**Check:**
1. Environment variable `ANTHROPIC_API_KEY` is set in Vercel
2. Cron job is configured in `vercel.json`
3. Check Vercel function logs for errors
4. Manually trigger: POST to `/api/cron/generate-dashboard` with Authorization header

### Content generated but not showing on dashboard
**Check:**
1. Visit `/admin/dashboard-review` - is content pending approval?
2. Content must be approved AND active to display
3. Check RLS policies on `dashboard_content` table

### Engagement flags not appearing
**Check:**
1. User activity snapshots are being created (check `user_activity_snapshot` table)
2. Engagement analyzer cron ran (check Vercel logs)
3. Visit `/admin/engagement-flags` with filters

### AI output doesn't match Trever's voice
**Solution:**
1. Edit prompts in `/lib/ai/prompts.ts`
2. Add more voice examples to system prompts
3. Test with manual generation: POST to `/api/ai/generate-hero-message`
4. Iterate until voice feels authentic

## Manual Operations

### Regenerate Content On Demand
```bash
# Hero message only
curl -X POST https://your-domain.com/api/ai/generate-hero-message

# Activity feed only
curl -X POST https://your-domain.com/api/ai/curate-activity

# Personalized actions for specific user
curl -X POST https://your-domain.com/api/ai/personalize-actions \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-uuid-here"}'
```

### Update Program State
```sql
-- Update current week
UPDATE program_settings 
SET setting_value = '{"week": 2, "description": "Week 2 - Deepening Practice"}'::jsonb
WHERE setting_key = 'current_week';

-- Update current module
UPDATE program_settings 
SET setting_value = '{"module_id": "uuid", "title": "Month 2: Team Leadership", "order_number": 2}'::jsonb
WHERE setting_key = 'current_module';
```

### Manually Trigger Cron (Local Testing)
```bash
# Set CRON_SECRET in .env.local
# Then call with authorization header
curl http://localhost:3000/api/cron/generate-dashboard \
  -H "Authorization: Bearer your_cron_secret"
```

## Best Practices

### First Month (Daily Manual Approval)
- Review every generated message
- Edit to match your voice
- Take notes on what works vs what feels off
- Use this to fine-tune prompts

### Month 2+ (Spot Check)
- Review 2-3x per week
- Approve in batches
- Only edit when necessary
- Trust the AI, intervene when it misses

### Engagement Flag Response
**Red Flags (immediate):**
- Reach out personally within 24 hours
- Don't mention the flag, just check in genuinely
- Document what you did in resolved notes

**Yellow Flags (monitor):**
- Gentle nudge or invitation
- Not urgent, but don't ignore for 2+ weeks

**Green Flags (celebrate):**
- Acknowledge breakthrough publicly or privately
- Highlight contribution to community
- Consider inviting them to mentor others

## Scaling Considerations

### 50+ Users
- Consider batching practice action generation (5 concurrent max)
- May hit rate limits, add delay between batches
- Cost increases linearly (~$0.008 per user per day)

### 100+ Users
- Consider weekly practice actions instead of daily
- Cache generated content longer
- Pre-generate during off-hours

## Security

### API Endpoints Protected
- Admin routes check user role (admin or super_admin)
- Cron routes verify `CRON_SECRET`
- RLS policies prevent unauthorized access

### Data Privacy
- Generated content doesn't expose sensitive user data
- Activity snapshots are anonymized in AI prompts
- User names shown, but not emails or personal info

## Future Enhancements

### Planned
- Email notifications for red flags
- Cohort health dashboard (trends over time)
- Voice calibration UI (tune prompts without code)
- A/B testing dashboard versions

### Possible
- AI-generated discussion prompts
- Partner matching suggestions
- Module pacing recommendations
- Event attendance predictions

## Support

If something breaks or doesn't make sense:
1. Check Vercel function logs
2. Review Supabase table data
3. Test manually with individual AI endpoints
4. Check this documentation
5. Ask Cursor to debug with context

