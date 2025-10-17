-- Book Submissions Table
-- Allow participants to suggest books for the library

CREATE TABLE IF NOT EXISTS book_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  amazon_link TEXT,
  description TEXT,
  reason_for_recommendation TEXT,
  category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE book_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON book_submissions FOR SELECT
  TO authenticated
  USING (submitted_by = auth.uid());

-- Users can create submissions
CREATE POLICY "Users can create submissions"
  ON book_submissions FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = auth.uid());

-- Users can update their own pending submissions
CREATE POLICY "Users can update own pending submissions"
  ON book_submissions FOR UPDATE
  TO authenticated
  USING (submitted_by = auth.uid() AND status = 'pending')
  WITH CHECK (submitted_by = auth.uid() AND status = 'pending');

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON book_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'facilitator')
    )
  );

-- Admins can update submissions (approve/reject)
CREATE POLICY "Admins can update submissions"
  ON book_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'facilitator')
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_book_submissions_submitted_by ON book_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_book_submissions_status ON book_submissions(status);
CREATE INDEX IF NOT EXISTS idx_book_submissions_created_at ON book_submissions(created_at DESC);

-- Add comments
COMMENT ON TABLE book_submissions IS 'User-submitted book recommendations for review by admins';
COMMENT ON COLUMN book_submissions.reason_for_recommendation IS 'Why the user recommends this book for the leadership library';
COMMENT ON COLUMN book_submissions.status IS 'pending: awaiting review, approved: added to library, rejected: not suitable';

