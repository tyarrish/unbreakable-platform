# 🎬 Video Upload Setup Guide

## Create Supabase Storage Bucket for Videos

Before uploading videos, you need to create a storage bucket in Supabase.

---

## Step 1: Create the Bucket

1. **Go to**: https://supabase.com/dashboard/project/jtwmuugzyzauoyjvpymh/storage/buckets

2. **Click**: "New bucket"

3. **Configure**:
   - **Name**: `lesson-videos`
   - **Public**: ✅ Yes (so videos can be played)
   - **File size limit**: 500 MB
   - **Allowed MIME types**: Leave empty (or add: video/mp4, video/webm, video/ogg)

4. **Click**: "Create bucket"

---

## Step 2: Set Storage Policies

After creating the bucket, set these policies:

### Policy 1: Public Read Access

```sql
CREATE POLICY "Public can read videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-videos');
```

### Policy 2: Admins Can Upload

```sql
CREATE POLICY "Admins and facilitators can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-videos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  )
);
```

### Policy 3: Admins Can Delete

```sql
CREATE POLICY "Admins and facilitators can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-videos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  )
);
```

---

## Step 3: Test Upload

1. **Go to**: Admin → Modules → Edit Lesson → Video tab
2. **Click**: "Upload Video" tab
3. **Select**: A small test video file (< 50MB for testing)
4. **Upload**: Should complete with progress bar
5. **Verify**: Video appears in preview
6. **View**: As participant to see it play

---

## Video Upload Features

### Supported Methods

**1. Upload to Supabase** (Upload Video tab)
- Direct file upload
- Progress bar
- Automatic duration extraction
- Hosted on your Supabase project
- Full control over files

**2. External URL** (Paste URL tab)
- YouTube videos
- Vimeo videos
- Direct video URLs (.mp4, .webm)
- No storage limits
- Easy to update

---

## Best Practices

### For Uploaded Videos
- **Max size**: 500MB per file
- **Format**: MP4 recommended (best compatibility)
- **Resolution**: 1080p or 720p (HD quality)
- **Compression**: Use Handbrake or similar to optimize
- **Naming**: Use descriptive names

### For External Videos
- **YouTube**: Use full video URL (not shortened)
- **Vimeo**: Use direct video file URL if possible
- **CDN**: Consider using Bunny CDN or similar for faster delivery

---

## Storage Management

### Check Usage
- Go to Supabase → Storage → lesson-videos
- Monitor total storage used
- Supabase free tier: 1GB storage

### Upgrade if Needed
- Pro plan: 100GB storage included
- Additional storage: $0.021/GB

---

## Testing Checklist

- [ ] Storage bucket `lesson-videos` created
- [ ] Public read policy set
- [ ] Admin upload policy set
- [ ] Admin delete policy set
- [ ] Test video upload works
- [ ] Test external URL works
- [ ] Video plays in participant view
- [ ] Progress tracking works
- [ ] Thumbnail displays correctly

---

## Quick Test URLs

For testing without uploading:

**Test Video 1** (BigBuckBunny - 9 min):
```
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
```

**Test Video 2** (Elephants Dream - short):
```
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4
```

**Test Thumbnail**:
```
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg
```

---

## Troubleshooting

### "Bucket not found" error
→ Create the `lesson-videos` bucket in Supabase

### Upload fails with permission error
→ Check admin upload policy is set correctly

### Video won't play
→ Verify bucket is set to public
→ Check video URL is accessible

### Upload is slow
→ Large video file - consider compressing
→ Or use external URL (YouTube/Vimeo)

---

## 🎉 Ready to Use!

Once the bucket is created, you can:

1. **Upload videos** directly from the admin panel
2. **Or paste URLs** from YouTube, Vimeo, etc.
3. **Videos are automatically** saved to lessons
4. **Participants see** professional video player
5. **Progress tracked** automatically

---

🌲 Your video system is production-ready!

