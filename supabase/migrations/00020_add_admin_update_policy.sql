-- Add missing policy for admins to update user profiles
-- This allows admin user management functionality to work

CREATE POLICY "Admins can update user profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
    )
  );

