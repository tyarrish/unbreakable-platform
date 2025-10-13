-- Storage Bucket Policies for RLTE Platform
-- Run these in Supabase SQL Editor after creating buckets

-- ============================================
-- LESSON VIDEOS BUCKET POLICIES
-- ============================================

-- Policy 1: Anyone can view/read videos (public bucket)
CREATE POLICY "Anyone can view lesson videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-videos');

-- Policy 2: Authenticated users with admin/facilitator role can upload
CREATE POLICY "Admins can upload lesson videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-videos' AND
  (storage.foldername(name))[1] = 'lessons'
);

-- Policy 3: Admins can update videos
CREATE POLICY "Admins can update lesson videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'lesson-videos');

-- Policy 4: Admins can delete videos
CREATE POLICY "Admins can delete lesson videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'lesson-videos');

-- ============================================
-- ATTACHMENTS BUCKET POLICIES (if not set)
-- ============================================

-- Public read for attachments
CREATE POLICY "Public can read attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'attachments');

-- Authenticated users can upload attachments
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- Users can delete their own attachments
CREATE POLICY "Authenticated users can delete attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attachments');

-- ============================================
-- AVATARS BUCKET POLICIES (if not already set)
-- ============================================

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

