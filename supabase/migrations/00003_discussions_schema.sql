-- Rogue Leadership Training Experience - Discussions Schema
-- Phase 5: Discussion & Community Features

-- Discussion threads table
CREATE TABLE IF NOT EXISTS discussion_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discussion posts table
CREATE TABLE IF NOT EXISTS discussion_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES discussion_threads(id) ON DELETE CASCADE NOT NULL,
  parent_post_id UUID REFERENCES discussion_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  mentions JSONB DEFAULT '[]'::jsonb,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post reactions table
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES discussion_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'helpful', 'insightful')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Enable Row Level Security
ALTER TABLE discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discussion_threads
CREATE POLICY "Everyone can view threads"
  ON discussion_threads FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can create threads"
  ON discussion_threads FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Thread creators can update own threads"
  ON discussion_threads FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins and facilitators can manage all threads"
  ON discussion_threads FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- RLS Policies for discussion_posts
CREATE POLICY "Everyone can view posts"
  ON discussion_posts FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can create posts"
  ON discussion_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Post authors can update own posts"
  ON discussion_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Post authors can delete own posts"
  ON discussion_posts FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins and facilitators can manage all posts"
  ON discussion_posts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- RLS Policies for post_reactions
CREATE POLICY "Everyone can view reactions"
  ON post_reactions FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can manage own reactions"
  ON post_reactions FOR ALL
  USING (auth.uid() = user_id);

-- Function to update thread updated_at when posts are added
CREATE OR REPLACE FUNCTION update_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE discussion_threads
  SET updated_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update thread timestamp
CREATE TRIGGER update_thread_on_new_post
  AFTER INSERT ON discussion_posts
  FOR EACH ROW EXECUTE FUNCTION update_thread_timestamp();

-- Triggers for updated_at
CREATE TRIGGER update_discussion_threads_updated_at
  BEFORE UPDATE ON discussion_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_posts_updated_at
  BEFORE UPDATE ON discussion_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS discussion_threads_module_idx ON discussion_threads(module_id);
CREATE INDEX IF NOT EXISTS discussion_threads_created_by_idx ON discussion_threads(created_by);
CREATE INDEX IF NOT EXISTS discussion_threads_pinned_idx ON discussion_threads(is_pinned);
CREATE INDEX IF NOT EXISTS discussion_posts_thread_idx ON discussion_posts(thread_id);
CREATE INDEX IF NOT EXISTS discussion_posts_parent_idx ON discussion_posts(parent_post_id);
CREATE INDEX IF NOT EXISTS discussion_posts_author_idx ON discussion_posts(author_id);
CREATE INDEX IF NOT EXISTS post_reactions_post_idx ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS post_reactions_user_idx ON post_reactions(user_id);

