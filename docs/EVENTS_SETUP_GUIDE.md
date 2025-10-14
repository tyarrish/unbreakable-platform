# Events Feature - Quick Setup Guide

## Prerequisites
- Docker Desktop running (for local Supabase)
- Development server running on port 3000

## Setup Steps

### 1. Apply Database Migration

**Option A: Local Development (Supabase CLI)**
```bash
# Reset database to apply all migrations
pnpm supabase db reset

# Or just apply the new migration
pnpm supabase migration up
```

**Option B: Remote Supabase Project**
```bash
# Push migration to remote database
pnpm supabase db push
```

**Option C: Manual Application**
If you prefer to apply manually through Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/00016_enhance_events_schema.sql`
4. Paste and run in SQL Editor

### 2. Verify Migration

Check that the new columns exist:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events';
```

You should see:
- `is_required` (boolean)
- `location_type` (text)
- `location_address` (text)
- `module_id` (uuid)

### 3. Test the Feature

#### As Admin:
1. Log in as an admin user
2. Navigate to `/admin/events`
3. Click "Create Event"
4. Fill in the form and test different location types
5. Save and verify event appears in list

#### As Participant:
1. Log in as a regular user
2. Navigate to `/calendar`
3. Verify events display correctly
4. Test registration/unregistration
5. Check "Join Zoom" button appears for virtual events

## Example Test Data

Create a test event through the UI or insert via SQL:

### Virtual Event Example
```sql
INSERT INTO events (
  title,
  description,
  event_type,
  start_time,
  end_time,
  is_required,
  location_type,
  zoom_link,
  created_by
) VALUES (
  'Month 1 Cohort Call',
  'Our first cohort call to discuss the leadership foundations module',
  'cohort_call',
  '2025-11-01 18:00:00+00',
  '2025-11-01 19:30:00+00',
  true,
  'virtual',
  'https://zoom.us/j/123456789',
  'YOUR_USER_ID_HERE'
);
```

### Hybrid Event Example
```sql
INSERT INTO events (
  title,
  description,
  event_type,
  start_time,
  end_time,
  is_required,
  location_type,
  location_address,
  zoom_link,
  module_id,
  created_by
) VALUES (
  'Leadership Workshop',
  'Interactive workshop on communication skills',
  'workshop',
  '2025-11-15 14:00:00+00',
  '2025-11-15 17:00:00+00',
  false,
  'hybrid',
  '123 Main Street, Conference Room A',
  'https://zoom.us/j/987654321',
  'MODULE_ID_HERE',
  'YOUR_USER_ID_HERE'
);
```

### In-Person Event Example
```sql
INSERT INTO events (
  title,
  description,
  event_type,
  start_time,
  end_time,
  is_required,
  location_type,
  location_address,
  max_attendees,
  created_by
) VALUES (
  'Book Club Meetup',
  'Discussing this month's leadership book',
  'book_club',
  '2025-11-20 19:00:00+00',
  '2025-11-20 21:00:00+00',
  false,
  'in_person',
  'Local Coffee Shop, 456 Oak Avenue',
  15,
  'YOUR_USER_ID_HERE'
);
```

## Troubleshooting

### Migration Fails
**Problem:** Migration fails to apply

**Solutions:**
- Ensure Docker is running (for local development)
- Check that modules table exists (prerequisite)
- Verify you're connected to the correct database
- Check Supabase logs: `pnpm supabase status`

### Events Don't Show Up
**Problem:** Events page is empty

**Solutions:**
- Check browser console for errors
- Verify RLS policies are applied
- Ensure user is authenticated
- Check Network tab for failed API calls
- Verify events exist in database: `SELECT * FROM events;`

### Can't Create Events
**Problem:** Form submission fails

**Solutions:**
- Check user has admin or facilitator role
- Verify all required fields are filled
- Check browser console for validation errors
- Ensure created_by UUID matches authenticated user

### Zoom Link Not Showing
**Problem:** "Join Zoom" button doesn't appear

**Solutions:**
- Verify event has location_type = 'virtual' or 'hybrid'
- Check zoom_link is properly saved in database
- Ensure user is registered for the event
- Verify event is not in the past

### Module Association Not Working
**Problem:** Can't select modules in form

**Solutions:**
- Check modules exist in database
- Verify modules query is working
- Check browser console for errors
- Ensure modules table is accessible

## Common Issues

### Docker Not Running
```bash
Error: Cannot connect to the Docker daemon
```
**Solution:** Start Docker Desktop before running Supabase commands

### Permission Denied
```bash
Error: permission denied for table events
```
**Solution:** Check RLS policies or use service role key for admin operations

### TypeScript Errors
```bash
Error: Property 'location_type' does not exist
```
**Solution:** Restart TypeScript server in your editor (Cmd/Ctrl + Shift + P > "Restart TypeScript Server")

## Verification Checklist

After setup, verify:
- [ ] Migration applied successfully
- [ ] All new columns exist in events table
- [ ] Admin events page loads without errors
- [ ] Create event form displays correctly
- [ ] Can create virtual event with Zoom link
- [ ] Can create in-person event with address
- [ ] Can create hybrid event with both
- [ ] Can associate event with module
- [ ] Events show in calendar view for participants
- [ ] Registration works for participants
- [ ] Location details display correctly
- [ ] Required/Optional badges show correctly
- [ ] Can edit existing events
- [ ] Can delete events

## Next Steps

Once verified:
1. Create real events for your cohort
2. Test with actual participants
3. Gather feedback on UX
4. Consider implementing future enhancements (see EVENTS_FEATURE.md)

## Support

If you encounter issues:
1. Check the main documentation: `EVENTS_FEATURE.md`
2. Review Supabase logs: `pnpm supabase logs`
3. Check browser console for errors
4. Verify database state with SQL queries
5. Review RLS policies if permissions issues occur

## Quick Commands Reference

```bash
# Start Supabase locally
pnpm supabase start

# Check Supabase status
pnpm supabase status

# Reset database (applies all migrations)
pnpm supabase db reset

# View logs
pnpm supabase logs

# Start development server
pnpm dev

# Type checking
pnpm tsc --noEmit
```




