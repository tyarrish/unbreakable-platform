-- Enhance partner_checkins table for structured weekly check-ins

ALTER TABLE partner_checkins
  ADD COLUMN IF NOT EXISTS commitment TEXT,
  ADD COLUMN IF NOT EXISTS commitment_status TEXT CHECK (commitment_status IN ('pending', 'completed', 'partial', 'missed')) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reflection TEXT,
  ADD COLUMN IF NOT EXISTS wins TEXT,
  ADD COLUMN IF NOT EXISTS challenges TEXT,
  ADD COLUMN IF NOT EXISTS support_needed TEXT,
  ADD COLUMN IF NOT EXISTS partner_viewed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS partner_comment TEXT,
  ADD COLUMN IF NOT EXISTS partner_commented_at TIMESTAMPTZ;

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_checkins_user_week ON partner_checkins(user_id, week_number DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_partner_week ON partner_checkins(partner_id, week_number DESC);

-- Enable real-time for instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE partner_checkins;

