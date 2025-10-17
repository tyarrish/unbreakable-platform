-- Update all RLS policies across all tables to use roles array instead of role column
-- This is a prerequisite for removing the old role column

-- Helper function to check if user has a specific role (if not already exists)
CREATE OR REPLACE FUNCTION user_has_role(user_id UUID, check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND check_role = ANY(roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to check if user has any of multiple roles
CREATE OR REPLACE FUNCTION user_has_any_role(user_id UUID, check_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND roles && check_roles
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- MODULES TABLE
DROP POLICY IF EXISTS "Admins and facilitators can manage modules" ON modules;
CREATE POLICY "Admins and facilitators can manage modules"
  ON modules FOR ALL
  USING (user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- LESSONS TABLE
DROP POLICY IF EXISTS "Everyone can view lessons of published modules" ON lessons;
CREATE POLICY "Everyone can view lessons of published modules"
  ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM modules
      WHERE modules.id = lessons.module_id
      AND modules.is_published = true
    )
    OR user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator'])
  );

DROP POLICY IF EXISTS "Admins and facilitators can manage lessons" ON lessons;
CREATE POLICY "Admins and facilitators can manage lessons"
  ON lessons FOR ALL
  USING (user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- LESSON ATTACHMENTS TABLE
DROP POLICY IF EXISTS "Admins and facilitators can manage attachments" ON lesson_attachments;
CREATE POLICY "Admins and facilitators can manage attachments"
  ON lesson_attachments FOR ALL
  USING (user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- LESSON PROGRESS TABLE
DROP POLICY IF EXISTS "Admins can view all progress" ON lesson_progress;
CREATE POLICY "Admins can view all progress"
  ON lesson_progress FOR SELECT
  USING (auth.uid() = user_id OR user_has_role(auth.uid(), 'admin'));

-- DISCUSSION POSTS TABLE
DROP POLICY IF EXISTS "Admins and facilitators can manage all posts" ON discussion_posts;
CREATE POLICY "Admins and facilitators can manage all posts"
  ON discussion_posts FOR ALL
  USING (user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- EVENTS TABLE
DROP POLICY IF EXISTS "Admins and facilitators can manage events" ON events;
CREATE POLICY "Admins and facilitators can manage events"
  ON events FOR ALL
  USING (user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- EVENT ATTENDANCE TABLE
DROP POLICY IF EXISTS "Admins can manage all attendance" ON event_attendance;
CREATE POLICY "Admins can manage all attendance"
  ON event_attendance FOR ALL
  USING (user_has_role(auth.uid(), 'admin'));

-- BOOKS TABLE
DROP POLICY IF EXISTS "Admins and facilitators can manage books" ON books;
CREATE POLICY "Admins and facilitators can manage books"
  ON books FOR ALL
  USING (user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- READING PROGRESS TABLE
DROP POLICY IF EXISTS "Facilitators can view all reading progress" ON reading_progress;
CREATE POLICY "Facilitators can view all reading progress"
  ON reading_progress FOR SELECT
  USING (auth.uid() = user_id OR user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- READING GROUPS TABLE
DROP POLICY IF EXISTS "Admins and facilitators can manage reading groups" ON reading_groups;
CREATE POLICY "Admins and facilitators can manage reading groups"
  ON reading_groups FOR ALL
  USING (user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- PARTNER QUESTIONNAIRE TABLE
DROP POLICY IF EXISTS "Admins can view all questionnaires" ON partner_questionnaire;
CREATE POLICY "Admins can view all questionnaires"
  ON partner_questionnaire FOR SELECT
  USING (auth.uid() = user_id OR user_has_role(auth.uid(), 'admin'));

-- PARTNER CHECKINS TABLE
DROP POLICY IF EXISTS "Facilitators can view all check-ins" ON partner_checkins;
CREATE POLICY "Facilitators can view all check-ins"
  ON partner_checkins FOR SELECT
  USING (
    auth.uid() = user_id 
    OR auth.uid() = partner_id 
    OR user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator'])
  );

-- CAPSTONE PROJECTS TABLE
DROP POLICY IF EXISTS "Facilitators can view all capstones" ON capstone_projects;
CREATE POLICY "Facilitators can view all capstones"
  ON capstone_projects FOR SELECT
  USING (auth.uid() = user_id OR user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

DROP POLICY IF EXISTS "Facilitators can provide feedback" ON capstone_projects;
CREATE POLICY "Facilitators can provide feedback"
  ON capstone_projects FOR UPDATE
  USING (user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- ANALYTICS EVENTS TABLE
DROP POLICY IF EXISTS "Admins can view analytics events" ON analytics_events;
CREATE POLICY "Admins can view analytics events"
  ON analytics_events FOR SELECT
  USING (user_has_role(auth.uid(), 'admin'));

-- MODULE ATTACHMENTS TABLE
DROP POLICY IF EXISTS "Admins and facilitators can manage module attachments" ON module_attachments;
CREATE POLICY "Admins and facilitators can manage module attachments"
  ON module_attachments FOR ALL
  USING (user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- BOOK COMMENTS TABLE
DROP POLICY IF EXISTS "Admins can manage all comments" ON book_comments;
CREATE POLICY "Admins can manage all comments"
  ON book_comments FOR ALL
  USING (user_has_role(auth.uid(), 'admin'));

-- ACHIEVEMENTS TABLE
DROP POLICY IF EXISTS "Only admins can manage achievements" ON achievements;
CREATE POLICY "Only admins can manage achievements"
  ON achievements FOR ALL
  USING (user_has_role(auth.uid(), 'admin'));

-- INVITES TABLE
DROP POLICY IF EXISTS "Admins can manage invites" ON invites;
CREATE POLICY "Admins can manage invites"
  ON invites FOR ALL
  USING (user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- PROFILES TABLE (admin update policy)
DROP POLICY IF EXISTS "Admins can update user profiles" ON profiles;
CREATE POLICY "Admins can update user profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR user_has_role(auth.uid(), 'admin'));

-- PLATFORM SETTINGS TABLE
DROP POLICY IF EXISTS "Admins can manage settings" ON platform_settings;
CREATE POLICY "Admins can manage settings"
  ON platform_settings FOR ALL
  USING (user_has_role(auth.uid(), 'admin'));

-- DASHBOARD CONTENT TABLE
DROP POLICY IF EXISTS "Admins can view all dashboard content" ON dashboard_content;
CREATE POLICY "Admins can view all dashboard content"
  ON dashboard_content FOR SELECT
  USING (user_has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert dashboard content" ON dashboard_content;
CREATE POLICY "Admins can insert dashboard content"
  ON dashboard_content FOR INSERT
  WITH CHECK (user_has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update dashboard content" ON dashboard_content;
CREATE POLICY "Admins can update dashboard content"
  ON dashboard_content FOR UPDATE
  USING (user_has_role(auth.uid(), 'admin'));

-- USER ACTIVITY SNAPSHOT TABLE
DROP POLICY IF EXISTS "Admins can view all activity snapshots" ON user_activity_snapshot;
CREATE POLICY "Admins can view all activity snapshots"
  ON user_activity_snapshot FOR SELECT
  USING (user_has_role(auth.uid(), 'admin'));

-- ENGAGEMENT FLAGS TABLE
DROP POLICY IF EXISTS "Admins can view all engagement flags" ON engagement_flags;
CREATE POLICY "Admins can view all engagement flags"
  ON engagement_flags FOR SELECT
  USING (user_has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert engagement flags" ON engagement_flags;
CREATE POLICY "Admins can insert engagement flags"
  ON engagement_flags FOR INSERT
  WITH CHECK (user_has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update engagement flags" ON engagement_flags;
CREATE POLICY "Admins can update engagement flags"
  ON engagement_flags FOR UPDATE
  USING (user_has_role(auth.uid(), 'admin'));

-- PROGRAM SETTINGS TABLE
DROP POLICY IF EXISTS "Admins can update program settings" ON program_settings;
CREATE POLICY "Admins can update program settings"
  ON program_settings FOR UPDATE
  USING (user_has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert program settings" ON program_settings;
CREATE POLICY "Admins can insert program settings"
  ON program_settings FOR INSERT
  WITH CHECK (user_has_role(auth.uid(), 'admin'));

-- BOOK SUBMISSIONS TABLE
DROP POLICY IF EXISTS "Admins can view all submissions" ON book_submissions;
CREATE POLICY "Admins can view all submissions"
  ON book_submissions FOR SELECT
  USING (auth.uid() = submitted_by OR user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

DROP POLICY IF EXISTS "Admins can update submissions" ON book_submissions;
CREATE POLICY "Admins can update submissions"
  ON book_submissions FOR UPDATE
  USING (user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- Add comments
COMMENT ON FUNCTION user_has_role IS 'Check if a user has a specific role in their roles array';
COMMENT ON FUNCTION user_has_any_role IS 'Check if a user has any of the specified roles';

