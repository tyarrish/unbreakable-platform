-- Fix circular dependency in RLS policies
-- The policies added in 00018 create a circular dependency where
-- checking if a user can view profiles requires querying profiles

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- The existing policies from previous migrations are sufficient:
-- - "Users can view own profile" (from 00001)
-- - "Authenticated users can view all profiles" (from 00008)
-- - "Users can update own profile" (from 00001)
-- - "Admins and facilitators can view all profiles" (from 00001)

-- Note: The existing policies work because they were created before
-- and don't have the circular dependency issue

