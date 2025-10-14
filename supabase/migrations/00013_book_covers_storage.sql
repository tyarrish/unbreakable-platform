-- Storage Bucket for Book Covers

-- Create the book-covers bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for book-covers

-- Policy 1: Anyone can view/read book covers (public access)
CREATE POLICY "Anyone can view book covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'book-covers');

-- Policy 2: Authenticated users (admins/facilitators) can upload
CREATE POLICY "Authenticated users can upload book covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-covers');

-- Policy 3: Authenticated users can update book covers
CREATE POLICY "Authenticated users can update book covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'book-covers');

-- Policy 4: Authenticated users can delete book covers
CREATE POLICY "Authenticated users can delete book covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'book-covers');




