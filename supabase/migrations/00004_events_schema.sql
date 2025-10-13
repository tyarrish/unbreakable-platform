-- Rogue Leadership Training Experience - Events Schema
-- Phase 7: Events & Calendar Management

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('cohort_call', 'workshop', 'book_club', 'office_hours')) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  zoom_link TEXT,
  zoom_meeting_id TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  max_attendees INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event attendance table
CREATE TABLE IF NOT EXISTS event_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('registered', 'attended', 'missed')) DEFAULT 'registered',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Event reminders table
CREATE TABLE IF NOT EXISTS event_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reminder_time TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Everyone can view events"
  ON events FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins and facilitators can manage events"
  ON events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- RLS Policies for event_attendance
CREATE POLICY "Everyone can view attendance"
  ON event_attendance FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can manage own attendance"
  ON event_attendance FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all attendance"
  ON event_attendance FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for event_reminders
CREATE POLICY "Users can view own reminders"
  ON event_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage reminders"
  ON event_reminders FOR ALL
  USING (TRUE);

-- Triggers for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_attendance_updated_at
  BEFORE UPDATE ON event_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS events_start_time_idx ON events(start_time);
CREATE INDEX IF NOT EXISTS events_event_type_idx ON events(event_type);
CREATE INDEX IF NOT EXISTS events_created_by_idx ON events(created_by);
CREATE INDEX IF NOT EXISTS event_attendance_event_idx ON event_attendance(event_id);
CREATE INDEX IF NOT EXISTS event_attendance_user_idx ON event_attendance(user_id);
CREATE INDEX IF NOT EXISTS event_reminders_event_idx ON event_reminders(event_id);
CREATE INDEX IF NOT EXISTS event_reminders_sent_idx ON event_reminders(sent, reminder_time);

