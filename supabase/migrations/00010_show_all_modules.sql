-- Allow participants to see all modules (including future/locked ones)
-- This creates anticipation and shows the full journey

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Everyone can view published modules" ON modules;

-- Create new policy that shows all modules to authenticated users
CREATE POLICY "Authenticated users can view all modules"
  ON modules FOR SELECT
  TO authenticated
  USING (TRUE);

-- Note: Lessons are still protected by their own policies
-- Locked modules will show in UI but lessons won't be accessible until release date

