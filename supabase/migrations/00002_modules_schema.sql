-- Rogue Leadership Training Experience - Modules Schema
-- Phase 4: Learning Management System

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL UNIQUE,
  release_date TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT FALSE,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  order_number INTEGER NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, order_number)
);

-- Lesson attachments table
CREATE TABLE IF NOT EXISTS lesson_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Reflections table
CREATE TABLE IF NOT EXISTS reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for modules
CREATE POLICY "Everyone can view published modules"
  ON modules FOR SELECT
  USING (is_published = TRUE OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

CREATE POLICY "Admins and facilitators can manage modules"
  ON modules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- RLS Policies for lessons
CREATE POLICY "Everyone can view lessons of published modules"
  ON lessons FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM modules WHERE id = lessons.module_id AND (is_published = TRUE OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
    ))
  ));

CREATE POLICY "Admins and facilitators can manage lessons"
  ON lessons FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- RLS Policies for lesson_attachments
CREATE POLICY "Everyone can view attachments"
  ON lesson_attachments FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins and facilitators can manage attachments"
  ON lesson_attachments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- RLS Policies for lesson_progress
CREATE POLICY "Users can view own progress"
  ON lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
  ON lesson_progress FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON lesson_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for reflections
CREATE POLICY "Users can view own reflections"
  ON reflections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reflections"
  ON reflections FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Facilitators can view all reflections"
  ON reflections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- Triggers for updated_at
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reflections_updated_at
  BEFORE UPDATE ON reflections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS modules_order_idx ON modules(order_number);
CREATE INDEX IF NOT EXISTS modules_published_idx ON modules(is_published);
CREATE INDEX IF NOT EXISTS lessons_module_idx ON lessons(module_id);
CREATE INDEX IF NOT EXISTS lessons_order_idx ON lessons(module_id, order_number);
CREATE INDEX IF NOT EXISTS lesson_progress_user_idx ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS lesson_progress_lesson_idx ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS lesson_progress_status_idx ON lesson_progress(status);
CREATE INDEX IF NOT EXISTS reflections_user_idx ON reflections(user_id);
CREATE INDEX IF NOT EXISTS reflections_lesson_idx ON reflections(lesson_id);

