-- Seed Test Data for AI Dashboard System
-- Creates realistic test users, discussions, and activity patterns for testing AI generation

-- Note: This is for development/testing only. Run this after the main migration.
-- To reset: DELETE FROM profiles WHERE email LIKE '%test.cohort%';

-- Test Users (20-24 users with varied patterns)
-- Passwords are: testpass123 for all test users

DO $$
DECLARE
  user_ids UUID[];
  discussion_ids UUID[];
  module_id UUID;
BEGIN
  -- Get the first module ID if it exists
  SELECT id INTO module_id FROM modules ORDER BY order_number LIMIT 1;

  -- Create test user profiles (assumes auth.users exist or will be created separately)
  -- Active Contributors
  INSERT INTO profiles (id, email, full_name, role, bio, is_active, created_at) VALUES
  (gen_random_uuid(), 'sarah.mitchell@test.cohort', 'Sarah Mitchell', 'member', 'HR Director learning to lead with vulnerability', true, NOW() - INTERVAL '30 days'),
  (gen_random_uuid(), 'marcus.thompson@test.cohort', 'Marcus Thompson', 'member', 'Startup founder navigating growth challenges', true, NOW() - INTERVAL '28 days'),
  (gen_random_uuid(), 'jessica.park@test.cohort', 'Jessica Park', 'member', 'Non-profit director working on delegation', true, NOW() - INTERVAL '25 days'),
  (gen_random_uuid(), 'david.chen@test.cohort', 'David Chen', 'member', 'Engineering manager learning to give feedback', true, NOW() - INTERVAL '27 days'),
  (gen_random_uuid(), 'amanda.rodriguez@test.cohort', 'Amanda Rodriguez', 'member', 'Marketing VP facing difficult conversations', true, NOW() - INTERVAL '26 days'),
  
  -- Moderately Active
  (gen_random_uuid(), 'brian.wilson@test.cohort', 'Brian Wilson', 'member', 'Operations director working on trust', true, NOW() - INTERVAL '24 days'),
  (gen_random_uuid(), 'lisa.anderson@test.cohort', 'Lisa Anderson', 'member', 'Sales leader learning boundaries', true, NOW() - INTERVAL '23 days'),
  (gen_random_uuid(), 'kevin.lee@test.cohort', 'Kevin Lee', 'member', 'Product manager navigating conflict', true, NOW() - INTERVAL '22 days'),
  (gen_random_uuid(), 'rachel.taylor@test.cohort', 'Rachel Taylor', 'member', 'Finance director building confidence', true, NOW() - INTERVAL '21 days'),
  (gen_random_uuid(), 'michael.brown@test.cohort', 'Michael Brown', 'member', 'Tech lead learning to delegate', true, NOW() - INTERVAL '20 days'),
  
  -- Lurkers (high logins, low posts)
  (gen_random_uuid(), 'jennifer.white@test.cohort', 'Jennifer White', 'member', 'Executive coach observing patterns', true, NOW() - INTERVAL '19 days'),
  (gen_random_uuid(), 'thomas.martin@test.cohort', 'Thomas Martin', 'member', 'Consultant learning leadership', true, NOW() - INTERVAL '18 days'),
  (gen_random_uuid(), 'emily.garcia@test.cohort', 'Emily Garcia', 'member', 'Program manager working on presence', true, NOW() - INTERVAL '17 days'),
  
  -- Recently Inactive
  (gen_random_uuid(), 'daniel.moore@test.cohort', 'Daniel Moore', 'member', 'Business owner facing challenges', true, NOW() - INTERVAL '16 days'),
  (gen_random_uuid(), 'nicole.jackson@test.cohort', 'Nicole Jackson', 'member', 'Director learning authenticity', true, NOW() - INTERVAL '15 days'),
  
  -- Breakthrough Users (was quiet, now active)
  (gen_random_uuid(), 'chris.davis@test.cohort', 'Chris Davis', 'member', 'Team lead finding their voice', true, NOW() - INTERVAL '14 days'),
  (gen_random_uuid(), 'stephanie.miller@test.cohort', 'Stephanie Miller', 'member', 'Manager overcoming impostor syndrome', true, NOW() - INTERVAL '13 days'),
  
  -- New Members
  (gen_random_uuid(), 'jason.hernandez@test.cohort', 'Jason Hernandez', 'member', 'New leader exploring stoicism', true, NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), 'laura.wilson@test.cohort', 'Laura Wilson', 'member', 'Founder learning to lead', true, NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'robert.anderson@test.cohort', 'Robert Anderson', 'member', 'VP working on difficult decisions', true, NOW() - INTERVAL '3 days')
  ON CONFLICT (email) DO NOTHING;

  -- Store user IDs for later use
  SELECT ARRAY_AGG(id) INTO user_ids FROM profiles WHERE email LIKE '%test.cohort%';

  -- Create substantive discussion threads (past 48-72 hours)
  IF module_id IS NOT NULL THEN
    INSERT INTO discussion_threads (id, title, content_html, created_by, module_id, created_at, last_activity_at) VALUES
    (gen_random_uuid(), 'The Obstacle I''m Actually Facing', 
     '<p>After reading the first chapter of The Obstacle Is The Way, I realized I''ve been avoiding the hardest conversation on my team. I have a senior engineer who is brilliant but consistently undermines my authority in meetings. Instead of addressing it directly, I''ve been routing around it. Creating workarounds instead of confronting the pattern.</p><p>The obstacle isn''t the engineer. It''s my fear of the conversation. What if I mess it up? What if they quit? What if I''m wrong about the pattern?</p><p>Anyone else avoiding a conversation you know you need to have?</p>',
     user_ids[1], module_id, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '2 hours')
    RETURNING id INTO discussion_ids[1];

    INSERT INTO discussion_threads (id, title, content_html, created_by, module_id, created_at, last_activity_at) VALUES
    (gen_random_uuid(), 'Delegation vs. Abandonment', 
     '<p>I''m struggling to understand the difference between delegation and abandonment. I gave my team a big project last month, told them I trusted them, and stepped back. Now it''s behind schedule and heading in the wrong direction.</p><p>They''re frustrated because they feel I disappeared. I''m frustrated because I thought I was empowering them. Where''s the line between giving autonomy and giving support?</p><p>How do you delegate without disappearing?</p>',
     user_ids[2], module_id, NOW() - INTERVAL '18 hours', NOW() - INTERVAL '5 hours')
    RETURNING id INTO discussion_ids[2];

    INSERT INTO discussion_threads (id, title, content_html, created_by, module_id, created_at, last_activity_at) VALUES
    (gen_random_uuid(), 'The Performance Review I Keep Delaying', 
     '<p>I have a team member who is consistently missing deadlines and producing mediocre work. The annual review is next week and I''ve been drafting and re-drafting the feedback document for three weeks.</p><p>Every version I write feels either too harsh or too soft. Too vague or too detailed. I know I''m overthinking it, but this person has been with the company for 8 years. This conversation could end their career here.</p><p>What''s the stoic approach to giving feedback that might devastate someone?</p>',
     user_ids[3], module_id, NOW() - INTERVAL '24 hours', NOW() - INTERVAL '6 hours')
    RETURNING id INTO discussion_ids[3];

    INSERT INTO discussion_threads (id, title, content_html, created_by, module_id, created_at, last_activity_at) VALUES
    (gen_random_uuid(), 'Learning to Trust Again After Being Burned', 
     '<p>Three months ago, I delegated a critical client presentation to someone I thought was ready. They weren''t. We lost the client. Since then, I''ve been micromanaging everything. My team can feel it. I can feel it. I''m exhausted.</p><p>The rational part of my brain knows I can''t control everything. But the scared part remembers that lost client and won''t let go. How do you rebuild trust in your team when you''ve been burned?</p>',
     user_ids[4], module_id, NOW() - INTERVAL '30 hours', NOW() - INTERVAL '12 hours')
    RETURNING id INTO discussion_ids[4];

    INSERT INTO discussion_threads (id, title, content_html, created_by, module_id, created_at, last_activity_at) VALUES
    (gen_random_uuid(), 'The Leadership Mask I''m Tired of Wearing', 
     '<p>I''ve been in leadership for 6 years. I''ve built an entire persona around being the composed, confident, always-has-the-answer leader. It worked for a while. Now it feels like a trap.</p><p>Someone asked in a meeting yesterday "What do you think we should do?" and I realized I had no idea. But instead of saying that, I made something up. Gave them a decisive answer I pulled out of thin air because that''s what "good leaders" do, right?</p><p>How do you lead from a place of authenticity when everyone expects certainty?</p>',
     user_ids[5], module_id, NOW() - INTERVAL '36 hours', NOW() - INTERVAL '4 hours')
    RETURNING id INTO discussion_ids[5];
  END IF;

  -- Create discussion responses (showing real engagement)
  IF module_id IS NOT NULL AND ARRAY_LENGTH(discussion_ids, 1) > 0 THEN
    INSERT INTO discussion_posts (discussion_thread_id, content_html, posted_by, created_at) VALUES
    (discussion_ids[1], '<p>This hit me hard. I''ve been doing the same thing with a direct report who shows up late constantly. I tell myself "maybe it''ll just get better" instead of addressing it. The obstacle is definitely my discomfort with the conversation.</p>', user_ids[6], NOW() - INTERVAL '6 hours'),
    (discussion_ids[1], '<p>Had this conversation last week. It was terrifying and it went better than I imagined. Turns out they had no idea they were doing it and appreciated me bringing it up directly. The anticipation was worse than the actual conversation.</p>', user_ids[7], NOW() - INTERVAL '4 hours'),
    (discussion_ids[2], '<p>I learned this the hard way too. Now I do weekly check-ins on big projects. Not to micromanage, but to remove obstacles and course-correct early. It''s not abandonment if you''re still there when they need you.</p>', user_ids[8], NOW() - INTERVAL '10 hours'),
    (discussion_ids[3], '<p>Been there. What helped me was realizing that unclear feedback is actually crueler than honest feedback. You''re not helping them by being vague. You''re helping them by being clear.</p>', user_ids[9], NOW() - INTERVAL '8 hours'),
    (discussion_ids[4], '<p>Still working through this myself, but I''m trying to trust the process instead of trusting people to be perfect. People will make mistakes. The question is: did they learn from it? Are they growing? That''s what I''m trying to focus on.</p>', user_ids[10], NOW() - INTERVAL '14 hours'),
    (discussion_ids[5], '<p>I dropped the mask six months ago and it was the best decision I made as a leader. Said "I don''t know" in a meeting and instead of losing respect, my team stepped up. They had ideas I never would have heard if I kept pretending I had all the answers.</p>', user_ids[11], NOW() - INTERVAL '6 hours'),
    (discussion_ids[5], '<p>This is the work. The persona worked when the problems were simple. Now the problems are complex and you need your team''s full intelligence. That requires you showing up authentically, not perfectly.</p>', user_ids[12], NOW() - INTERVAL '3 hours');
  END IF;

  -- Create activity snapshots for the past 7 days (for engagement analysis)
  INSERT INTO user_activity_snapshot (user_id, snapshot_date, logins_count, posts_count, responses_count, engagement_score, last_login)
  SELECT 
    id,
    CURRENT_DATE - i,
    CASE 
      -- Active contributors: 1-2 logins per day
      WHEN id = ANY(user_ids[1:5]) THEN 1 + (RANDOM() * 1)::INT
      -- Moderate: every other day
      WHEN id = ANY(user_ids[6:10]) THEN (RANDOM() * 1)::INT
      -- Lurkers: daily but no posts
      WHEN id = ANY(user_ids[11:13]) THEN 1
      -- Inactive: no logins
      WHEN id = ANY(user_ids[14:15]) THEN 0
      -- Breakthrough: started active recently
      WHEN id = ANY(user_ids[16:17]) AND i < 3 THEN 1
      WHEN id = ANY(user_ids[16:17]) AND i >= 3 THEN 0
      ELSE (RANDOM() * 0.5)::INT
    END,
    CASE 
      -- Active contributors: posts
      WHEN id = ANY(user_ids[1:5]) AND i < 2 THEN (RANDOM() * 2)::INT
      -- Breakthrough: started posting
      WHEN id = ANY(user_ids[16:17]) AND i < 3 THEN 1
      ELSE 0
    END,
    CASE 
      -- Active contributors: responses
      WHEN id = ANY(user_ids[1:5]) THEN (RANDOM() * 3)::INT
      -- Moderate: occasional responses
      WHEN id = ANY(user_ids[6:10]) AND RANDOM() > 0.5 THEN 1
      ELSE 0
    END,
    CASE 
      WHEN id = ANY(user_ids[1:5]) THEN 85 + (RANDOM() * 15)::INT
      WHEN id = ANY(user_ids[6:10]) THEN 60 + (RANDOM() * 20)::INT
      WHEN id = ANY(user_ids[11:13]) THEN 30 + (RANDOM() * 20)::INT
      WHEN id = ANY(user_ids[14:15]) THEN 0
      WHEN id = ANY(user_ids[16:17]) AND i < 3 THEN 70 + (RANDOM() * 20)::INT
      ELSE 40 + (RANDOM() * 20)::INT
    END,
    NOW() - (i * INTERVAL '1 day')
  FROM profiles p
  CROSS JOIN generate_series(0, 6) AS i
  WHERE p.email LIKE '%test.cohort%'
  ON CONFLICT (user_id, snapshot_date) DO NOTHING;

END $$;

-- Add some engagement flags examples
INSERT INTO engagement_flags (user_id, flag_type, flag_reason, context, created_at)
SELECT 
  id,
  'red',
  'No login for 10+ days',
  jsonb_build_object('last_login', NOW() - INTERVAL '12 days', 'previous_activity', 'high'),
  NOW()
FROM profiles 
WHERE email = 'daniel.moore@test.cohort'
ON CONFLICT DO NOTHING;

INSERT INTO engagement_flags (user_id, flag_type, flag_reason, context, created_at)
SELECT 
  id,
  'yellow',
  'Lurker - consuming but not contributing',
  jsonb_build_object('logins_last_week', 7, 'posts_last_week', 0, 'pattern', 'consistent_lurking'),
  NOW()
FROM profiles 
WHERE email = 'jennifer.white@test.cohort'
ON CONFLICT DO NOTHING;

INSERT INTO engagement_flags (user_id, flag_type, flag_reason, context, created_at)
SELECT 
  id,
  'green',
  'Breakthrough - lurker became contributor',
  jsonb_build_object('posts_this_week', 3, 'posts_last_week', 0, 'quality', 'substantive'),
  NOW()
FROM profiles 
WHERE email = 'chris.davis@test.cohort'
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Test data seeded successfully! Created test users, discussions, activity snapshots, and engagement flags.';
END $$;

