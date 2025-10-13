# RLTE Platform - Deployment Guide

## 🚀 Deploying to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier is fine)
- Three Supabase projects (dev, staging, prod)

---

## Step 1: Push to GitHub

```bash
cd /Users/treveryarrish/Projects/Cohort

# Initialize git (if not already done)
git init
git add .
git commit -m "feat: Complete RLTE platform build - all 9 phases"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/rlte-platform.git
git branch -M main
git push -u origin main
```

---

## Step 2: Connect to Vercel

1. Go to: https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `pnpm build`
   - **Output Directory**: .next

---

## Step 3: Environment Variables

### Development Environment
Already configured in `.env.local`

### Staging Environment (Vercel Preview)
Create a staging Supabase project, then add to Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=your-staging-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-staging-service-role-key
NEXT_PUBLIC_APP_URL=https://your-app-staging.vercel.app
NODE_ENV=staging
```

### Production Environment
Create a production Supabase project, then add to Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_URL=https://rlte.yourdomain.com
NODE_ENV=production
```

---

## Step 4: Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL

---

## Step 5: Run Migrations on Production

For staging and production Supabase projects:

```bash
# Link to staging
supabase link --project-ref YOUR_STAGING_REF
supabase db push

# Link to production
supabase link --project-ref YOUR_PRODUCTION_REF
supabase db push
```

---

## Step 6: Create Storage Buckets

For each environment (staging/production), create these buckets:

1. **avatars** (public, 5MB)
2. **module-content** (public, 10MB)
3. **attachments** (private, 10MB)
4. **book-covers** (public, 5MB)

See `supabase/README.md` for storage policies.

---

## Step 7: Custom Domain (Optional)

1. Go to Vercel project settings → Domains
2. Add your custom domain (e.g., learn.rogueleadership.org)
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` in environment variables

---

## Step 8: Email Setup (Resend)

1. Sign up at: https://resend.com
2. Add and verify your domain
3. Get API key
4. Add to production environment variables
5. Configure email templates (future enhancement)

---

## Step 9: Create Admin User

After production deployment:

1. Sign up through the app
2. In Supabase dashboard, change your role to 'admin'
3. Login and start managing content

---

## Post-Deployment Checklist

### Immediately After Deploy
- [ ] Visit production URL
- [ ] Create admin account
- [ ] Test login/logout
- [ ] Create test module
- [ ] Create test discussion
- [ ] Create test event
- [ ] Upload test avatar

### Within First Week
- [ ] Create all 8 modules
- [ ] Add lessons to modules
- [ ] Schedule cohort events
- [ ] Add book library
- [ ] Set module release dates
- [ ] Invite test users
- [ ] Test all user flows

### Before Launch (Oct 23, 2025)
- [ ] Load production data
- [ ] Create all 24 participant accounts
- [ ] Assign accountability partners
- [ ] Schedule first month events
- [ ] Test email notifications
- [ ] Run performance audit
- [ ] Test on mobile devices
- [ ] Accessibility audit
- [ ] Security review

---

## Monitoring & Maintenance

### Vercel Dashboard
- Monitor deployment status
- Check build logs
- View analytics
- Configure alerts

### Supabase Dashboard
- Monitor database usage
- Check API requests
- Review storage usage
- Monitor real-time connections

### Regular Tasks
- **Weekly**: Check analytics for engagement
- **Bi-weekly**: Review discussion moderation needs
- **Monthly**: Backup database
- **Quarterly**: Security audit

---

## Performance Optimization

### Already Implemented
- ✅ Server components by default
- ✅ Image optimization with Next.js Image
- ✅ Lazy loading components
- ✅ Efficient database queries
- ✅ Proper indexing

### Future Enhancements
- [ ] Implement caching strategy
- [ ] Add service worker for offline
- [ ] Optimize bundle size
- [ ] Add CDN for static assets

---

## Backup Strategy

### Automated (Supabase Pro)
- Daily automated backups
- Point-in-time recovery
- Cross-region replication

### Manual Backups
```bash
# Export database
supabase db dump -f backup-$(date +%Y%m%d).sql

# Export storage
# Use Supabase dashboard or API
```

---

## Rollback Procedure

If issues arise after deployment:

1. **Vercel**: Instant rollback to previous deployment
   - Go to Deployments
   - Find last working version
   - Click "Promote to Production"

2. **Database**: Use Supabase backups
   - Go to Database → Backups
   - Restore to previous point

---

## Success Metrics

Track these in Analytics Dashboard:

- **90% login rate** in first week
- **80% module completion** rate
- **75% discussion engagement** rate
- **Sub-2s page load** times
- **Zero critical vulnerabilities**

---

## Support & Troubleshooting

### Common Issues

**Build fails on Vercel**
- Check Node.js version (18+)
- Verify all dependencies in package.json
- Check build logs for specific errors

**Database connection errors**
- Verify environment variables
- Check Supabase project status
- Verify database migrations ran successfully

**Authentication issues**
- Check Supabase Auth settings
- Verify redirect URLs in Supabase dashboard
- Check cookie domain settings

**Real-time not working**
- Verify Supabase real-time is enabled
- Check database replication settings
- Verify RLS policies allow SELECT

---

## Contact & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

🌲 **Ready for launch on October 23, 2025!**

