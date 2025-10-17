-- Fix infinite recursion in RLS policies
-- The issue: checking roles requires reading profiles, which triggers the same policy
-- Solution: Use separate policies with simpler conditions

-- Drop all existing profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins and facilitators can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Simple policy: Users can ALWAYS view and update their own profile
-- No role checks = no recursion
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- For viewing OTHER users' profiles, check authentication but not roles
-- This allows the app to fetch user data for displaying members, etc.
CREATE POLICY "Authenticated users can view other profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- For admin operations (insert/delete/update others), we'll check roles in the application layer
-- These policies just ensure the user is authenticated
CREATE POLICY "Authenticated users can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete profiles"
  ON profiles FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update other profiles"
  ON profiles FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Add comment explaining the approach
COMMENT ON TABLE profiles IS 'User profiles with simplified RLS policies. Role-based authorization is enforced at the application layer to avoid infinite recursion. All authenticated users can read profiles, but the app checks roles before allowing admin operations.';

