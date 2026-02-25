-- RLS Policies for IQUEEM Agency Dashboard

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_reports ENABLE ROW LEVEL SECURITY;

-- Helper: Get user role from profiles
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = user_id LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: Check if user is assigned to hotel
CREATE OR REPLACE FUNCTION user_assigned_to_hotel(uid UUID, hotel_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM hotel_assignments
    WHERE hotel_assignments.user_id = uid AND hotel_assignments.hotel_id = hotel_id_param
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: Check if user has platform assignment
CREATE OR REPLACE FUNCTION user_has_platform(uid UUID, platform_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM platform_assignments
    WHERE user_id = uid AND platform = platform_name
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update any profile" ON profiles
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- HOTELS
CREATE POLICY "Authenticated users can view hotels" ON hotels
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage hotels" ON hotels
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Managers manage assigned hotels" ON hotels
  FOR ALL USING (
    get_user_role(auth.uid()) = 'manager'
    AND user_assigned_to_hotel(auth.uid(), id)
  );

-- PLATFORM_ASSIGNMENTS
CREATE POLICY "Authenticated can view platform assignments" ON platform_assignments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage platform assignments" ON platform_assignments
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- HOTEL_ASSIGNMENTS
CREATE POLICY "Authenticated can view hotel assignments" ON hotel_assignments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage hotel assignments" ON hotel_assignments
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- TASKS
CREATE POLICY "Authenticated can view tasks" ON tasks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access tasks" ON tasks
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Managers full access for assigned hotels" ON tasks
  FOR ALL USING (
    get_user_role(auth.uid()) = 'manager'
    AND (hotel_id IS NULL OR user_assigned_to_hotel(auth.uid(), hotel_id))
  );

CREATE POLICY "Specialists can insert tasks" ON tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Specialists can update own tasks" ON tasks
  FOR UPDATE USING (
    get_user_role(auth.uid()) = 'specialist'
    AND (created_by = auth.uid() OR assignee_id = auth.uid())
  );

CREATE POLICY "Specialists can delete own tasks" ON tasks
  FOR DELETE USING (
    get_user_role(auth.uid()) = 'specialist'
    AND created_by = auth.uid()
  );

-- TASK_COMMENTS
CREATE POLICY "Authenticated can view comments" ON task_comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access task_comments" ON task_comments
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Managers full access comments for assigned hotels" ON task_comments
  FOR ALL USING (
    get_user_role(auth.uid()) = 'manager'
    AND EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_id AND (t.hotel_id IS NULL OR user_assigned_to_hotel(auth.uid(), t.hotel_id)))
  );

CREATE POLICY "Specialists manage own comments" ON task_comments
  FOR ALL USING (
    get_user_role(auth.uid()) = 'specialist'
    AND user_id = auth.uid()
  );

-- TASK_ATTACHMENTS
CREATE POLICY "Authenticated can view attachments" ON task_attachments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access attachments" ON task_attachments
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Specialists manage own attachments" ON task_attachments
  FOR ALL USING (
    get_user_role(auth.uid()) = 'specialist'
    AND user_id = auth.uid()
  );

-- BUDGETS (platform assignment check for specialists)
CREATE POLICY "Authenticated can view budgets" ON budgets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access budgets" ON budgets
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Managers full access budgets for assigned hotels" ON budgets
  FOR ALL USING (
    get_user_role(auth.uid()) = 'manager'
    AND user_assigned_to_hotel(auth.uid(), hotel_id)
  );

CREATE POLICY "Specialists edit only assigned platform budgets" ON budgets
  FOR UPDATE USING (
    get_user_role(auth.uid()) = 'specialist'
    AND user_has_platform(auth.uid(), platform)
    AND assigned_user_id = auth.uid()
  );

CREATE POLICY "Admins and managers can insert budgets" ON budgets
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'manager')
  );

-- CAMPAIGNS
CREATE POLICY "Authenticated can view campaigns" ON campaigns
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access campaigns" ON campaigns
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Managers full access for assigned hotels" ON campaigns
  FOR ALL USING (
    get_user_role(auth.uid()) = 'manager'
    AND user_assigned_to_hotel(auth.uid(), hotel_id)
  );

CREATE POLICY "Authenticated can insert campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Specialists update own campaigns" ON campaigns
  FOR UPDATE USING (created_by = auth.uid());

-- HOTEL_REPORTS
CREATE POLICY "Authenticated can view reports" ON hotel_reports
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert reports" ON hotel_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins full access reports" ON hotel_reports
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Managers full access reports for assigned hotels" ON hotel_reports
  FOR ALL USING (
    get_user_role(auth.uid()) = 'manager'
    AND user_assigned_to_hotel(auth.uid(), hotel_id)
  );
