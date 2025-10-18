-- Automatically mark invites as accepted when a user creates an account
-- This handles cases where invite acceptance fails or user signs up via Supabase invite email

-- Create function to auto-accept matching invite
CREATE OR REPLACE FUNCTION auto_accept_invite_on_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new profile is created, check if there's a pending invite for this email
  UPDATE invites
  SET 
    status = 'accepted',
    accepted_at = NOW()
  WHERE 
    email = NEW.email
    AND status = 'pending'
    AND id IS NOT NULL;
  
  -- Log if an invite was updated
  IF FOUND THEN
    RAISE NOTICE 'Auto-accepted pending invite for email: %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profile insert
DROP TRIGGER IF EXISTS trigger_auto_accept_invite ON profiles;
CREATE TRIGGER trigger_auto_accept_invite
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_accept_invite_on_user_creation();

-- Also create a cleanup function to manually fix any existing issues
CREATE OR REPLACE FUNCTION cleanup_accepted_invites()
RETURNS TABLE(updated_count INTEGER) AS $$
DECLARE
  count INTEGER;
BEGIN
  -- Mark all invites as accepted where the user account exists
  UPDATE invites
  SET 
    status = 'accepted',
    accepted_at = COALESCE(accepted_at, NOW())
  FROM profiles
  WHERE 
    invites.email = profiles.email
    AND invites.status = 'pending';
  
  GET DIAGNOSTICS count = ROW_COUNT;
  RETURN QUERY SELECT count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run cleanup for existing users
SELECT cleanup_accepted_invites() as invites_auto_accepted;

-- Add helpful comments
COMMENT ON FUNCTION auto_accept_invite_on_user_creation IS 'Automatically marks pending invites as accepted when a user account is created';
COMMENT ON FUNCTION cleanup_accepted_invites IS 'Manual cleanup function to mark invites as accepted for existing users';

