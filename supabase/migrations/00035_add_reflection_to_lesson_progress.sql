-- Add reflection column to lesson_progress table
-- This consolidates reflections from the separate reflections table into lesson_progress

-- Add reflection column
ALTER TABLE lesson_progress
ADD COLUMN IF NOT EXISTS reflection TEXT;

-- Migrate existing reflections from reflections table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reflections') THEN
    -- Copy reflections to lesson_progress
    UPDATE lesson_progress lp
    SET reflection = r.content
    FROM reflections r
    WHERE lp.user_id = r.user_id 
      AND lp.lesson_id = r.lesson_id 
      AND r.content IS NOT NULL;
    
    -- Drop the old reflections table
    DROP TABLE IF EXISTS reflections CASCADE;
  END IF;
END $$;

