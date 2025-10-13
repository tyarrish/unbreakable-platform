-- Add storage policies for attachments bucket to support videos

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Public can read attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete attachments" ON storage.objects;

-- Policy 1: Anyone can view/read attachments (public access)
CREATE POLICY "Public can read attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'attachments');

-- Policy 2: Authenticated users can upload attachments (including videos)
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- Policy 3: Authenticated users can update attachments
CREATE POLICY "Authenticated users can update attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'attachments');

-- Policy 4: Authenticated users can delete attachments
CREATE POLICY "Authenticated users can delete attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attachments');

