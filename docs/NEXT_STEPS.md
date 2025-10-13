# 🚀 Next Steps - RLTE Platform Setup

You've completed Phases 1-3! Here's what to do next:

## ✅ Step 1: Configure .env.local (Do This Now!)

1. **Find your Supabase credentials**:
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Settings (⚙️) → API

2. **Edit `.env.local`** (in project root):
   ```bash
   code .env.local  # or use nano/vim
   ```

3. **Replace these three values**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...  (copy from Supabase)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  (copy from Supabase)
   ```

## ✅ Step 2: Run Database Migrations

After configuring `.env.local`, set up your database:

### Option A: Using Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
2. Click **SQL Editor** in the left sidebar
3. Click **+ New Query**
4. Copy and paste each migration file in order:
   ```
   supabase/migrations/00001_initial_schema.sql
   supabase/migrations/00002_modules_schema.sql
   supabase/migrations/00003_discussions_schema.sql
   supabase/migrations/00004_events_schema.sql
   supabase/migrations/00005_books_schema.sql
   supabase/migrations/00006_partners_schema.sql
   supabase/migrations/00007_capstone_analytics_schema.sql
   ```
5. Click **Run** for each one

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

## ✅ Step 3: Create Storage Buckets

In Supabase Dashboard → Storage:

1. **avatars** (public)
   - Max file size: 5MB
   - Allowed types: image/*

2. **module-content** (public)
   - Max file size: 10MB
   - Allowed types: *

3. **attachments** (private)
   - Max file size: 10MB
   - Allowed types: *

4. **book-covers** (public)
   - Max file size: 5MB
   - Allowed types: image/*

See `supabase/README.md` for detailed bucket policies.

## ✅ Step 4: Test Your Setup

```bash
# Restart dev server
pnpm dev
```

Then visit:
- http://localhost:3000 - Homepage ✓
- http://localhost:3000/design-system - Components ✓
- http://localhost:3000/login - Should load without errors! ✓

## ✅ Step 5: Create Your First Admin User

1. Go to: http://localhost:3000/signup
2. Create an account with your email
3. Check your email for confirmation link
4. In Supabase Dashboard → Authentication → Users
5. Find your user and note the UUID
6. In Supabase Dashboard → Table Editor → profiles
7. Change your role from 'participant' to 'admin'

Or run this SQL in Supabase:
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## ✅ Step 6: Test the Platform

After creating your admin account:

1. Login at: http://localhost:3000/login
2. You should see the dashboard
3. Try navigating with the sidebar
4. Visit: http://localhost:3000/profile
5. Upload an avatar (tests storage)
6. Check out: http://localhost:3000/admin

## 🎯 You're Ready!

Once these steps are complete, you can:
- ✅ Create users
- ✅ Manage profiles
- ✅ Upload files
- ✅ Navigate the platform

## 📝 What's Next?

**Phase 4: Learning Management System**
- Module creation interface
- Rich text editor for content
- Lesson management
- Progress tracking
- Reflections

See the main plan for details!

## 🆘 Troubleshooting

### "Your project's URL and Key are required"
→ Check `.env.local` has correct values from Supabase

### "relation profiles does not exist"
→ Run the database migrations (Step 2)

### "Cannot upload avatar"
→ Create storage buckets (Step 3)

### "Permission denied" in Supabase
→ Check RLS policies are enabled after migrations

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- Project README: `README.md`
- Setup Status: `SETUP.md`
- Session Summary: `SESSION_SUMMARY.md`

---

**Need Help?** Check the documentation files or Supabase dashboard for errors.

🌲 Let's build this platform!

