-- Allow report uploaders to update their own reports
-- Admins and managers already have full access via existing policies
CREATE POLICY "Users can update own reports" ON hotel_reports
  FOR UPDATE
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());
