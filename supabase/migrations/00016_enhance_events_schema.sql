-- Enhance Events Schema
-- Add required/optional, location type, physical location, and module association

-- Add new columns to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS location_type TEXT CHECK (location_type IN ('in_person', 'virtual', 'hybrid')) DEFAULT 'virtual',
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id) ON DELETE SET NULL;

-- Update existing rows to have default values
UPDATE events SET location_type = 'virtual' WHERE location_type IS NULL;

-- Add indexes for filtering and joins
CREATE INDEX IF NOT EXISTS events_location_type_idx ON events(location_type);
CREATE INDEX IF NOT EXISTS events_module_id_idx ON events(module_id);

-- Add comments for clarity
COMMENT ON COLUMN events.is_required IS 'Whether attendance at this event is required or optional';
COMMENT ON COLUMN events.location_type IS 'Format of the event: in_person, virtual, or hybrid';
COMMENT ON COLUMN events.location_address IS 'Physical address for in-person or hybrid events';
COMMENT ON COLUMN events.module_id IS 'Optional association with a specific module';

