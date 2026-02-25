-- Storage bucket for reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload
CREATE POLICY "Authenticated users can upload reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reports'
  AND auth.role() = 'authenticated'
);

-- Storage policy: authenticated users can read
CREATE POLICY "Authenticated users can read reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports'
  AND auth.role() = 'authenticated'
);

-- Storage policy: users can delete own uploads
CREATE POLICY "Users can delete own report uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'reports'
  AND auth.uid() = owner
);
