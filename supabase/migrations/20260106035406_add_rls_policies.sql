-- ============================================
-- USERS TABLE - ROW LEVEL SECURITY
-- ============================================

-- Users bisa melihat data mereka sendiri
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users bisa update data mereka sendiri
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- PROJECTS TABLE - ROW LEVEL SECURITY
-- ============================================

-- Users bisa melihat project yang mereka buat
CREATE POLICY "Users can view own projects"
  ON projects
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR deleted_at IS NULL
  );

-- Users bisa create project
CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Users bisa update project mereka sendiri
CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  USING (created_by = auth.uid());

-- ============================================
-- TASKS TABLE - ROW LEVEL SECURITY (PENTING!)
-- ============================================

-- SELECT: Users melihat task yang relevan
CREATE POLICY "Users can view tasks they created or are assigned to"
  ON tasks
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR requester = auth.email()
    OR pic = auth.email()
    OR deleted_at IS NULL
  );

-- INSERT: Users bisa create task
CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- UPDATE: Users bisa update task mereka
CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  USING (created_by = auth.uid());
