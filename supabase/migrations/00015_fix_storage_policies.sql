-- Fix Storage Policies for All Buckets
-- This migration ensures all storage buckets have proper RLS policies

-- ============================================
-- CREATE BUCKETS (if they don't exist)
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('lesson-videos', 'lesson-videos', true),
  ('attachments', 'attachments', true),
  ('book-covers', 'book-covers', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- ============================================
-- DROP EXISTING POLICIES (to avoid conflicts)
-- ============================================

DROP POLICY IF EXISTS "Anyone can view lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON storage.objects;

DROP POLICY IF EXISTS "Public can read attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update attachments" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can view book covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload book covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update book covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete book covers" ON storage.objects;

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- ============================================
-- LESSON-VIDEOS BUCKET POLICIES
-- ============================================

CREATE POLICY "lesson_videos_public_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-videos');

CREATE POLICY "lesson_videos_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lesson-videos');

CREATE POLICY "lesson_videos_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'lesson-videos')
WITH CHECK (bucket_id = 'lesson-videos');

CREATE POLICY "lesson_videos_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'lesson-videos');

-- ============================================
-- ATTACHMENTS BUCKET POLICIES
-- ============================================

CREATE POLICY "attachments_public_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'attachments');

CREATE POLICY "attachments_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "attachments_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'attachments')
WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "attachments_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attachments');

-- ============================================
-- BOOK-COVERS BUCKET POLICIES
-- ============================================

CREATE POLICY "book_covers_public_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'book-covers');

CREATE POLICY "book_covers_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-covers');

CREATE POLICY "book_covers_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'book-covers')
WITH CHECK (bucket_id = 'book-covers');

CREATE POLICY "book_covers_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'book-covers');

-- ============================================
-- AVATARS BUCKET POLICIES
-- ============================================

CREATE POLICY "avatars_public_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);









