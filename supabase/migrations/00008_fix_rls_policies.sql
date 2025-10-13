-- Fix infinite recursion in RLS policies
-- The issue: policies were checking profiles table to determine access, causing recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins and facilitators can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;

-- Recreate policies without recursion
-- Allow users to view all profiles (simpler, no recursion)
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (TRUE);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

