-- Fix RLS policy to allow users to accept their own invites
-- Currently only admins can update invites, but users need to mark invites as accepted

-- Add policy for users to update their own invite when accepting
CREATE POLICY "Users can accept invites sent to their email"
  ON invites FOR UPDATE
  TO authenticated
  USING (
    -- User's email matches the invite email
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = invites.email
    )
  )
  WITH CHECK (
    -- Only allow updating to accepted status
    status = 'accepted' AND accepted_at IS NOT NULL
  );

-- Log the fix
DO $$
BEGIN
  RAISE NOTICE 'Added RLS policy allowing users to accept invites sent to their email';
END $$;

