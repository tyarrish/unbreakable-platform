-- Reset discussion_threads RLS completely
-- This will clear all policies and rebuild them from scratch

-- Disable RLS
ALTER TABLE discussion_threads DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS  
ALTER TABLE discussion_threads ENABLE ROW LEVEL SECURITY;

-- ========================================
-- REBUILD ALL POLICIES FROM SCRATCH
-- ========================================

-- 1. SELECT: Users can view public discussions OR private conversations they're members of
CREATE POLICY "Users can view accessible conversations"
  ON discussion_threads FOR SELECT
  TO authenticated
  USING (
    conversation_type = 'public_discussion' 
    OR 
    EXISTS (
      SELECT 1 FROM conversation_members 
      WHERE conversation_members.thread_id = discussion_threads.id 
      AND conversation_members.user_id = auth.uid()
    )
  );

-- 2. INSERT: Any authenticated user can create any type of conversation
CREATE POLICY "Users can create conversations"
  ON discussion_threads FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- 3. UPDATE: Users can update their own threads
CREATE POLICY "Users can update own conversations"
  ON discussion_threads FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- 4. DELETE: Users can delete their own threads
CREATE POLICY "Users can delete own conversations"
  ON discussion_threads FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- 5. ALL: Admins can do everything
CREATE POLICY "Admins manage all conversations"
  ON discussion_threads FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'facilitator')
    )
  );

