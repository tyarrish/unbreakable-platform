# Test AI Dashboard System

## Quick Health Check

### 1. Verify Environment Variables in Vercel

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Check these exist:**
- ✅ `ANTHROPIC_API_KEY` (starts with `sk-ant-`)
- ✅ `CRON_SECRET` (any secure random string)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (for saving content)

### 2. Manually Trigger AI Dashboard Generation

**Option A: Via Admin Panel**
1. Go to: https://cohort.unbreakablegp.org/admin/ai-tools
2. Click "Generate Dashboard Content"
3. Wait ~30 seconds
4. Check console for success/errors

**Option B: Via API (using cURL)**
Replace `YOUR_CRON_SECRET` with your actual secret:

```bash
curl -X GET "https://cohort.unbreakablegp.org/api/cron/generate-dashboard" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 3. Review Generated Content

1. Go to: https://cohort.unbreakablegp.org/admin/dashboard-review
2. You should see generated content waiting for approval
3. Review the hero message, activity feed, practice actions
4. Click "Approve & Activate"

### 4. Verify It Shows on Dashboard

1. Go to: https://cohort.unbreakablegp.org/dashboard
2. Refresh the page
3. Look for:
   - Personalized hero message with your name
   - Activity feed showing recent discussions
   - "Your Practice This Week" with specific actions

## Troubleshooting

### Issue: "Unauthorized" error when triggering cron
**Fix:** CRON_SECRET environment variable is missing or incorrect

### Issue: "Anthropic API error"
**Fix:** ANTHROPIC_API_KEY is missing, invalid, or out of credits

### Issue: Content generated but not showing
**Fix:** Go to /admin/dashboard-review and approve the content

### Issue: No content in dashboard-review
**Fix:** 
- Check API route logs
- Verify discussions exist in database
- Try manual generation from /admin/ai-tools

## What Success Looks Like

Dashboard shows:
- ✅ Personalized greeting: "Trevor. Welcome to the Rogue..."
- ✅ Activity feed with 2-4 recent discussions
- ✅ "Your Practice This Week" with 3-4 specific actions
- ✅ All content feels relevant and current

