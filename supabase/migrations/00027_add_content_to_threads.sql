-- Add content column to discussion_threads for backwards compatibility
-- This stores the plain text version while content_html stores rich formatted version

ALTER TABLE discussion_threads
  ADD COLUMN IF NOT EXISTS content TEXT;

-- Update existing threads to have content if they have content_html
UPDATE discussion_threads
SET content = COALESCE(content_html, title)
WHERE content IS NULL;

