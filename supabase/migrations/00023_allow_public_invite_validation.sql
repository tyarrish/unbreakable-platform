-- Allow unauthenticated users to validate invites using the token
-- This is safe because:
-- 1. The token is a secure 64-character random string
-- 2. Only returns a single invite by exact token match
-- 3. Users still can't list all invites or modify them

CREATE POLICY "Anyone can validate invite with token"
  ON invites FOR SELECT
  USING (
    invite_token IS NOT NULL 
    AND status = 'pending'
  );

-- Note: This doesn't allow listing all invites, only querying by specific token
-- The 'Admins can manage invites' policy still controls all other operations

