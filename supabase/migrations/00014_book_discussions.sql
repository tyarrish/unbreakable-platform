-- Add reasoning field to books table and create book comments/discussions

-- Ensure uuid extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add reasoning field to books
ALTER TABLE books ADD COLUMN IF NOT EXISTS reasoning TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS key_takeaways TEXT[];

-- Update the books table comment
COMMENT ON COLUMN books.reasoning IS 'Explanation of why this book is included in the leadership library';
COMMENT ON COLUMN books.key_takeaways IS 'Array of key leadership takeaways from the book';

-- Create book_comments table for threaded discussions
CREATE TABLE IF NOT EXISTS book_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES book_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create book_comment_likes table
CREATE TABLE IF NOT EXISTS book_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES book_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE book_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for book_comments
CREATE POLICY "Everyone can view book comments"
  ON book_comments FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can create comments"
  ON book_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON book_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON book_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments"
  ON book_comments FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- RLS Policies for book_comment_likes
CREATE POLICY "Everyone can view comment likes"
  ON book_comment_likes FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can like comments"
  ON book_comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
  ON book_comment_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS book_comments_book_idx ON book_comments(book_id);
CREATE INDEX IF NOT EXISTS book_comments_user_idx ON book_comments(user_id);
CREATE INDEX IF NOT EXISTS book_comments_parent_idx ON book_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS book_comments_created_idx ON book_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS book_comment_likes_comment_idx ON book_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS book_comment_likes_user_idx ON book_comment_likes(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_book_comments_updated_at
  BEFORE UPDATE ON book_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get comment count for a book
CREATE OR REPLACE FUNCTION get_book_comment_count(book_id_param UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM book_comments
  WHERE book_id = book_id_param;
$$ LANGUAGE SQL STABLE;

