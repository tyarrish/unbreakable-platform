# 🚀 Quick Storage Bucket Setup

**Fix the "RLS policy" error in 3 minutes**

---

## The Error You're Seeing

```
StorageApiError: new row violates row-level security policy
```

This means the storage bucket doesn't exist or doesn't have upload permissions.

---

## ✅ Quick Fix (Choose One)

### Option A: Use External URLs (Immediate - No Setup)

**Fastest way to get videos working NOW**:

1. Go to lesson editor → Video tab
2. Click "**Paste URL**" tab (not Upload)
3. Paste test video:
   ```
   https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
   ```
4. Click "Save Video URL"
5. ✅ Works immediately! No bucket needed.

---

### Option B: Create Storage Bucket (For Uploads - 5 min)

**Step 1: Create Bucket**

1. Open: https://supabase.com/dashboard/project/jtwmuugzyzauoyjvpymh/storage/buckets

2. Click "**New bucket**"

3. Configure:
   - Name: `lesson-videos`
   - Public: ✅ **YES** (important!)
   - Create bucket

**Step 2: Set Policies**

1. Go to: https://supabase.com/dashboard/project/jtwmuugzyzauoyjvpymh/storage/policies

2. Click on `lesson-videos` bucket

3. Click "**New Policy**"

4. Choose "**For full customization**"

5. Paste this policy:

**Policy Name**: `Public read access`
```sql
((bucket_id = 'lesson-videos'::text))
```

6. Click "**Review**" → "**Save policy**"

7. Create another policy:

**Policy Name**: `Authenticated insert`
```sql
((bucket_id = 'lesson-videos'::text))
```
**Target roles**: `authenticated`  
**Policy command**: `INSERT`

8. Save

**Step 3: Test Upload**

1. Go back to admin lesson editor
2. Try uploading again
3. ✅ Should work!

---

## 🎯 Recommended Approach

**For Now**: Use **external URLs** (Option A)
- Works immediately
- No setup needed
- Great for testing
- Can use YouTube, Vimeo, etc.

**For Production**: Create bucket (Option B)
- Full control over videos
- Better performance
- No external dependencies
- Professional setup

---

## 📝 Alternative: Use Simpler Policies

If the above doesn't work, use these simpler policies:

**Go to**: https://supabase.com/dashboard/project/jtwmuugzyzauoyjvpymh/sql/new

**Paste and run**:

```sql
-- Simple public access for lesson-videos bucket
CREATE POLICY "simple_public_read" ON storage.objects 
FOR SELECT USING (bucket_id = 'lesson-videos');

CREATE POLICY "simple_auth_upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'lesson-videos');

CREATE POLICY "simple_auth_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'lesson-videos');
```

---

## ✅ Quick Checklist

Current state:
- [ ] Bucket `lesson-videos` created?
- [ ] Bucket set to public?
- [ ] Upload policy set?
- [ ] Read policy set?

**OR** just use external URLs for now! ✅

---

**Use external video URLs for immediate testing, create bucket later for production!** 🎬

