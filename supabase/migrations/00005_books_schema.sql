-- Rogue Leadership Training Experience - Books Schema
-- Phase 8: Book Library & Reading Progress

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_image_url TEXT,
  description TEXT,
  isbn TEXT,
  amazon_link TEXT,
  goodreads_link TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  assigned_month INTEGER CHECK (assigned_month >= 1 AND assigned_month <= 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading progress table
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('want_to_read', 'reading', 'finished')) DEFAULT 'want_to_read',
  started_at DATE,
  finished_at DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Reading groups table
CREATE TABLE IF NOT EXISTS reading_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for books
CREATE POLICY "Everyone can view books"
  ON books FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins and facilitators can manage books"
  ON books FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- RLS Policies for reading_progress
CREATE POLICY "Users can view own reading progress"
  ON reading_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reading progress"
  ON reading_progress FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Facilitators can view all reading progress"
  ON reading_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- RLS Policies for reading_groups
CREATE POLICY "Everyone can view reading groups"
  ON reading_groups FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins and facilitators can manage reading groups"
  ON reading_groups FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- Triggers for updated_at
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_progress_updated_at
  BEFORE UPDATE ON reading_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_groups_updated_at
  BEFORE UPDATE ON reading_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS books_featured_idx ON books(is_featured);
CREATE INDEX IF NOT EXISTS books_assigned_month_idx ON books(assigned_month);
CREATE INDEX IF NOT EXISTS reading_progress_user_idx ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS reading_progress_book_idx ON reading_progress(book_id);
CREATE INDEX IF NOT EXISTS reading_progress_status_idx ON reading_progress(status);
CREATE INDEX IF NOT EXISTS reading_groups_book_idx ON reading_groups(book_id);

