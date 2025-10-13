-- Rogue Leadership Training Experience - Capstone & Analytics Schema
-- Phase 9: Analytics, Capstone & Launch Prep

-- Capstone projects table
CREATE TABLE IF NOT EXISTS capstone_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  milestones JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ,
  feedback TEXT,
  status TEXT CHECK (status IN ('planning', 'in_progress', 'submitted', 'completed')) DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE capstone_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for capstone_projects
CREATE POLICY "Users can view own capstone"
  ON capstone_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own capstone"
  ON capstone_projects FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Facilitators can view all capstones"
  ON capstone_projects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

CREATE POLICY "Facilitators can provide feedback"
  ON capstone_projects FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- RLS Policies for analytics_events
CREATE POLICY "System can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can view analytics events"
  ON analytics_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Triggers for updated_at
CREATE TRIGGER update_capstone_projects_updated_at
  BEFORE UPDATE ON capstone_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS capstone_projects_user_idx ON capstone_projects(user_id);
CREATE INDEX IF NOT EXISTS capstone_projects_status_idx ON capstone_projects(status);
CREATE INDEX IF NOT EXISTS analytics_events_user_idx ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON analytics_events(created_at);

-- Views for analytics

-- Module completion stats
CREATE OR REPLACE VIEW module_completion_stats AS
SELECT 
  m.id as module_id,
  m.title as module_title,
  COUNT(DISTINCT lp.user_id) as users_started,
  COUNT(DISTINCT CASE WHEN lp.status = 'completed' THEN lp.user_id END) as users_completed,
  ROUND(
    COUNT(DISTINCT CASE WHEN lp.status = 'completed' THEN lp.user_id END)::NUMERIC / 
    NULLIF(COUNT(DISTINCT lp.user_id), 0) * 100, 
    2
  ) as completion_percentage
FROM modules m
LEFT JOIN lessons l ON l.module_id = m.id
LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id
GROUP BY m.id, m.title;

-- User engagement stats
CREATE OR REPLACE VIEW user_engagement_stats AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.email,
  p.role,
  COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.status = 'completed') as lessons_completed,
  COUNT(DISTINCT r.id) as reflections_submitted,
  COUNT(DISTINCT dp.id) as discussion_posts,
  COUNT(DISTINCT ea.event_id) FILTER (WHERE ea.status = 'attended') as events_attended,
  COUNT(DISTINCT rp.book_id) FILTER (WHERE rp.status = 'finished') as books_finished,
  p.created_at as joined_at,
  EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 86400 as days_since_join
FROM profiles p
LEFT JOIN lesson_progress lp ON lp.user_id = p.id
LEFT JOIN reflections r ON r.user_id = p.id
LEFT JOIN discussion_posts dp ON dp.author_id = p.id
LEFT JOIN event_attendance ea ON ea.user_id = p.id
LEFT JOIN reading_progress rp ON rp.user_id = p.id
WHERE p.role = 'participant'
GROUP BY p.id, p.full_name, p.email, p.role, p.created_at;

-- Discussion activity stats
CREATE OR REPLACE VIEW discussion_activity_stats AS
SELECT 
  dt.id as thread_id,
  dt.title as thread_title,
  p.full_name as created_by_name,
  COUNT(dp.id) as post_count,
  COUNT(DISTINCT dp.author_id) as unique_participants,
  MAX(dp.created_at) as last_activity,
  dt.is_pinned,
  dt.is_locked
FROM discussion_threads dt
LEFT JOIN discussion_posts dp ON dp.thread_id = dt.id
LEFT JOIN profiles p ON p.id = dt.created_by
GROUP BY dt.id, dt.title, p.full_name, dt.is_pinned, dt.is_locked;

