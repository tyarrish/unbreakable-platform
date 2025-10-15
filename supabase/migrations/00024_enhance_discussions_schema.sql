-- Enhance discussions schema for rich content and social media features

-- Add rich content support to threads
ALTER TABLE discussion_threads
  ADD COLUMN IF NOT EXISTS content_html TEXT,
  ADD COLUMN IF NOT EXISTS has_media BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Update discussion_posts to support rich HTML content from Tiptap
ALTER TABLE discussion_posts
  ADD COLUMN IF NOT EXISTS content_html TEXT,
  ADD COLUMN IF NOT EXISTS has_media BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb;

-- Add function to update last_activity_at on new posts
CREATE OR REPLACE FUNCTION update_thread_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE discussion_threads
  SET last_activity_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update thread activity
DROP TRIGGER IF EXISTS update_thread_activity_trigger ON discussion_posts;
CREATE TRIGGER update_thread_activity_trigger
  AFTER INSERT ON discussion_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_activity();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_threads_pinned ON discussion_threads(is_pinned, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_activity ON discussion_threads(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_thread ON discussion_posts(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_parent ON discussion_posts(parent_post_id, created_at ASC);

-- Enable real-time for discussions
ALTER PUBLICATION supabase_realtime ADD TABLE discussion_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE discussion_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE post_reactions;

-- Comment for documentation
COMMENT ON COLUMN discussion_threads.content_html IS 'Rich HTML content from Tiptap editor for the initial post';
COMMENT ON COLUMN discussion_threads.media_urls IS 'Array of image/video URLs embedded in the thread';
COMMENT ON COLUMN discussion_posts.content_html IS 'Rich HTML content from Tiptap editor';
COMMENT ON COLUMN discussion_posts.media_urls IS 'Array of image/video URLs embedded in the post';

