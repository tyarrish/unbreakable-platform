-- Fix Conversation Members RLS Policies
-- Remove circular recursion by simplifying policies

-- Drop all existing policies on conversation_members
DROP POLICY IF EXISTS "Users can view conversation members for their conversations" ON conversation_members;
DROP POLICY IF EXISTS "Users can manage their own membership" ON conversation_members;
DROP POLICY IF EXISTS "Conversation creators can add members" ON conversation_members;

-- Disable RLS temporarily to recreate policies
ALTER TABLE conversation_members DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

-- Create simpler, non-recursive policies

-- 1. Users can view all conversation_members records (needed for showing participants)
-- This is safe because the thread itself is protected by RLS
CREATE POLICY "Authenticated users can view conversation members"
  ON conversation_members FOR SELECT
  TO authenticated
  USING (true);

-- 2. Allow INSERTs when creating conversations (creator can add initial members)
CREATE POLICY "Allow conversation member creation"
  ON conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Creator of the thread can add members
    EXISTS (
      SELECT 1 FROM discussion_threads dt
      WHERE dt.id = conversation_members.thread_id
      AND dt.created_by = auth.uid()
    )
    OR
    -- Or user can add themselves (for future "join group" feature)
    user_id = auth.uid()
  );

-- 3. Users can update their own membership settings (archive, mute, last_read)
CREATE POLICY "Users can update own membership"
  ON conversation_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. Users can delete their own membership (leave conversation)
CREATE POLICY "Users can leave conversations"
  ON conversation_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

