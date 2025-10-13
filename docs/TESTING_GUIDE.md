# 🧪 RLTE Platform - Testing Guide

## ✅ Migrations Complete!

All database tables, policies, and functions are now set up in Supabase.

---

## 🚀 Testing Your Platform

### Step 1: Verify Dev Server is Running

The server should now be running at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.68.54:3000

✅ If you see the homepage without Supabase errors = SUCCESS!

---

### Step 2: Test Pages

Visit these URLs to verify everything loads:

1. **Homepage**: http://localhost:3000
   - Should show features and hero section

2. **Design System**: http://localhost:3000/design-system
   - Should show all UI components

3. **Login Page**: http://localhost:3000/login
   - Should load without errors (no more "Supabase URL required")

---

### Step 3: Create Your Admin Account

#### 3a. Sign Up

1. Go to: http://localhost:3000/signup
2. Enter your details:
   - **Full Name**: Your Name
   - **Email**: your@email.com
   - **Password**: (at least 6 characters)
3. Click "Create Account"

#### 3b. Confirm Email

- Check your email inbox
- Click the confirmation link from Supabase
- This activates your account

#### 3c. Make Yourself Admin

**Option 1: Using Supabase Dashboard**

1. Go to: https://supabase.com/dashboard/project/jtwmuugzyzauoyjvpymh/editor
2. Click "**profiles**" table
3. Find your user row
4. Click to edit the "**role**" column
5. Change from `participant` to `admin`
6. Save

**Option 2: Using SQL**

1. Go to: https://supabase.com/dashboard/project/jtwmuugzyzauoyjvpymh/sql/new
2. Run this SQL (replace with your email):
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'your@email.com';
   ```

---

### Step 4: Login as Admin

1. Go to: http://localhost:3000/login
2. Enter your email and password
3. Click "Sign In"

You should be redirected to: http://localhost:3000/dashboard

---

### Step 5: Explore the Platform

Now that you're logged in as admin, test these pages:

#### 📊 Dashboard
- http://localhost:3000/dashboard
- Should show stats and progress

#### 👤 Profile
- http://localhost:3000/profile
- Try uploading an avatar
- Edit your name and bio

#### 📚 Modules
- http://localhost:3000/modules
- Shows placeholder (modules will be created in Phase 4)

#### 💬 Discussions
- http://localhost:3000/discussions
- Shows placeholder

#### 📅 Calendar
- http://localhost:3000/calendar
- Shows placeholder

#### 📖 Library
- http://localhost:3000/library
- Shows placeholder

#### 👥 Partner
- http://localhost:3000/partner
- Shows placeholder

#### ⛰️ Capstone
- http://localhost:3000/capstone
- Shows placeholder

#### ⚙️ Admin Dashboard
- http://localhost:3000/admin
- Should show admin management cards
- Only visible to admin/facilitator roles

---

### Step 6: Test Storage (Avatar Upload)

1. Go to: http://localhost:3000/profile
2. Click "Upload Avatar"
3. Select an image (max 5MB)
4. Should upload successfully

**If upload fails:**
- Go to: https://supabase.com/dashboard/project/jtwmuugzyzauoyjvpymh/storage/buckets
- Create bucket named "**avatars**"
- Set it to **public**
- Add storage policies (see supabase/README.md)

---

### Step 7: Test Role-Based Access

#### Test as Participant

1. Create another account: http://localhost:3000/signup
2. Login with that account
3. Visit: http://localhost:3000/admin
4. Should redirect to dashboard (no admin access)

#### Test Sidebar Navigation

As admin, you should see:
- Dashboard
- Modules
- Discussions
- Events
- Library
- My Partner
- Capstone
- **Admin** ← Only for admin/facilitator

As participant:
- Same menu but NO Admin link

---

## ✅ Success Checklist

- [ ] Homepage loads without errors
- [ ] Design system page shows all components
- [ ] Can sign up and receive confirmation email
- [ ] Can make user admin in Supabase
- [ ] Can login successfully
- [ ] Dashboard loads with stats
- [ ] Can edit profile and upload avatar
- [ ] All navigation pages load (even if placeholder)
- [ ] Admin dashboard accessible as admin
- [ ] Role-based access control works
- [ ] Sidebar shows correct menu items by role

---

## 🐛 Troubleshooting

### "Supabase URL required"
→ Check `.env.local` has correct values
→ Restart dev server: `pnpm dev`

### "relation profiles does not exist"
→ Migrations didn't run
→ Check: https://supabase.com/dashboard/project/jtwmuugzyzauoyjvpymh/editor

### "Cannot upload avatar"
→ Create storage buckets in Supabase
→ See: supabase/README.md for policies

### "Permission denied"
→ Check RLS policies in Supabase
→ Verify your role is 'admin' in profiles table

### Profile avatar not showing
→ Check storage bucket is public
→ Verify file uploaded to Supabase Storage

---

## 🎉 If Everything Works

**Congratulations!** Your RLTE platform is fully operational with:

- ✅ Authentication system
- ✅ Role-based access control
- ✅ User profiles
- ✅ Protected routes
- ✅ Database with all tables
- ✅ Storage for files
- ✅ Beautiful design system

---

## 📚 Next Phase: Build Features

You're now ready for **Phase 4: Learning Management System**

This will add:
- Module creation interface
- Rich text editor
- Lesson management
- Progress tracking
- Reflections

See the main plan for details!

---

## 📖 Documentation Files

- **README.md** - Project overview
- **SETUP.md** - Setup status
- **NEXT_STEPS.md** - Initial setup guide
- **SESSION_SUMMARY.md** - What was built
- **TESTING_GUIDE.md** - This file
- **supabase/README.md** - Database setup
- **.cursorrules** - Development standards

---

🌲 **Happy testing!** Let me know if you run into any issues.

