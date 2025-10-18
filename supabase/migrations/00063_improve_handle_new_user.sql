-- Improve handle_new_user function to properly handle invited users
-- Extract role from metadata and set profile_completed correctly

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get role from metadata, default to 'participant'
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'participant');
  
  -- Validate role
  IF user_role NOT IN ('admin', 'facilitator', 'participant') THEN
    user_role := 'participant';
  END IF;
  
  -- Insert profile with proper role array
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    roles,
    profile_completed
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    ARRAY[user_role]::TEXT[],
    false  -- New users need to complete onboarding
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate errors
  
  RAISE NOTICE 'Created profile for user % with role %', new.email, user_role;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error creating profile for %: %', new.email, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists and is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Log the update
DO $$
BEGIN
  RAISE NOTICE 'Updated handle_new_user function with better error handling and role support';
END $$;

