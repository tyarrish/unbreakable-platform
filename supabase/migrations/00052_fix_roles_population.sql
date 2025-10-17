-- Fix for existing users who might not have roles populated correctly
-- This ensures all users have the roles array properly set

-- Update any profiles where roles is NULL or empty
UPDATE profiles
SET roles = CASE 
  WHEN role IS NOT NULL THEN ARRAY[role]::TEXT[]
  ELSE ARRAY['participant']::TEXT[]
END
WHERE roles IS NULL OR array_length(roles, 1) IS NULL;

-- Ensure all users have at least one role
UPDATE profiles
SET roles = ARRAY['participant']::TEXT[]
WHERE array_length(roles, 1) IS NULL OR array_length(roles, 1) = 0;

-- Log the update
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count FROM profiles;
  RAISE NOTICE 'Total profiles: %', updated_count;
  
  SELECT COUNT(*) INTO updated_count 
  FROM profiles 
  WHERE roles IS NOT NULL AND array_length(roles, 1) > 0;
  RAISE NOTICE 'Profiles with valid roles: %', updated_count;
END $$;

