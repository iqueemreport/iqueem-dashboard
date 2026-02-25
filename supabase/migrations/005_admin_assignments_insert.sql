-- Ensure admins can INSERT into platform_assignments and hotel_assignments
-- (Some Postgres versions may require explicit WITH CHECK for INSERT)

DROP POLICY IF EXISTS "Admins manage platform assignments" ON platform_assignments;
CREATE POLICY "Admins manage platform assignments" ON platform_assignments
  FOR ALL
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins manage hotel assignments" ON hotel_assignments;
CREATE POLICY "Admins manage hotel assignments" ON hotel_assignments
  FOR ALL
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');
