-- Add invite_token column for custom invite flow
-- This replaces reliance on Supabase's inviteUserByEmail

ALTER TABLE invites 
  ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE;

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(invite_token);

