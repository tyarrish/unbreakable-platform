-- Remove Twitter/X URL field from profiles table
-- This field is no longer needed

-- Drop the column
ALTER TABLE profiles DROP COLUMN IF EXISTS twitter_url;

-- Log the change
DO $$
BEGIN
  RAISE NOTICE 'Twitter URL field has been removed from profiles table';
END $$;

