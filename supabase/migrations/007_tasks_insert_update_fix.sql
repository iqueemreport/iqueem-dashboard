-- Ensure admins and managers can INSERT and UPDATE tasks
-- Bazı Postgres sürümlerinde FOR ALL ile sadece USING yeterli olmayabiliyor

DROP POLICY IF EXISTS "Admins full access tasks" ON tasks;
CREATE POLICY "Admins full access tasks" ON tasks
  FOR ALL
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Managers full access for assigned hotels" ON tasks;
CREATE POLICY "Managers full access for assigned hotels" ON tasks
  FOR ALL
  USING (
    get_user_role(auth.uid()) = 'manager'
    AND (hotel_id IS NULL OR user_assigned_to_hotel(auth.uid(), hotel_id))
  )
  WITH CHECK (
    get_user_role(auth.uid()) = 'manager'
    AND (hotel_id IS NULL OR user_assigned_to_hotel(auth.uid(), hotel_id))
  );

-- Specialists update policy - explicit WITH CHECK
DROP POLICY IF EXISTS "Specialists can update own tasks" ON tasks;
CREATE POLICY "Specialists can update own tasks" ON tasks
  FOR UPDATE
  USING (
    get_user_role(auth.uid()) = 'specialist'
    AND (created_by = auth.uid() OR assignee_id = auth.uid())
  )
  WITH CHECK (
    get_user_role(auth.uid()) = 'specialist'
    AND (created_by = auth.uid() OR assignee_id = auth.uid())
  );
