-- Messaging System: Direct Messages and Group Chats
-- Extends existing discussion system with private conversations

-- Step 1: Add conversation_type to existing discussion_threads table
ALTER TABLE discussion_threads 
  ADD COLUMN IF NOT EXISTS conversation_type TEXT DEFAULT 'public_discussion',
  ADD COLUMN IF NOT EXISTS conversation_name TEXT; -- For group chat names

-- Add constraint for conversation types
ALTER TABLE discussion_threads DROP CONSTRAINT IF EXISTS discussion_threads_conversation_type_check;
ALTER TABLE discussion_threads ADD CONSTRAINT discussion_threads_conversation_type_check 
  CHECK (conversation_type IN ('public_discussion', 'direct_message', 'group_chat'));

-- Make title nullable for DMs (we'll generate them from participant names)
ALTER TABLE discussion_threads ALTER COLUMN title DROP NOT NULL;

-- Step 2: Create conversation_members table
CREATE TABLE IF NOT EXISTS conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT FALSE,
  is_muted BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id ON conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_thread_id ON conversation_members(thread_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_archived ON conversation_members(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_conversation_type ON discussion_threads(conversation_type);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_updated_at ON discussion_threads(updated_at DESC);

-- Step 4: Enable RLS on conversation_members
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

-- Step 5: Update RLS policies for discussion_threads to handle private conversations

-- Drop existing public view policy for threads
DROP POLICY IF EXISTS "Everyone can view threads" ON discussion_threads;

-- New policy: Users can view public discussions OR private conversations they're members of
CREATE POLICY "Users can view their accessible threads"
  ON discussion_threads FOR SELECT
  USING (
    conversation_type = 'public_discussion' 
    OR 
    EXISTS (
      SELECT 1 FROM conversation_members 
      WHERE conversation_members.thread_id = discussion_threads.id 
      AND conversation_members.user_id = auth.uid()
    )
  );

-- Users can create any type of conversation
CREATE POLICY "Users can create conversations"
  ON discussion_threads FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Step 6: Update RLS policies for discussion_posts to respect conversation privacy

-- Drop existing public view policy for posts
DROP POLICY IF EXISTS "Everyone can view posts" ON discussion_posts;

-- New policy: Users can view posts in threads they have access to
CREATE POLICY "Users can view accessible posts"
  ON discussion_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM discussion_threads dt
      WHERE dt.id = discussion_posts.thread_id
      AND (
        dt.conversation_type = 'public_discussion'
        OR
        EXISTS (
          SELECT 1 FROM conversation_members cm
          WHERE cm.thread_id = dt.id
          AND cm.user_id = auth.uid()
        )
      )
    )
  );

-- Users can post to conversations they're members of
CREATE POLICY "Users can post to their conversations"
  ON discussion_posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM discussion_threads dt
      WHERE dt.id = discussion_posts.thread_id
      AND (
        dt.conversation_type = 'public_discussion'
        OR
        EXISTS (
          SELECT 1 FROM conversation_members cm
          WHERE cm.thread_id = dt.id
          AND cm.user_id = auth.uid()
        )
      )
    )
  );

-- Step 7: RLS policies for conversation_members

CREATE POLICY "Users can view conversation members for their conversations"
  ON conversation_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members cm
      WHERE cm.thread_id = conversation_members.thread_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own membership"
  ON conversation_members FOR ALL
  USING (user_id = auth.uid());

-- Conversation creators can add members
CREATE POLICY "Conversation creators can add members"
  ON conversation_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM discussion_threads dt
      WHERE dt.id = conversation_members.thread_id
      AND dt.created_by = auth.uid()
    )
  );

-- Step 8: Helper function to get unread count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT dp.thread_id) INTO unread_count
  FROM discussion_posts dp
  JOIN conversation_members cm ON cm.thread_id = dp.thread_id
  JOIN discussion_threads dt ON dt.id = dp.thread_id
  WHERE cm.user_id = user_uuid
    AND dt.conversation_type IN ('direct_message', 'group_chat')
    AND dp.created_at > COALESCE(cm.last_read_at, cm.joined_at)
    AND dp.author_id != user_uuid;
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Helper function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(thread_uuid UUID, user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE conversation_members
  SET last_read_at = NOW()
  WHERE thread_id = thread_uuid
    AND user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Add comments for clarity
COMMENT ON COLUMN discussion_threads.conversation_type IS 'Type of conversation: public_discussion (module discussions), direct_message (1-on-1), group_chat (small group)';
COMMENT ON COLUMN discussion_threads.conversation_name IS 'Optional name for group chats (e.g., "Leadership Team")';
COMMENT ON TABLE conversation_members IS 'Tracks who has access to private conversations and their read status';
COMMENT ON COLUMN conversation_members.last_read_at IS 'Last time user read messages in this conversation (for unread badges)';
COMMENT ON COLUMN conversation_members.is_archived IS 'User has archived this conversation from their inbox';
COMMENT ON COLUMN conversation_members.is_muted IS 'User has muted notifications for this conversation';

