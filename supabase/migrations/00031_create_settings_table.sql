-- Create platform settings table for admin configuration

CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  category TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings"
  ON platform_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed initial settings
INSERT INTO platform_settings (setting_key, setting_value, description, category) VALUES
  ('cohort_start_date', '"2025-10-23"'::jsonb, 'Start date of the current cohort (used for week calculations)', 'cohort'),
  ('cohort_name', '"Cohort 2025"'::jsonb, 'Current cohort name/identifier', 'cohort'),
  ('platform_name', '"Rogue Leadership Training Experience"'::jsonb, 'Platform display name', 'general'),
  ('site_url', '"https://unbreakable-platform.vercel.app"'::jsonb, 'Production site URL', 'general'),
  ('check_in_deadline_day', '"friday"'::jsonb, 'Day of week when check-in reminders are sent', 'partners'),
  ('notifications_enabled', 'true'::jsonb, 'Enable email notifications', 'notifications'),
  ('discussions_enabled', 'true'::jsonb, 'Enable discussions feature', 'features'),
  ('partner_system_enabled', 'true'::jsonb, 'Enable partner accountability system', 'features'),
  ('max_file_upload_mb', '10'::jsonb, 'Maximum file upload size in MB', 'general');

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON platform_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON platform_settings(category);

