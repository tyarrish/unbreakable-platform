# Fix Storage RLS Error

## Problem
You're seeing: `StorageApiError: new row violates row-level security policy`

This happens when storage buckets exist but don't have proper Row Level Security (RLS) policies configured.

## Solution

Apply the new migration `00015_fix_storage_policies.sql` to fix all storage permissions.

---

## Method 1: Using Supabase Dashboard (Recommended)

1. **Go to**: [Supabase SQL Editor](https://supabase.com/dashboard/project/jtwmuugzyzauoyjvpymh/sql/new)

2. **Copy and paste** the entire contents of:
   ```
   supabase/migrations/00015_fix_storage_policies.sql
   ```

3. **Click**: "Run" button (▶️)

4. **Verify**: You should see "Success. No rows returned" message

5. **Test**: Refresh your app and try uploading again

---

## Method 2: Using Supabase CLI

If you have the Supabase CLI linked to your project:

```bash
# From project root
supabase db push
```

This will apply all pending migrations including the storage policy fixes.

---

## What This Migration Does

✅ Creates all necessary storage buckets:
   - `lesson-videos` (for module video content)
   - `attachments` (for lesson resources)
   - `book-covers` (for book cover images)
   - `avatars` (for user profile pictures)

✅ Removes any conflicting old policies

✅ Creates proper RLS policies for each bucket:
   - **Public read access** - Anyone can view files
   - **Authenticated upload** - Logged-in users can upload
   - **Authenticated update/delete** - Logged-in users can manage files
   - **Avatar restrictions** - Users can only manage their own avatars

---

## After Running Migration

The following features should work without errors:
- ✅ Uploading book covers
- ✅ Uploading lesson videos
- ✅ Uploading lesson attachments/resources
- ✅ Uploading profile avatars
- ✅ Viewing all uploaded media

---

## Still Having Issues?

### Check Bucket Existence
Go to: [Storage Buckets](https://supabase.com/dashboard/project/jtwmuugzyzauoyjvpymh/storage/buckets)

You should see these 4 buckets (all public):
- lesson-videos
- attachments
- book-covers
- avatars

### Check Policies
For each bucket, click the settings (⚙️) icon → Policies

You should see 4 policies per bucket:
- SELECT (public)
- INSERT (authenticated)
- UPDATE (authenticated)
- DELETE (authenticated)

### Clear Browser Cache
Sometimes cached errors persist. Try:
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Clear site data in DevTools
3. Restart the dev server









