-- Remove location and timezone fields from profiles table
-- Program is Grants Pass-based only, so these fields are not needed

-- Drop the columns
ALTER TABLE profiles DROP COLUMN IF EXISTS city;
ALTER TABLE profiles DROP COLUMN IF EXISTS state;
ALTER TABLE profiles DROP COLUMN IF EXISTS time_zone;

-- Log the change
DO $$
BEGIN
  RAISE NOTICE 'City, state, and timezone fields removed from profiles table (Grants Pass-based program)';
END $$;

