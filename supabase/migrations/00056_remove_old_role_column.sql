-- Now that all policies have been updated to use roles array,
-- we can safely remove the old role column

-- Final safety check: ensure all data is in roles array
UPDATE profiles
SET roles = CASE 
  WHEN roles IS NULL OR array_length(roles, 1) IS NULL THEN ARRAY[COALESCE(role, 'participant')]::TEXT[]
  WHEN role IS NOT NULL AND NOT (role = ANY(roles)) THEN roles || ARRAY[role]::TEXT[]
  ELSE roles
END
WHERE role IS NOT NULL OR roles IS NULL OR array_length(roles, 1) IS NULL;

-- Drop the old role column
ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- Add a helper function to get primary role (for display purposes)
-- Returns the highest priority role: admin > facilitator > participant
CREATE OR REPLACE FUNCTION get_primary_role(user_roles TEXT[])
RETURNS TEXT AS $$
BEGIN
  IF 'admin' = ANY(user_roles) THEN
    RETURN 'admin';
  ELSIF 'facilitator' = ANY(user_roles) THEN
    RETURN 'facilitator';
  ELSE
    RETURN 'participant';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add helpful comments
COMMENT ON COLUMN profiles.roles IS 'Array of user roles. Users can have multiple roles (admin, facilitator, participant). The old single role column has been removed.';
COMMENT ON FUNCTION get_primary_role IS 'Helper function to determine primary role from roles array. Priority: admin > facilitator > participant.';

-- Log the cleanup
DO $$
DECLARE
  total_profiles INTEGER;
  profiles_with_roles INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_profiles FROM profiles;
  SELECT COUNT(*) INTO profiles_with_roles 
  FROM profiles 
  WHERE roles IS NOT NULL AND array_length(roles, 1) > 0;
  
  RAISE NOTICE 'Database cleanup complete!';
  RAISE NOTICE 'Total profiles: %', total_profiles;
  RAISE NOTICE 'Profiles with valid roles: %', profiles_with_roles;
  RAISE NOTICE 'Old role column has been removed.';
END $$;

