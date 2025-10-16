-- AI Dashboard System Tables
-- Creates infrastructure for AI-generated dashboard content, engagement tracking, and flags

-- Table: dashboard_content
-- Stores AI-generated content for the dashboard (hero messages, activity feeds, practice actions)
CREATE TABLE IF NOT EXISTS dashboard_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('hero_message', 'cohort_activity', 'practice_actions', 'full_dashboard')),
  content JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT FALSE,
  ai_model TEXT DEFAULT 'claude-sonnet-4-20250514',
  generation_context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: user_activity_snapshot
-- Daily snapshots of user engagement metrics for AI analysis
CREATE TABLE IF NOT EXISTS user_activity_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  logins_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  responses_count INTEGER DEFAULT 0,
  modules_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  last_post TIMESTAMP WITH TIME ZONE,
  last_partner_interaction TIMESTAMP WITH TIME ZONE,
  engagement_score NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- Table: engagement_flags
-- Red/yellow/green flags for users needing attention
CREATE TABLE IF NOT EXISTS engagement_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('red', 'yellow', 'green')),
  flag_reason TEXT NOT NULL,
  context JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: program_settings
-- Global program state (current week, module, etc.)
CREATE TABLE IF NOT EXISTS program_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default program settings
INSERT INTO program_settings (setting_key, setting_value) 
VALUES 
  ('current_week', '{"week": 1, "description": "Week 1 - Program Launch"}'::jsonb),
  ('current_module', '{"module_id": null, "title": "Month 1: Personal Leadership Foundations", "order_number": 1}'::jsonb),
  ('program_start_date', '{"date": "2025-10-16"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Indexes for performance
CREATE INDEX idx_dashboard_content_active ON dashboard_content(active) WHERE active = TRUE;
CREATE INDEX idx_dashboard_content_approved ON dashboard_content(approved, generated_at DESC);
CREATE INDEX idx_dashboard_content_type ON dashboard_content(content_type);

CREATE INDEX idx_user_activity_snapshot_user_date ON user_activity_snapshot(user_id, snapshot_date DESC);
CREATE INDEX idx_user_activity_snapshot_date ON user_activity_snapshot(snapshot_date DESC);

CREATE INDEX idx_engagement_flags_user ON engagement_flags(user_id);
CREATE INDEX idx_engagement_flags_type_resolved ON engagement_flags(flag_type, resolved);
CREATE INDEX idx_engagement_flags_created ON engagement_flags(created_at DESC);

CREATE INDEX idx_program_settings_key ON program_settings(setting_key);

-- RLS Policies

-- dashboard_content: Only admins can write, all authenticated users can read active content
ALTER TABLE dashboard_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active dashboard content"
  ON dashboard_content FOR SELECT
  TO authenticated
  USING (active = TRUE AND approved = TRUE);

CREATE POLICY "Admins can view all dashboard content"
  ON dashboard_content FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert dashboard content"
  ON dashboard_content FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update dashboard content"
  ON dashboard_content FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- user_activity_snapshot: Users can view their own, admins can view all
ALTER TABLE user_activity_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity snapshots"
  ON user_activity_snapshot FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity snapshots"
  ON user_activity_snapshot FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert activity snapshots"
  ON user_activity_snapshot FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "System can update activity snapshots"
  ON user_activity_snapshot FOR UPDATE
  TO authenticated
  USING (TRUE);

-- engagement_flags: Only admins can view and manage
ALTER TABLE engagement_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all engagement flags"
  ON engagement_flags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert engagement flags"
  ON engagement_flags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update engagement flags"
  ON engagement_flags FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- program_settings: All can read, only admins can write
ALTER TABLE program_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view program settings"
  ON program_settings FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Admins can update program settings"
  ON program_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert program settings"
  ON program_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dashboard_content_updated_at
  BEFORE UPDATE ON dashboard_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_settings_updated_at
  BEFORE UPDATE ON program_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

