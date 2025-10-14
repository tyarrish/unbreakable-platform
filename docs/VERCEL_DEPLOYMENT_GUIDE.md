# 🚀 Vercel Deployment Guide

## Quick Start: Deploy in 5 Minutes

### Step 1: Push Current Changes to GitHub

```bash
cd /Users/treveryarrish/Projects/Cohort
git add .
git commit -m "feat: prepare for Vercel deployment with complete LMS features"
git push origin main
```

### Step 2: Connect to Vercel

1. **Visit**: https://vercel.com/new
2. **Import Git Repository**: Select `tyarrish/unbreakable-platform`
3. **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`

### Step 3: Add Environment Variables in Vercel

In Vercel project settings → Environment Variables, add:

#### Required Variables (Production)
```
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

**Where to find Supabase keys:**
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Visit your production URL

---

## Automatic Deployments Configured ✅

With the `vercel.json` configuration:
- ✅ **Push to `main`** → Automatic production deployment
- ✅ **Pull Requests** → Preview deployments
- ✅ **Other branches** → Preview deployments

---

## Post-Deployment Checklist

### Immediately After First Deploy

- [ ] Visit production URL and verify it loads
- [ ] Test login/signup flow
- [ ] Verify Supabase connection works
- [ ] Check that styling looks correct
- [ ] Test navigation between pages

### Supabase Production Setup

If using a new production Supabase project, you need to:

1. **Run Database Migrations**:
```bash
# Link to production Supabase project
supabase link --project-ref YOUR_PRODUCTION_PROJECT_REF

# Push all migrations
supabase db push
```

2. **Create Storage Buckets** in Supabase Dashboard:
   - `avatars` (public, 5MB limit)
   - `module-content` (public, 10MB limit)
   - `attachments` (private, 10MB limit)
   - `book-covers` (public, 5MB limit)

3. **Apply Storage Policies**:
   - Go to: Storage → Policies
   - See `/supabase/storage-policies.sql` for reference

4. **Configure Auth Settings**:
   - Go to: Authentication → URL Configuration
   - Add Site URL: `https://your-app.vercel.app`
   - Add Redirect URLs: `https://your-app.vercel.app/**`

5. **Create First Admin User**:
   - Sign up through your app
   - In Supabase Dashboard: Authentication → Users
   - Find your user and change role to `admin` in `profiles` table

---

## Custom Domain (Optional)

1. Go to: Vercel Project → Settings → Domains
2. Add your domain (e.g., `learn.rogueleadership.org`)
3. Configure DNS as instructed by Vercel
4. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## Monitoring & Logs

### Vercel Dashboard
- **Deployments**: View all deployments and their status
- **Logs**: Real-time function logs
- **Analytics**: Page views, Web Vitals
- **Speed Insights**: Performance metrics

### Supabase Dashboard
- **Database**: Query performance, table stats
- **API**: Request counts, error rates
- **Storage**: Usage and bandwidth
- **Auth**: User signups, login attempts

---

## Troubleshooting

### Build Fails on Vercel

**Error: Missing dependencies**
```bash
# Locally, regenerate lock file
pnpm install
git add pnpm-lock.yaml
git commit -m "fix: update lock file"
git push origin main
```

**Error: Type checking fails**
```bash
# Run locally to see errors
pnpm type-check

# Fix any TypeScript errors, then push
```

### Database Connection Errors

1. Verify environment variables are set correctly in Vercel
2. Check Supabase project is active (not paused)
3. Verify IP allowlist in Supabase (should allow all for Vercel)
4. Check that database migrations ran successfully

### Authentication Not Working

1. Verify Auth redirect URLs in Supabase Dashboard
2. Check that `NEXT_PUBLIC_APP_URL` matches your Vercel URL
3. Clear browser cookies and try again
4. Check Supabase Auth logs for specific errors

### Styling Looks Broken

1. Verify Tailwind CSS compiled correctly
2. Check browser console for CSS loading errors
3. Try hard refresh (Cmd+Shift+R)
4. Verify `globals.css` is imported in root layout

---

## Environment Strategy

### Development (Local)
- Uses `.env.local`
- Development Supabase project
- Hot reload enabled

### Preview (Pull Requests)
- Preview environment variables in Vercel
- Can use staging Supabase project
- Automatic preview URL for each PR

### Production (Main Branch)
- Production environment variables
- Production Supabase project
- Deployed to: `your-app.vercel.app`

---

## Rollback Procedure

If something goes wrong:

1. Go to: Vercel → Deployments
2. Find last working deployment
3. Click three dots → **"Promote to Production"**
4. Instant rollback (no rebuild needed)

---

## Performance Tips

Already configured for optimal performance:
- ✅ Server components by default
- ✅ Image optimization
- ✅ Automatic code splitting
- ✅ Edge runtime for API routes
- ✅ Turbopack for faster builds

---

## Security Best Practices

- ✅ Never commit `.env` files (already in `.gitignore`)
- ✅ Use `SUPABASE_SERVICE_ROLE_KEY` only in server components
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Input validation on all forms
- ✅ HTTPS enforced by Vercel

---

## Next Steps After Deployment

1. **Set up monitoring** (Vercel Analytics)
2. **Configure error tracking** (Sentry, LogRocket)
3. **Enable email notifications** (Resend API)
4. **Custom domain** setup
5. **SSL certificate** (automatic via Vercel)

---

## Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase + Vercel**: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs

---

🌲 **Your RLTE Platform is production-ready!**

