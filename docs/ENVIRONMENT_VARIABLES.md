# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Required for admin operations (user invites, deletions)
# Get this from Supabase Dashboard > Settings > API > service_role key
# WARNING: Keep this secret! Never commit to git or expose to client-side code
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
# For local development: http://localhost:3000
```

## Where to Find These Values

### Supabase Keys

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** > **API**
4. Copy the values:
   - **URL**: Project URL
   - **anon/public**: Anon key (safe for client-side)
   - **service_role**: Service role key (⚠️ SECRET - server-side only!)

### SUPABASE_SERVICE_ROLE_KEY

**This is CRITICAL for the user management system to work!**

The service role key is required for:
- Sending user invite emails
- Deleting users from auth.users
- Cleaning up orphaned auth records
- Other admin operations

⚠️ **Security Warning:**
- NEVER expose this key to the client-side
- NEVER commit it to version control
- Only use in server actions and API routes
- Keep it in `.env.local` (which is git-ignored)

## Vercel Deployment

When deploying to Vercel, add these environment variables in:
**Project Settings** > **Environment Variables**

Make sure to add `SUPABASE_SERVICE_ROLE_KEY` for all environments (Production, Preview, Development).

## Troubleshooting

### "User not allowed" error when sending invites
- ✅ Check that `SUPABASE_SERVICE_ROLE_KEY` is set in your environment
- ✅ Verify the service role key is correct (copy from Supabase dashboard)
- ✅ Restart your development server after adding the env variable

### Admin operations not working
- Ensure you're using the service role key, not the anon key
- Check server logs for detailed error messages
- Verify the key has not expired or been rotated

