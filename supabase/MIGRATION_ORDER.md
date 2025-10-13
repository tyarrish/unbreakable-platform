# Migration Execution Order

Run these in Supabase SQL Editor **one at a time** in this exact order:

## ✅ Step 1: Initial Schema (Profiles & Auth)
File: `00001_initial_schema.sql`
- Creates profiles table
- Sets up RLS policies
- Creates triggers for new users

## ✅ Step 2: Modules Schema
File: `00002_modules_schema.sql`
- Creates modules, lessons, lesson_attachments tables
- Creates lesson_progress and reflections tables
- Sets up RLS policies

## ✅ Step 3: Discussions Schema
File: `00003_discussions_schema.sql`
- Creates discussion_threads and discussion_posts tables
- Creates post_reactions table
- Sets up RLS policies

## ✅ Step 4: Events Schema
File: `00004_events_schema.sql`
- Creates events and event_attendance tables
- Creates event_reminders table
- Sets up RLS policies

## ✅ Step 5: Books Schema
File: `00005_books_schema.sql`
- Creates books and reading_progress tables
- Creates reading_groups table
- Sets up RLS policies

## ✅ Step 6: Partners Schema
File: `00006_partners_schema.sql`
- Creates partner_questionnaire table
- Creates partner_checkins and partner_messages tables
- Sets up RLS policies

## ✅ Step 7: Capstone & Analytics
File: `00007_capstone_analytics_schema.sql`
- Creates capstone_projects table
- Creates analytics_events table
- Creates analytics views
- Sets up RLS policies

---

## How to Run:

1. Open each file in your code editor
2. Copy the entire contents
3. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
4. Paste the SQL
5. Click RUN
6. Wait for success message
7. Move to next file

## Troubleshooting:

- If a migration fails, **STOP** and fix the error before continuing
- You can re-run a migration if needed (we use IF NOT EXISTS)
- Check the error message for which table/policy is causing issues
