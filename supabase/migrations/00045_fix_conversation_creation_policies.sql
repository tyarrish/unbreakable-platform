-- Fix Conversation Creation Policies
-- Ensure users can create all types of conversations

-- Drop old conflicting INSERT policies
DROP POLICY IF EXISTS "Authenticated users can create threads" ON discussion_threads;
DROP POLICY IF EXISTS "Users can create conversations" ON discussion_threads;

-- Create single unified INSERT policy for all conversation types
CREATE POLICY "Users can create any conversation type"
  ON discussion_threads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Ensure users can also UPDATE their own threads (for editing group names, etc.)
DROP POLICY IF EXISTS "Thread creators can update own threads" ON discussion_threads;

CREATE POLICY "Thread creators can update own threads"
  ON discussion_threads FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Add helpful comment
COMMENT ON TABLE discussion_threads IS 'Stores all types of conversations: public discussions (module-based), direct messages (1-on-1), and group chats (multi-user)';

