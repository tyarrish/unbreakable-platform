# Quick Setup Guide - AI Dashboard System

## Prerequisites
- Supabase project set up
- Vercel deployment configured
- Anthropic API account

## Step-by-Step Setup

### 1. Database Migration (5 min)
```bash
# Navigate to your project
cd /path/to/Cohort

# Run the migration via Supabase CLI or dashboard
# Upload: supabase/migrations/20251016000000_ai_dashboard_system.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `20251016000000_ai_dashboard_system.sql`
3. Execute query

### 2. Seed Test Data (optional, for testing)
```bash
# Run seed migration
# Upload: supabase/migrations/seed_test_dashboard_data.sql
```

This creates 20 test users, discussions, and activity patterns so you can see how the AI works before going live.

### 3. Get Anthropic API Key (3 min)
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create new key
5. Copy the key (starts with `sk-ant-...`)

### 4. Generate Cron Secret (1 min)
```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output.

### 5. Add Environment Variables to Vercel (3 min)
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add these:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
CRON_SECRET=your-generated-secret-here
```

Make sure SUPABASE variables are also set:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 6. Deploy to Vercel (5 min)
```bash
# Commit your changes
git add .
git commit -m "Add AI dashboard system"
git push origin main
```

Vercel will automatically deploy. Wait for deployment to complete.

### 7. Verify Cron Jobs Are Configured
In Vercel dashboard:
1. Go to your project
2. Settings → Cron Jobs
3. You should see:
   - `/api/cron/generate-dashboard` - Runs at 0 5 * * * (5am daily)
   - `/api/cron/analyze-engagement` - Runs at 0 6 * * * (6am daily)

### 8. Manual First Run (5 min)
Don't wait until 5am tomorrow. Test it now:

```bash
# From your local environment
curl https://your-domain.vercel.app/api/cron/generate-dashboard \
  -H "Authorization: Bearer your-cron-secret"
```

Check the response. Should see:
```json
{
  "success": true,
  "contentId": "some-uuid",
  "stats": { ... }
}
```

### 9. Review Generated Content
1. Visit `https://your-domain.vercel.app/admin/dashboard-review`
2. You should see pending content
3. Review the hero message, activity feed
4. Click "Approve & Activate"

### 10. Check Dashboard
1. Visit `https://your-domain.vercel.app/dashboard`
2. You should see:
   - Dynamic hero message (the one you just approved)
   - Activity feed (if you have discussions)
   - Personalized practice actions
   - Journey context

## Verification Checklist

- [ ] Migration ran successfully (check tables in Supabase)
- [ ] Environment variables set in Vercel
- [ ] Cron jobs show in Vercel dashboard
- [ ] Manual generation worked (got success response)
- [ ] Content appears in admin review page
- [ ] Content can be approved
- [ ] Dashboard displays approved content
- [ ] Engagement analyzer created flags (check `/admin/engagement-flags`)

## Common Issues

### "Unauthorized" when calling cron endpoint
**Problem:** CRON_SECRET doesn't match  
**Fix:** Double-check the secret in Vercel environment variables and your curl command

### "ANTHROPIC_API_KEY environment variable is not set"
**Problem:** API key not configured  
**Fix:** Add the key to Vercel environment variables and redeploy

### Content generated but dashboard is empty
**Problem:** Content not approved or not active  
**Fix:** Visit `/admin/dashboard-review` and approve content

### No engagement flags appearing
**Problem:** No user activity data  
**Fix:** 
- If using test data, run the seed migration
- If using real data, ensure users have activity (the system tracks this going forward)

## Next Steps

### For Testing (with seed data)
1. Review different types of flags in `/admin/engagement-flags`
2. Test editing content before approval
3. Regenerate content manually to see different outputs
4. Adjust prompts in `/lib/ai/prompts.ts` if voice doesn't match

### For Production (with real users)
1. Let the system run for 3-5 days
2. Review and approve content daily
3. Take notes on what works vs what needs adjustment
4. Update program settings as you progress through weeks/modules

## Daily Workflow (After Setup)

### Morning (10 min):
1. Visit `/admin/dashboard-review`
2. Review generated content from overnight run
3. Edit if needed, then approve
4. Check `/admin/engagement-flags` for red flags
5. Reach out to anyone who needs attention

### Weekly (15 min):
1. Update program settings (current week/module)
2. Review engagement trends
3. Celebrate green flags

### Monthly (30 min):
1. Review prompt effectiveness
2. Adjust voice calibration if needed
3. Look at patterns in flags

## Documentation

- **System Architecture**: `/docs/AI_DASHBOARD_SYSTEM.md`
- **Admin Guide**: `/docs/ADMIN_DASHBOARD_GUIDE.md`
- **This Guide**: `/docs/QUICK_AI_DASHBOARD_SETUP.md`

## Cost Estimate

With 25-user cohort:
- ~$0.22 per day
- ~$6.60 per month

This is negligible compared to time saved.

## Support

If something doesn't work:
1. Check Vercel function logs
2. Review Supabase table data
3. Read the troubleshooting section in `AI_DASHBOARD_SYSTEM.md`
4. Test individual endpoints manually

## You're Done!

The system will now:
- Generate fresh dashboard content every morning at 5am
- Analyze engagement and create flags at 6am
- Wait for your approval before content goes live
- Display approved content to all users

**First week**: Review and approve daily to calibrate the AI voice  
**After that**: Spot-check 2-3x per week and trust the system

