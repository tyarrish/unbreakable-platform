-- Remove country field from profiles table
-- Program is USA-only, so country field is not needed

-- Drop the column
ALTER TABLE profiles DROP COLUMN IF EXISTS country;

-- Log the change
DO $$
BEGIN
  RAISE NOTICE 'Country field has been removed from profiles table (USA-only program)';
END $$;

