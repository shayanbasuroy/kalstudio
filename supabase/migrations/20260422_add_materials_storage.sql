-- Create materials storage bucket for PDF uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users (owners) to upload files
CREATE POLICY "Authenticated users can upload materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'materials');

-- Allow public read access (for viewing PDFs)
CREATE POLICY "Public can view materials"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'materials');

-- Allow owners to delete materials
CREATE POLICY "Authenticated users can delete materials"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'materials');
