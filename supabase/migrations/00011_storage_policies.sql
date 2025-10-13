-- Storage Bucket Policies for lesson-videos

-- Policy 1: Anyone can view/read videos (public access)
CREATE POLICY "Anyone can view lesson videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-videos');

-- Policy 2: Authenticated users can upload
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lesson-videos');

-- Policy 3: Authenticated users can update videos
CREATE POLICY "Authenticated users can update videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'lesson-videos');

-- Policy 4: Authenticated users can delete videos
CREATE POLICY "Authenticated users can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'lesson-videos');
