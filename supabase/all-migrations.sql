-- Rogue Leadership Training Experience - Initial Database Schema
-- Phase 3: Authentication & User Management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'facilitator', 'participant')) DEFAULT 'participant',
  avatar_url TEXT,
  bio TEXT,
  learning_preferences JSONB DEFAULT '{}'::jsonb,
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins and facilitators can read all profiles
CREATE POLICY "Admins and facilitators can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
    )
  );

-- Only admins can insert/delete profiles
CREATE POLICY "Only admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile changes
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_partner_id_idx ON profiles(partner_id);

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

-- Rogue Leadership Training Experience - Events Schema
-- Phase 7: Events & Calendar Management

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('cohort_call', 'workshop', 'book_club', 'office_hours')) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  zoom_link TEXT,
  zoom_meeting_id TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  max_attendees INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event attendance table
CREATE TABLE IF NOT EXISTS event_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('registered', 'attended', 'missed')) DEFAULT 'registered',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Event reminders table
CREATE TABLE IF NOT EXISTS event_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reminder_time TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Everyone can view events"
  ON events FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins and facilitators can manage events"
  ON events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- RLS Policies for event_attendance
CREATE POLICY "Everyone can view attendance"
  ON event_attendance FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can manage own attendance"
  ON event_attendance FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all attendance"
  ON event_attendance FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for event_reminders
CREATE POLICY "Users can view own reminders"
  ON event_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage reminders"
  ON event_reminders FOR ALL
  USING (TRUE);

-- Triggers for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_attendance_updated_at
  BEFORE UPDATE ON event_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS events_start_time_idx ON events(start_time);
CREATE INDEX IF NOT EXISTS events_event_type_idx ON events(event_type);
CREATE INDEX IF NOT EXISTS events_created_by_idx ON events(created_by);
CREATE INDEX IF NOT EXISTS event_attendance_event_idx ON event_attendance(event_id);
CREATE INDEX IF NOT EXISTS event_attendance_user_idx ON event_attendance(user_id);
CREATE INDEX IF NOT EXISTS event_reminders_event_idx ON event_reminders(event_id);
CREATE INDEX IF NOT EXISTS event_reminders_sent_idx ON event_reminders(sent, reminder_time);

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

-- Rogue Leadership Training Experience - Partners Schema
-- Phase 6: Partner Matching & Accountability

-- Partner questionnaire table
CREATE TABLE IF NOT EXISTS partner_questionnaire (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner check-ins table
CREATE TABLE IF NOT EXISTS partner_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  prompt TEXT,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- Partner messages table (private 1:1)
CREATE TABLE IF NOT EXISTS partner_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE partner_questionnaire ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_questionnaire
CREATE POLICY "Users can view own questionnaire"
  ON partner_questionnaire FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own questionnaire"
  ON partner_questionnaire FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all questionnaires"
  ON partner_questionnaire FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for partner_checkins
CREATE POLICY "Users can view own and partner check-ins"
  ON partner_checkins FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can manage own check-ins"
  ON partner_checkins FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Facilitators can view all check-ins"
  ON partner_checkins FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- RLS Policies for partner_messages
CREATE POLICY "Users can view messages they sent or received"
  ON partner_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages to their partner"
  ON partner_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND partner_id = receiver_id
    )
  );

CREATE POLICY "Users can update messages they received"
  ON partner_messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_message_as_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS partner_questionnaire_user_idx ON partner_questionnaire(user_id);
CREATE INDEX IF NOT EXISTS partner_checkins_user_idx ON partner_checkins(user_id);
CREATE INDEX IF NOT EXISTS partner_checkins_partner_idx ON partner_checkins(partner_id);
CREATE INDEX IF NOT EXISTS partner_checkins_week_idx ON partner_checkins(week_number);
CREATE INDEX IF NOT EXISTS partner_messages_sender_idx ON partner_messages(sender_id);
CREATE INDEX IF NOT EXISTS partner_messages_receiver_idx ON partner_messages(receiver_id);
CREATE INDEX IF NOT EXISTS partner_messages_read_idx ON partner_messages(is_read);

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

