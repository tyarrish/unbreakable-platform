-- Check for duplicate or missing profiles

-- 1. Check for users without profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  'Missing Profile' as issue
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 2. Check for duplicate profiles (shouldn't be possible with PK, but check anyway)
SELECT 
  id,
  email,
  COUNT(*) as count
FROM profiles
GROUP BY id, email
HAVING COUNT(*) > 1;

-- 3. Check all existing profiles
SELECT 
  id,
  email,
  full_name,
  roles,
  is_active,
  profile_completed,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 4. Count profiles vs auth users
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM profiles) as profiles_count;

