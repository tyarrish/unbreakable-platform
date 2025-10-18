-- Script to restore Ashley Crews' profile
-- ONLY run this after checking if auth.users account exists
-- Replace the UUID with Ashley's actual auth.users ID

-- Step 1: Check if auth account exists (run check-user-auth.sql first)
-- Step 2: If auth exists but profile is missing, recreate the profile

-- REPLACE 'ashley-user-id-here' with the actual UUID from auth.users
-- REPLACE 'ashley@email.com' with her actual email

INSERT INTO profiles (
  id,
  email,
  full_name,
  roles,
  avatar_url,
  bio,
  employer,
  current_role,
  is_active,
  profile_completed,
  created_at,
  updated_at
)
VALUES (
  'ashley-user-id-here'::UUID, -- Replace with her auth.users ID
  'ashley@email.com', -- Replace with her actual email
  'Ashley Crews',
  ARRAY['facilitator']::TEXT[],
  'her-avatar-url-if-known', -- Replace or set to NULL
  'I am Co-Owner of Weekend Beer Company, in Grants Pass, heading up Taproom Operations, Marketing & Events at Weekend. I also serve as Board President for Visit Grants Pass and sit on the Board of Directors for the Grants Pass and Josephine County Chamber of Commerce.',
  'Weekend Beer Company',
  'Co-Owner',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  roles = EXCLUDED.roles,
  bio = EXCLUDED.bio,
  employer = EXCLUDED.employer,
  current_role = EXCLUDED.current_role,
  is_active = true,
  updated_at = NOW();

