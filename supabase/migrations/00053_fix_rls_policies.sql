-- Fix RLS policies to prevent login loop
-- The issue is that users need to read their own profile to authenticate
-- but the policies check roles which creates a circular dependency

-- Drop all existing profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins and facilitators can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create new policies with correct logic

-- 1. Users can ALWAYS view their own profile (no role check needed)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 2. Users can update their own profile (no role check needed)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Admins and facilitators can view ALL profiles (including role check)
CREATE POLICY "Admins and facilitators can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        'admin' = ANY(profiles.roles) OR 
        'facilitator' = ANY(profiles.roles)
      )
    )
  );

-- 4. Only admins can update other users' profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND 'admin' = ANY(profiles.roles)
    )
  );

-- 5. Only admins can insert profiles
CREATE POLICY "Only admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND 'admin' = ANY(profiles.roles)
    )
  );

-- 6. Only admins can delete profiles
CREATE POLICY "Only admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND 'admin' = ANY(profiles.roles)
    )
  );

-- Add comment
COMMENT ON TABLE profiles IS 'User profiles with RLS. Users can always view/update their own profile. Admins and facilitators can view all profiles.';

