-- Add presenter_bio column to events table
-- Stores rich HTML content about event presenters

ALTER TABLE events ADD COLUMN IF NOT EXISTS presenter_bio TEXT;

COMMENT ON COLUMN events.presenter_bio IS 'Rich HTML content about the event presenter/facilitator';

