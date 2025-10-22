-- Add course introduction setting for modules page header
INSERT INTO platform_settings (setting_key, setting_value, description, category) 
VALUES
  ('course_introduction_html', '""'::jsonb, 'Rich HTML content for the modules page introduction (replaces "The Work" header)', 'content')
ON CONFLICT (setting_key) DO NOTHING;

