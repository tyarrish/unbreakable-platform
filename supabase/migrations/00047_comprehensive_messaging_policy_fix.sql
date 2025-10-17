-- Comprehensive Messaging Policy Fix
-- Resolve all RLS policy issues for conversation creation

-- ========================================
-- STEP 1: Clean up discussion_threads policies
-- ========================================

-- Drop all existing INSERT policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can create threads" ON discussion_threads;
DROP POLICY IF EXISTS "Users can create conversations" ON discussion_threads;
DROP POLICY IF EXISTS "Users can create any conversation type" ON discussion_threads;

-- Create single, clear INSERT policy for all conversation types
CREATE POLICY "Authenticated users can create any conversation"
  ON discussion_threads FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
  );

-- Ensure UPDATE policy is clear
DROP POLICY IF EXISTS "Thread creators can update own threads" ON discussion_threads;

CREATE POLICY "Creators can update their threads"
  ON discussion_threads FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Ensure DELETE policy exists
DROP POLICY IF EXISTS "Thread creators can delete own threads" ON discussion_threads;

CREATE POLICY "Creators can delete their threads"
  ON discussion_threads FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Keep admin policy for all operations
DROP POLICY IF EXISTS "Admins and facilitators can manage all threads" ON discussion_threads;

CREATE POLICY "Admins can manage all threads"
  ON discussion_threads FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'facilitator')
    )
  );

-- ========================================
-- STEP 2: Verify conversation_members policies are simple
-- ========================================

-- These were fixed in previous migration, but let's ensure they're correct

-- Allow viewing all members (safe because threads are protected)
DROP POLICY IF EXISTS "Authenticated users can view conversation members" ON conversation_members;

CREATE POLICY "Users can view conversation members"
  ON conversation_members FOR SELECT
  TO authenticated
  USING (true);

-- Allow inserting when creating conversations
DROP POLICY IF EXISTS "Allow conversation member creation" ON conversation_members;

CREATE POLICY "Allow adding members to conversations"
  ON conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Thread creator can add members during creation
    EXISTS (
      SELECT 1 FROM discussion_threads dt
      WHERE dt.id = conversation_members.thread_id
      AND dt.created_by = auth.uid()
    )
  );

-- Users can update their own settings
DROP POLICY IF EXISTS "Users can update own membership" ON conversation_members;

CREATE POLICY "Users update own membership settings"
  ON conversation_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can leave (delete their membership)
DROP POLICY IF EXISTS "Users can leave conversations" ON conversation_members;

CREATE POLICY "Users can remove own membership"
  ON conversation_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ========================================
-- STEP 3: Ensure discussion_posts policies work with new system
-- ========================================

-- Keep the existing policies from migration 00043, they should be fine
-- Just verify INSERT policy allows posting to conversations

DROP POLICY IF EXISTS "Authenticated users can create posts" ON discussion_posts;
DROP POLICY IF EXISTS "Users can post to their conversations" ON discussion_posts;

CREATE POLICY "Users can post to accessible conversations"
  ON discussion_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND (
      -- Can post to public discussions
      EXISTS (
        SELECT 1 FROM discussion_threads dt
        WHERE dt.id = discussion_posts.thread_id
        AND dt.conversation_type = 'public_discussion'
      )
      OR
      -- Can post to private conversations they're members of
      EXISTS (
        SELECT 1 FROM discussion_threads dt
        JOIN conversation_members cm ON cm.thread_id = dt.id
        WHERE dt.id = discussion_posts.thread_id
        AND dt.conversation_type IN ('direct_message', 'group_chat')
        AND cm.user_id = auth.uid()
      )
    )
  );

-- Comments for documentation
COMMENT ON POLICY "Authenticated users can create any conversation" ON discussion_threads IS 'Allows any authenticated user to create public discussions, direct messages, or group chats';
COMMENT ON POLICY "Users can view conversation members" ON conversation_members IS 'All authenticated users can see conversation membership (conversation access is controlled by discussion_threads policies)';

