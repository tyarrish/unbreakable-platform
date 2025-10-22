-- Add description_html field to modules table
-- This allows storing rich HTML content for module descriptions

ALTER TABLE modules
ADD COLUMN IF NOT EXISTS description_html TEXT;

-- Add comment for clarity
COMMENT ON COLUMN modules.description_html IS 'Rich HTML content for module description, displayed on participant view';

