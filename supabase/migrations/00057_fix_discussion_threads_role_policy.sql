-- Fix discussion_threads policies to use roles array instead of role column
-- This ensures all discussions are visible after removing the old role column

-- Update the admin policy for discussion_threads
DROP POLICY IF EXISTS "Admins can manage all threads" ON discussion_threads;
DROP POLICY IF EXISTS "Admins manage all conversations" ON discussion_threads;
DROP POLICY IF EXISTS "Admins and facilitators can manage all threads" ON discussion_threads;

CREATE POLICY "Admins can manage all threads"
  ON discussion_threads FOR ALL
  TO authenticated
  USING (user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- Ensure the main SELECT policy is correct
DROP POLICY IF EXISTS "Users can view accessible conversations" ON discussion_threads;
DROP POLICY IF EXISTS "Users can view their accessible threads" ON discussion_threads;

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

-- Log the fix
DO $$
BEGIN
  RAISE NOTICE 'Discussion threads policies updated to use roles array';
  RAISE NOTICE 'All public discussions should now be visible to authenticated users';
END $$;

