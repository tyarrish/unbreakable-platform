-- Update Event Types to Better Match Leadership Training Program
-- Replaces generic event types with curated leadership-focused options

-- Step 1: Drop the existing constraint first
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_event_type_check;

-- Step 2: Update existing events to use new types (map old to new)
UPDATE events SET event_type = 'main_session' WHERE event_type = 'cohort_call';
-- workshop, book_club, and office_hours remain the same

-- Step 3: Add new constraint with curated event types
ALTER TABLE events ADD CONSTRAINT events_event_type_check 
  CHECK (event_type IN (
    'main_session',
    'workshop',
    'guest_speaker',
    'book_club',
    'panel_discussion',
    'office_hours',
    'fireside_chat',
    'networking_event',
    'celebration'
  ));

-- Add comment for clarity
COMMENT ON COLUMN events.event_type IS 'Type of event: main_session (primary cohort sessions), workshop (hands-on training), guest_speaker (external expert), book_club (monthly book discussions), panel_discussion (multi-perspective topics), office_hours (facilitator support), fireside_chat (informal Q&A), networking_event (community building), celebration (milestones)';

