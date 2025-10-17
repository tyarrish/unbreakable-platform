-- Add category field to books for organizing non-featured books
ALTER TABLE books ADD COLUMN IF NOT EXISTS category TEXT;

-- Add submitted_by field to track who added the book
ALTER TABLE books ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id);

-- Add index for category queries
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);

COMMENT ON COLUMN books.category IS 'Leadership category: Stoicism, Team Leadership, Decision Making, Communication, Personal Development, Biography, Strategy';
COMMENT ON COLUMN books.submitted_by IS 'User who submitted this book to the library';

