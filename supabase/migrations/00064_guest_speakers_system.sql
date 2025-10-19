-- Guest Speakers System
-- Allows events to have speakers from facilitators, guest speakers, or cohort members

-- Create guest_speakers table for external/guest speakers
CREATE TABLE IF NOT EXISTS guest_speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  title TEXT, -- e.g., "CEO", "Author", "Leadership Coach"
  organization TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event_speakers junction table
-- Links events to any type of speaker (facilitator, guest, or member)
CREATE TABLE IF NOT EXISTS event_speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  speaker_type TEXT NOT NULL CHECK (speaker_type IN ('facilitator', 'guest', 'member')),
  -- Only ONE of these will be populated based on speaker_type
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- For facilitators and members
  guest_speaker_id UUID REFERENCES guest_speakers(id) ON DELETE CASCADE, -- For guest speakers
  display_order INTEGER DEFAULT 0, -- For ordering multiple speakers
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, speaker_type, profile_id, guest_speaker_id)
);

-- Add check constraint to ensure proper relationships
ALTER TABLE event_speakers
  ADD CONSTRAINT check_speaker_reference
  CHECK (
    (speaker_type IN ('facilitator', 'member') AND profile_id IS NOT NULL AND guest_speaker_id IS NULL)
    OR
    (speaker_type = 'guest' AND guest_speaker_id IS NOT NULL AND profile_id IS NULL)
  );

-- Create indexes for performance
CREATE INDEX idx_event_speakers_event_id ON event_speakers(event_id);
CREATE INDEX idx_event_speakers_profile_id ON event_speakers(profile_id) WHERE profile_id IS NOT NULL;
CREATE INDEX idx_event_speakers_guest_id ON event_speakers(guest_speaker_id) WHERE guest_speaker_id IS NOT NULL;
CREATE INDEX idx_guest_speakers_name ON guest_speakers(full_name);

-- Enable Row Level Security
ALTER TABLE guest_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_speakers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guest_speakers
CREATE POLICY "Everyone can view guest speakers"
  ON guest_speakers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage guest speakers"
  ON guest_speakers FOR ALL
  TO authenticated
  USING (user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- RLS Policies for event_speakers
CREATE POLICY "Everyone can view event speakers"
  ON event_speakers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage event speakers"
  ON event_speakers FOR ALL
  TO authenticated
  USING (user_has_any_role(auth.uid(), ARRAY['admin', 'facilitator']));

-- Triggers for updated_at
CREATE TRIGGER update_guest_speakers_updated_at
  BEFORE UPDATE ON guest_speakers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE guest_speakers IS 'External/guest speakers who can be assigned to events';
COMMENT ON TABLE event_speakers IS 'Junction table linking events to speakers (facilitators, guests, or members)';
COMMENT ON COLUMN event_speakers.speaker_type IS 'Type of speaker: facilitator, guest, or member';
COMMENT ON COLUMN event_speakers.display_order IS 'Order in which speakers should be displayed (0 = first)';

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Guest speakers system created successfully';
  RAISE NOTICE 'Events can now have speakers from: facilitators, guest speakers, or cohort members';
END $$;

