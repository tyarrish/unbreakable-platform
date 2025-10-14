-- Set default values for new columns on existing user profiles
-- This ensures users created before the migration have proper values

UPDATE profiles
SET 
  is_active = COALESCE(is_active, true),
  profile_completed = COALESCE(profile_completed, false)
WHERE 
  is_active IS NULL 
  OR profile_completed IS NULL;

