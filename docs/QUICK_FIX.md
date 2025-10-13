# Quick Login Fix

## Issue: Redirects back to login after successful authentication

## Most Common Cause: Email Not Confirmed ✉️

### Fix Option 1: Confirm in Supabase Dashboard (Fastest)

1. Go to: https://supabase.com/dashboard/project/jtwmuugzyzauoyjvpymh/auth/users
2. Find your user in the list
3. Click the three dots (•••) next to your user
4. Click "**Send confirmation email**" or "**Confirm email**"
5. If prompted, just confirm it manually
6. Try logging in again

### Fix Option 2: Check Email Inbox

- Look for email from Supabase
- Click the confirmation link
- Then login again

### Fix Option 3: Disable Email Confirmation (Testing Only)

1. Go to: https://supabase.com/dashboard/project/jtwmuugzyzauoyjvpymh/auth/providers
2. Scroll to "**Email**" provider
3. Under "**Confirm email**", toggle it **OFF**
4. Save
5. Sign up a new account (will work immediately without confirmation)

---

## After Confirming Email:

1. **Go to login**: http://localhost:3000/login
2. **Enter credentials**
3. **Click Sign In**
4. **Should redirect to dashboard successfully!** ✅

---

## Also: Make Sure You're an Admin

Run this SQL in Supabase:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

Or check in Table Editor:
https://supabase.com/dashboard/project/jtwmuugzyzauoyjvpymh/editor
→ Click "profiles" table
→ Find your user
→ Edit "role" to "admin"

---

## Debug: Check Session in Console

If still having issues, open browser console (F12) and run:
```javascript
localStorage.getItem('sb-jtwmuugzyzauoyjvpymh-auth-token')
```

If this returns `null`, the session isn't being stored.

---

Try the email confirmation fix first - that's usually the issue! 🌲

