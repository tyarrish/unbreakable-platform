-- Check if Ashley's auth account still exists
-- Run this in Supabase SQL Editor

-- Check auth.users table for her account
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  confirmed_at
FROM auth.users
WHERE email ILIKE '%ashley%' OR email ILIKE '%crews%';

-- Check if there's a profile (likely deleted)
SELECT 
  id,
  email,
  full_name,
  roles,
  created_at
FROM profiles
WHERE email ILIKE '%ashley%' OR email ILIKE '%crews%';

-- Check invites history
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  created_at,
  accepted_at
FROM invites
WHERE email ILIKE '%ashley%' OR email ILIKE '%crews%'
ORDER BY created_at DESC;

