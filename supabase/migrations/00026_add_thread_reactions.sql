-- Add reactions table for discussion threads (separate from post reactions)
CREATE TABLE IF NOT EXISTS thread_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES discussion_threads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'love', 'surprise')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(thread_id, user_id, reaction_type)
);

-- Update post_reactions to include new reaction types
ALTER TABLE post_reactions 
  DROP CONSTRAINT IF EXISTS post_reactions_reaction_type_check;

ALTER TABLE post_reactions
  ADD CONSTRAINT post_reactions_reaction_type_check 
  CHECK (reaction_type IN ('like', 'love', 'surprise', 'helpful', 'insightful'));

-- Enable Row Level Security
ALTER TABLE thread_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for thread_reactions
CREATE POLICY "Anyone can view thread reactions"
  ON thread_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add own thread reactions"
  ON thread_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own thread reactions"
  ON thread_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Add to real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE thread_reactions;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_thread_reactions_thread ON thread_reactions(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_reactions_user ON thread_reactions(user_id);

