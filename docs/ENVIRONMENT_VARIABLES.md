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
# This is used for invite email redirects - MUST be your production domain
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
# For local development, you can use: http://localhost:3000
# For Vercel: https://your-project.vercel.app

# Resend Email Service (Optional but recommended)
# Get this from https://resend.com/api-keys
# If not set, you'll need to manually send invite links
RESEND_API_KEY=re_your_api_key_here
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

### Resend Email Service (Recommended)

1. Go to [Resend](https://resend.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create API Key**
5. Copy the key (starts with `re_`)
6. Add to your environment as `RESEND_API_KEY`

**Why use Resend:**
- Automatically sends beautiful branded invite emails
- No manual copying/pasting links
- Better user experience
- Delivery tracking and analytics

**Domain Setup (For Production):**
1. In Resend dashboard, go to **Domains**
2. Add your domain (e.g., `rogueleadership.org`)
3. Add the DNS records shown
4. Update `EMAIL_CONFIG.from` in `lib/email/resend.ts` to use your domain
5. Example: `from: 'Rogue Leadership <invites@rogueleadership.org>'`

**Without Resend:**
- Invites still work!
- You'll just copy the link manually and send it yourself
- Good for testing or low-volume use

## Troubleshooting

### "User not allowed" error when sending invites
- ✅ This is now fixed with custom token system
- ✅ No longer using Supabase's problematic inviteUserByEmail

### Emails not being sent
- ✅ Check that `RESEND_API_KEY` is set in Vercel
- ✅ Verify the API key is valid (test in Resend dashboard)
- ✅ Check server logs for Resend API errors
- ✅ If email fails, invite link is still displayed for manual sending

### Admin operations not working
- Ensure you're using the service role key, not the anon key
- Check server logs for detailed error messages
- Verify the key has not expired or been rotated

