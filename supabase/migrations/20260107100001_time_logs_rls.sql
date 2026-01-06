-- ============================================
-- RLS POLICIES FOR TIME_LOGS
-- ============================================

-- Users can view their own time logs
CREATE POLICY "Users can view own time logs"
  ON time_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own time logs
CREATE POLICY "Users can create own time logs"
  ON time_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own time logs
CREATE POLICY "Users can update own time logs"
  ON time_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own time logs
CREATE POLICY "Users can delete own time logs"
  ON time_logs FOR DELETE
  USING (auth.uid() = user_id);
