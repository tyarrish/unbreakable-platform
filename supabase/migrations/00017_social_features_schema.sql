-- Social Features Schema
-- Add location and interests to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS goals TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- User follows table for social connections
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'mention', 'reply', 'follow', 'achievement', 'event_reminder', 'partner_message'
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Activity feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'lesson_completed', 'discussion_post', 'event_registered', 'book_progress', 'achievement_earned', 'module_completed'
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX idx_activity_feed_type ON activity_feed(activity_type);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT, -- icon name or emoji
  category TEXT, -- 'learning', 'community', 'consistency', 'special'
  points INTEGER DEFAULT 0,
  requirements JSONB, -- criteria for earning the achievement
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned_at ON user_achievements(earned_at DESC);

-- User engagement tracking
CREATE TABLE IF NOT EXISTS user_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  login_count INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  discussions_posted INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_user_engagement_user_id ON user_engagement(user_id);
CREATE INDEX idx_user_engagement_date ON user_engagement(date DESC);

-- Resource bookmarks
CREATE TABLE IF NOT EXISTS resource_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'lesson', 'book', 'attachment'
  resource_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_type, resource_id)
);

CREATE INDEX idx_resource_bookmarks_user_id ON resource_bookmarks(user_id);

-- Study groups
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  max_members INTEGER,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_study_group_members_group_id ON study_group_members(group_id);
CREATE INDEX idx_study_group_members_user_id ON study_group_members(user_id);

-- RLS Policies

-- User Follows
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows"
  ON user_follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow others"
  ON user_follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON user_follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Activity Feed
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all activity"
  ON activity_feed FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own activity"
  ON activity_feed FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage achievements"
  ON achievements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'facilitator')
    )
  );

-- User Achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all user achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can award achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- User Engagement
ALTER TABLE user_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all engagement data"
  ON user_engagement FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own engagement"
  ON user_engagement FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Resource Bookmarks
ALTER TABLE resource_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
  ON resource_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookmarks"
  ON resource_bookmarks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Study Groups
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public groups"
  ON study_groups FOR SELECT
  TO authenticated
  USING (
    NOT is_private OR
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_groups.id
      AND study_group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups"
  ON study_groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update"
  ON study_groups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_groups.id
      AND study_group_members.user_id = auth.uid()
      AND study_group_members.role = 'admin'
    )
  );

-- Study Group Members
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group members"
  ON study_group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_groups
      WHERE study_groups.id = study_group_members.group_id
      AND (
        NOT study_groups.is_private OR
        EXISTS (
          SELECT 1 FROM study_group_members sgm2
          WHERE sgm2.group_id = study_groups.id
          AND sgm2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can join groups"
  ON study_group_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON study_group_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert initial achievements
INSERT INTO achievements (name, description, icon, category, points) VALUES
  ('First Steps', 'Complete your first lesson', '🎯', 'learning', 10),
  ('Module Master', 'Complete your first module', '📚', 'learning', 50),
  ('Discussion Starter', 'Create your first discussion post', '💬', 'community', 20),
  ('Event Enthusiast', 'Attend your first event', '📅', 'community', 15),
  ('Book Lover', 'Finish reading your first book', '📖', 'learning', 30),
  ('Helping Hand', 'Receive 5 likes on your discussion posts', '🤝', 'community', 25),
  ('Early Bird', 'Complete a lesson before 8 AM', '🌅', 'special', 10),
  ('Night Owl', 'Complete a lesson after 10 PM', '🦉', 'special', 10),
  ('Consistency Champion', 'Maintain a 7-day login streak', '🔥', 'consistency', 40),
  ('Dedication Master', 'Maintain a 30-day login streak', '⭐', 'consistency', 100),
  ('Reflection Writer', 'Write 10 reflections', '✍️', 'learning', 30),
  ('Community Builder', 'Get 10 followers', '👥', 'community', 35),
  ('All-In', 'Complete all modules', '🏆', 'learning', 200)
ON CONFLICT (name) DO NOTHING;







