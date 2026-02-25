-- Ensure admins can UPDATE profiles (role assignment) and INSERT into assignments
-- Bazı Postgres sürümlerinde FOR ALL ile USING yeterli olmayabiliyor

-- PROFILES: Admin herhangi bir profil güncelleyebilir (rol ataması)
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles
  FOR ALL
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- platform_assignments ve hotel_assignments 005'te zaten düzeltildi
-- Tekrar uygula (005 çalıştırılmamışsa)
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
