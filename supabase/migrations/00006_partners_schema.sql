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

