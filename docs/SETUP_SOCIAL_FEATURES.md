# Social Features Setup Guide

This guide will walk you through setting up all the new social features, gamification, and community enhancements that have been added to the RLTE platform.

## Prerequisites

- Node.js 18+ and pnpm installed
- Supabase project configured
- Existing RLTE platform running

## Step 1: Install Dependencies

```bash
# Install the new radix-ui tooltip component
pnpm install
```

This will install `@radix-ui/react-tooltip@^1.1.10` which was added to package.json.

## Step 2: Run Database Migrations

The new features require several database tables and schema changes.

### Option A: Using Supabase CLI (Recommended)

```bash
# Make sure you're linked to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push the new migration
npx supabase db push
```

### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open `supabase/migrations/00017_social_features_schema.sql`
4. Copy the entire contents
5. Paste into SQL Editor and run

## Step 3: Verify Database Tables

After running the migration, verify these tables were created:

```sql
-- Social Features
SELECT * FROM user_follows LIMIT 1;
SELECT * FROM notifications LIMIT 1;
SELECT * FROM activity_feed LIMIT 1;

-- Gamification
SELECT * FROM achievements LIMIT 1;
SELECT * FROM user_achievements LIMIT 1;
SELECT * FROM user_engagement LIMIT 1;

-- Additional Features
SELECT * FROM resource_bookmarks LIMIT 1;
SELECT * FROM study_groups LIMIT 1;
SELECT * FROM study_group_members LIMIT 1;
```

## Step 4: Verify Initial Data

The migration should have inserted 13 initial achievements. Verify they exist:

```sql
SELECT name, description, points FROM achievements ORDER BY points;
```

You should see achievements like:
- First Steps (10 points)
- Early Bird (10 points)
- Discussion Starter (20 points)
- Helping Hand (25 points)
- etc.

## Step 5: Start Development Server

```bash
pnpm dev
```

The server will start on `http://localhost:3000`

## Step 6: Test New Features

### 1. Test Global Search (Cmd+K)

1. Log in to the platform
2. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
3. Search dialog should open
4. Try searching for modules, lessons, members

### 2. Test Notification Center

1. Look for the bell icon in the top-right header
2. Click to open notifications dropdown
3. Currently should show "No notifications yet"
4. Notifications will populate as you interact with the platform

### 3. Test Member Directory

1. Click "Members" in the sidebar navigation
2. You should see all cohort members
3. Try searching for members by name/email
4. Click on a member to view their profile
5. Try following/unfollowing a member

### 4. Test Activity Feed

1. Navigate to Dashboard
2. Scroll to "Community Activity" section
3. Activity feed should display (initially empty)
4. Complete a lesson or create a discussion to generate activity

### 5. Test Profile Enhancements

1. Go to your profile (Settings in sidebar)
2. You can now add:
   - City, state, country
   - Interests (array of tags)
   - Goals
   - LinkedIn URL
   - Twitter URL

## Step 7: Generate Activity & Test Real-time Features

To see the features in action, generate some activity:

### Generate Activities

```bash
# In Supabase SQL Editor or your preferred SQL client
-- Add sample activity
INSERT INTO activity_feed (user_id, activity_type, title, description, link)
VALUES 
  (auth.uid(), 'lesson_completed', 'Completed Lesson 1', 'Introduction to Leadership', '/modules/xxx/lessons/xxx'),
  (auth.uid(), 'discussion_post', 'Started a discussion', 'What makes a great leader?', '/discussions/xxx');

-- Award yourself an achievement
INSERT INTO user_achievements (user_id, achievement_id)
SELECT auth.uid(), id FROM achievements WHERE name = 'First Steps';
```

### Test Real-time Updates

1. Open the platform in two browser windows (or browsers)
2. Log in as different users
3. In one window, complete an action (e.g., create a discussion)
4. Watch the activity feed update in real-time in the other window
5. Notifications should also appear in real-time

## Step 8: Verify Gamification Features

### Check Leaderboard

Create a page or component that uses the Leaderboard:

```tsx
import { Leaderboard } from '@/components/gamification/leaderboard'

// In your component
<Leaderboard limit={10} currentUserId={userId} />
```

### Check Achievements

View your achievements on the member profile page:

1. Navigate to Members > Your Profile
2. Scroll to Achievements section
3. You should see any earned achievements displayed

### Check Streaks

Add the streak indicator to your dashboard:

```tsx
import { StreakIndicator } from '@/components/ui/streak-indicator'
import { getCurrentStreak } from '@/lib/supabase/queries/engagement'

// Get streak data
const currentStreak = await getCurrentStreak(userId)

// Display
<StreakIndicator 
  currentStreak={currentStreak}
  type="daily"
/>
```

## Troubleshooting

### Issue: Tables not created

**Solution**: 
- Check if migration ran successfully
- Look for errors in Supabase logs
- Verify you have the correct permissions
- Try running the SQL manually in SQL Editor

### Issue: RLS Policy errors

**Solution**:
- Make sure you're authenticated when testing
- Check that RLS policies were created (they're in the migration)
- Verify `auth.uid()` is working correctly

```sql
-- Test your auth
SELECT auth.uid();
```

### Issue: Real-time not working

**Solution**:
- Check Supabase Realtime is enabled for your project
- Verify tables have `REPLICA IDENTITY FULL`:

```sql
ALTER TABLE activity_feed REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
```

### Issue: Dependencies not installing

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Issue: TypeScript errors

**Solution**:
```bash
# Regenerate Supabase types
pnpm db:types

# Check for type errors
pnpm type-check
```

## Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (for server actions)
```

## Performance Tips

### Enable Indexes

The migration creates indexes, but verify they exist:

```sql
-- Check indexes
SELECT indexname, tablename FROM pg_indexes 
WHERE tablename IN ('activity_feed', 'notifications', 'user_follows', 'user_achievements');
```

### Enable Real-time Selectively

If you have performance concerns, you can disable real-time for specific features:

```typescript
// Instead of subscribing, just poll periodically
useEffect(() => {
  const interval = setInterval(loadActivities, 30000) // Every 30 seconds
  return () => clearInterval(interval)
}, [])
```

## Next Steps

### 1. Customize Achievements

Add more achievements specific to your cohort:

```sql
INSERT INTO achievements (name, description, icon, category, points)
VALUES 
  ('Team Player', 'Help 10 cohort members', '🤝', 'community', 50),
  ('Deep Thinker', 'Write reflections over 500 words 5 times', '🧠', 'learning', 40);
```

### 2. Set Up Automated Achievement Awards

Create database triggers or Edge Functions to automatically award achievements when criteria are met.

### 3. Implement Event Tracking

Track user actions to automatically generate activity feed entries and award achievements.

### 4. Add Email Notifications

Set up email templates and triggers for important notifications (using Supabase Edge Functions + Resend/SendGrid).

### 5. Analytics

Add analytics tracking to understand which features are most used:
- Activity feed engagement
- Search queries
- Member profile views
- Achievement unlock rates

## Support

For issues or questions:
1. Check Supabase logs in dashboard
2. Review browser console for errors
3. Check Network tab for failed API calls
4. Verify RLS policies are correct
5. Test queries directly in Supabase SQL Editor

## Feature Flags (Optional)

If you want to roll out features gradually, consider adding feature flags:

```typescript
// lib/feature-flags.ts
export const features = {
  activityFeed: true,
  achievements: true,
  leaderboard: false, // Hide until ready
  globalSearch: true,
  notifications: true,
}

// Use in components
if (features.leaderboard) {
  return <Leaderboard />
}
```

## Security Checklist

- [ ] RLS policies enabled on all new tables
- [ ] User can only modify their own data
- [ ] Sensitive operations require authentication
- [ ] No service role key exposed in client code
- [ ] Input validation on all user inputs
- [ ] Rate limiting on expensive queries (consider Supabase quotas)

---

## Summary

You've now successfully set up:

✅ Member directory with search and profiles
✅ Social follow/unfollow system
✅ Real-time activity feed
✅ Notification center
✅ Achievement system with 13 initial achievements
✅ Gamification with points and leaderboard
✅ Streak tracking
✅ Global search (Cmd+K)
✅ Enhanced dashboard layout

Welcome to the new, more engaging RLTE platform! 🎉

For more details on each feature, see `docs/SOCIAL_FEATURES_BUILD_SUMMARY.md`.









