-- Add support for multiple roles per user
-- This allows users to have multiple roles like admin + facilitator

-- Add new roles array column
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['participant']::TEXT[];

-- Migrate existing role data to roles array
UPDATE profiles
SET roles = ARRAY[role]::TEXT[]
WHERE role IS NOT NULL;

-- Add check constraint for valid roles in array
ALTER TABLE profiles
  ADD CONSTRAINT check_valid_roles
  CHECK (
    roles <@ ARRAY['admin', 'facilitator', 'participant']::TEXT[]
    AND array_length(roles, 1) > 0
  );

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON profiles USING GIN(roles);

-- Update RLS policies to work with roles array
DROP POLICY IF EXISTS "Admins and facilitators can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;

-- New RLS policies using roles array
CREATE POLICY "Admins and facilitators can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.roles && ARRAY['admin', 'facilitator']::TEXT[])
    )
  );

CREATE POLICY "Only admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND 'admin' = ANY(profiles.roles)
    )
  );

CREATE POLICY "Only admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND 'admin' = ANY(profiles.roles)
    )
  );

-- Update the handle_new_user function to use roles array
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, roles)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    ARRAY['participant']::TEXT[]
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.user_has_role(user_id UUID, check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND check_role = ANY(roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.user_has_any_role(user_id UUID, check_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND roles && check_roles
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the migration
COMMENT ON COLUMN profiles.roles IS 'Array of user roles - allows users to have multiple roles (e.g., admin + facilitator)';
COMMENT ON COLUMN profiles.role IS 'DEPRECATED: Use roles array instead. Kept for backward compatibility.';

