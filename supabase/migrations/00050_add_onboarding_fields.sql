-- Add dietary and professional information to profiles
-- These fields enhance onboarding and support in-person event planning

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS employer TEXT,
  ADD COLUMN IF NOT EXISTS current_role TEXT,
  ADD COLUMN IF NOT EXISTS food_preferences TEXT,
  ADD COLUMN IF NOT EXISTS allergies TEXT;

-- Add helpful comments
COMMENT ON COLUMN profiles.employer IS 'User current employer/organization - displayed on profile';
COMMENT ON COLUMN profiles.current_role IS 'User job title/position - displayed on profile';
COMMENT ON COLUMN profiles.food_preferences IS 'Dietary preferences (vegetarian, vegan, etc.) - PRIVATE for event planning';
COMMENT ON COLUMN profiles.allergies IS 'Food allergies and intolerances - PRIVATE for event planning';

