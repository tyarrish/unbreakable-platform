# Supabase Setup Guide

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Install Supabase CLI: `npm install -g supabase`

## Creating Projects

Create three separate Supabase projects:

1. **Development**: For local/dev environment
2. **Staging**: For testing before production
3. **Production**: For live application

## Database Setup

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file in order (00001 through 00007)
4. Execute each migration

### Option 2: Using Supabase CLI

1. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

2. Push migrations:
   ```bash
   supabase db push
   ```

## Migration Files

Run migrations in this order:

1. `00001_initial_schema.sql` - User profiles and authentication
2. `00002_modules_schema.sql` - Learning modules and lessons
3. `00003_discussions_schema.sql` - Discussion forums
4. `00004_events_schema.sql` - Event calendar
5. `00005_books_schema.sql` - Book library
6. `00006_partners_schema.sql` - Accountability partners
7. `00007_capstone_analytics_schema.sql` - Capstone projects and analytics

## Storage Buckets

Create the following storage buckets in your Supabase project:

### 1. `avatars`
- **Public**: Yes
- **File size limit**: 5MB
- **Allowed MIME types**: image/jpeg, image/png, image/webp
- **Policies**:
  - Users can upload to their own folder
  - Everyone can read

### 2. `module-content`
- **Public**: Yes  
- **File size limit**: 10MB
- **Allowed MIME types**: All
- **Policies**:
  - Admins/facilitators can upload
  - Everyone can read

### 3. `attachments`
- **Public**: No
- **File size limit**: 10MB
- **Allowed MIME types**: All
- **Policies**:
  - Users can upload
  - Users can read files from their lessons

### 4. `book-covers`
- **Public**: Yes
- **File size limit**: 5MB
- **Allowed MIME types**: image/jpeg, image/png, image/webp
- **Policies**:
  - Admins can upload
  - Everyone can read

## Storage Policies

### Avatars Bucket Policies

```sql
-- Allow users to upload avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### Module Content Bucket Policies

```sql
-- Admins and facilitators can upload
CREATE POLICY "Admins can upload module content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'module-content' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  )
);

-- Public read access
CREATE POLICY "Public can read module content"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'module-content');
```

## Environment Variables

After setting up your Supabase projects, get the following values:

1. Go to Project Settings > API
2. Copy these values to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **Never commit the service role key to version control!**

## Setting Up Authentication

1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email templates (optional):
   - Customize confirmation emails
   - Customize password reset emails
   - Use RLTE branding

## Creating the First Admin User

After running migrations, create your first admin user:

1. Sign up through the app (creates participant by default)
2. In Supabase dashboard, go to Table Editor > profiles
3. Find your user and change role to 'admin'

Or use SQL:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## Verifying Setup

Run these queries to verify your setup:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Generating TypeScript Types

After setting up your database, generate TypeScript types:

```bash
npx supabase gen types typescript --project-id your-project-ref > types/supabase.types.ts
```

## Backup Strategy

1. Enable automatic backups in Supabase dashboard
2. For production, consider setting up additional backups
3. Export database periodically during development

## Monitoring

1. Go to Database > Performance
2. Monitor slow queries
3. Add indexes as needed
4. Check RLS policies are working correctly

## Next Steps

1. ✅ Run all migrations
2. ✅ Create storage buckets
3. ✅ Set up storage policies
4. ✅ Configure authentication
5. ✅ Create admin user
6. ✅ Generate TypeScript types
7. ✅ Test connection from application

---

For issues or questions, refer to [Supabase Documentation](https://supabase.com/docs).

