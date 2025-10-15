-- Add fields to profiles for enhanced partner matching

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('emerging', 'mid-level', 'senior', 'executive')),
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS team_size TEXT CHECK (team_size IN ('individual', '2-10', '11-50', '51-200', '200+')),
  ADD COLUMN IF NOT EXISTS time_zone TEXT,
  ADD COLUMN IF NOT EXISTS availability_preferences JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS communication_style TEXT CHECK (communication_style IN ('direct', 'supportive', 'collaborative', 'reflective')),
  ADD COLUMN IF NOT EXISTS matching_preferences JSONB DEFAULT '{}'::jsonb;

-- Add questionnaire completion tracking
ALTER TABLE partner_questionnaire
  ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Update existing questionnaire table to store structured responses
COMMENT ON COLUMN partner_questionnaire.responses IS 'JSONB structure: {experience_level, industry, team_size, goals, communication_style, availability, preferences}';

