# Admin Dashboard Guide

## Daily Workflow

### Morning Routine (10-15 minutes)

#### 1. Review Generated Content
**Visit**: `/admin/dashboard-review`

**What you'll see:**
- Currently active content (what's live now)
- Pending approval content (generated overnight at 5am)

**What to do:**
1. Read the hero message - Does it sound like you? Does it reflect where the cohort actually is?
2. Review the activity feed - Are these the conversations that matter? Is anyone missing who should be highlighted?
3. Check practice actions sample - Do they feel personalized and challenging?

**Options:**
- **Approve & Activate**: Content goes live immediately
- **Edit**: Modify the hero message or activity feed, then approve
- **Reject**: Leave it pending, generate new content tomorrow

#### 2. Check Engagement Flags
**Visit**: `/admin/engagement-flags`

**Three tabs:**

**RED (Immediate Attention)**
- No login for 10+ days
- Sudden silence after high activity
- Partner relationship breakdown

**Action:** Reach out personally within 24 hours. Don't mention the flag system - just check in genuinely.

**YELLOW (Monitor)**
- Lurking (consuming but not contributing)
- Declining engagement trend
- Module rushing without community engagement

**Action:** Gentle invitation or nudge. Not urgent, but don't ignore for 2+ weeks.

**GREEN (Celebrate)**
- Breakthrough moment (lurker became contributor)
- Consistent high-quality engagement
- Strong partnership showing impact

**Action:** Acknowledge their contribution. Consider highlighting publicly or privately.

## How to Interpret Flags

### Red Flag: "No login for 10+ days"
**Context shows:**
- Last login date
- Previous activity level (were they active before?)

**What it means:**
- They may have dropped out
- Life got in the way
- They're stuck on something and avoiding it

**What to do:**
1. Send personal message: "Hey [Name], haven't seen you around lately. Everything okay?"
2. Don't be pushy - offer support, not judgment
3. Document in resolved notes what you learned

### Red Flag: "Sudden silence after high activity"
**Context shows:**
- Posts last week vs this week
- They're still logging in but stopped contributing

**What it means:**
- Something shifted - maybe they got feedback they didn't like?
- Feeling vulnerable after sharing too much?
- Burnout or overwhelm?

**What to do:**
1. Check what their last post was about - any clues?
2. Reach out: "Noticed you've been quieter this week. Miss your voice in the discussions."
3. Make it safe to share what's going on

### Yellow Flag: "Lurker - consuming but not contributing"
**Context shows:**
- High login count, zero posts, zero responses
- They're showing up but silent

**What it means:**
- May not feel safe to share yet
- Waiting for permission
- Unsure if their thoughts are "good enough"

**What to do:**
1. Invite them specifically: "Would love to hear your perspective on [topic]"
2. Lower the bar: "Even just a reaction or question helps"
3. Make it about helping others, not performing

### Green Flag: "Breakthrough - lurker became contributor"
**Context shows:**
- Zero posts last week, multiple posts this week
- Quality marked as "substantive"

**What it means:**
- They overcame fear/hesitation
- They're finding their voice
- This is a pivotal moment

**What to do:**
1. Acknowledge it personally: "Loved seeing you jump into the discussion this week"
2. Reinforce: "The cohort needs your perspective"
3. Mark as resolved after celebrating

## Editing Generated Content

### When to Edit the Hero Message
**Edit if:**
- It references something that's not accurate
- The tone feels off for this specific week
- You have insider knowledge the AI doesn't (e.g., tough event just happened)
- It's too generic or could be more specific

**Don't edit if:**
- It's just different from what you would have written (trust the AI)
- It challenges the cohort in a way that feels uncomfortable (that's the point)
- It's shorter than you expected (brevity is better)

### How to Edit
1. Click "Edit" on pending content
2. Modify the hero message text directly
3. For activity feed, edit the JSON (careful with syntax)
4. Click "Save"
5. Then "Approve & Activate"

### Voice Calibration
If generated content consistently doesn't sound like you:

1. **Collect examples** of what doesn't work
2. **Update prompts** in `/lib/ai/prompts.ts`
3. **Add your actual writing** as examples in the system prompt
4. **Test manually** before next automated run

## Understanding Program Settings

### Current Week
Tells the AI what week of the program the cohort is in.

**Update when:** Starting a new week
**How:**
```sql
UPDATE program_settings 
SET setting_value = '{"week": 3, "description": "Week 3 - Building Momentum"}'::jsonb
WHERE setting_key = 'current_week';
```

### Current Module
Tells the AI what module/theme the cohort is working on.

**Update when:** Moving to a new month/module
**How:**
```sql
UPDATE program_settings 
SET setting_value = '{"module_id": "uuid-of-module", "title": "Month 2: Team Leadership", "order_number": 2}'::jsonb
WHERE setting_key = 'current_module';
```

## Dealing with Edge Cases

### No Substantive Discussions in Past 48 Hours
**What happens:** Activity feed will be empty or show fallback
**What to do:**
- Edit and add a note: "The cohort has been quiet this week. Break the silence."
- Or: Seed a discussion yourself to create movement

### Too Many Red Flags
**What happens:** 5+ red flags appear at once
**What it means:** Something systemic is wrong (holiday season, cohort losing energy, timing issues)
**What to do:**
- Don't reach out to everyone individually (overwhelming)
- Send cohort-wide re-engagement message
- Consider a live gathering to reset energy
- Look at program pacing - is it too fast/slow?

### Green Flags But Low Overall Engagement
**What happens:** 2-3 people are killing it, everyone else is quiet
**What it means:** You have anchors but not a community yet
**What to do:**
- Celebrate the anchors publicly
- But also: "We need more voices in this conversation"
- Consider pairing strong contributors with lurkers

## Monthly Review

Once a month, look at patterns:

### What to Check
1. **Engagement trend**: Are flags trending better or worse?
2. **Content quality**: Is generated content getting more accurate?
3. **Action effectiveness**: Are personalized actions actually pushing behavior?
4. **Voice calibration**: Does the AI sound more like you over time?

### Adjustments
- Update prompts if voice is drifting
- Adjust program settings if AI references are stale
- Tweak flag thresholds if too sensitive/insensitive

## When to Intervene Manually

### Don't rely only on the AI for:
- **Crisis situations**: If someone is clearly struggling (beyond engagement)
- **Major program changes**: New module, big event, cohort reshuffling
- **Sensitive topics**: If discussions go to difficult places, your human judgment matters
- **Partnership conflicts**: If partner flags appear, you need to facilitate

### The AI is a tool, not a replacement for:
- Your relationship with cohort members
- Your intuition about what the group needs
- Your ability to create container and hold space
- Your leadership presence

## Quick Reference

### Daily Checklist
- [ ] Review and approve dashboard content (5 min)
- [ ] Check red flags, reach out if any (5-10 min)
- [ ] Scan yellow flags, note patterns (2 min)

### Weekly Checklist
- [ ] Celebrate green flags (public or private)
- [ ] Update program settings if moving to new week
- [ ] Review engagement trends

### Monthly Checklist
- [ ] Review prompt effectiveness
- [ ] Adjust flag thresholds if needed
- [ ] Update documentation with lessons learned

## Questions to Ask Yourself

### Is the AI helping me work smarter?
- Am I spending less time on admin, more time on high-value interactions?
- Are flags catching things I would have missed?
- Is generated content good enough that I'm editing less over time?

### Is the dashboard serving the cohort?
- Are members engaging more deeply?
- Are they showing up because the work is compelling, not because they feel behind?
- Are conversations richer and more vulnerable?

### What needs human judgment?
- Where is the AI consistently wrong?
- What does it miss that I catch?
- Where do I need to override it regularly?

## Getting Help

### Content not generating correctly
1. Check `/docs/AI_DASHBOARD_SYSTEM.md` troubleshooting section
2. Test individual endpoints manually
3. Review Vercel function logs

### Flags seem wrong
1. Check `user_activity_snapshot` data - is it accurate?
2. Adjust thresholds in `/lib/ai/analyzers/engagement.ts`
3. Trust your judgment - resolve flags that don't feel right

### AI voice doesn't match yours
1. Document specific examples of "wrong" output
2. Update prompts with your writing style
3. Test manually until it feels authentic
4. Then let it run automatically

## Philosophy Reminder

The goal of this system is to:
1. **Free you up** to do high-leverage human work (deep 1:1s, live facilitation, critical interventions)
2. **Make depth visible** so members see what engagement actually means (not just completion)
3. **Create genuine FOMO** around substance, not points
4. **Reflect reality** back to the cohort so they see where they actually are

The AI should make the dashboard feel alive, not algorithmic.
If it starts feeling like a chatbot, that's your signal to recalibrate.

