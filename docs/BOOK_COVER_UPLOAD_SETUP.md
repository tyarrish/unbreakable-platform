# Book Cover Upload Setup Guide

## Quick Start

The book cover management system is now enhanced with drag-and-drop upload functionality. Follow these steps to enable it:

### 1. Apply Storage Migration

The storage bucket needs to be created in your Supabase project.

**Option A: Automatic (Recommended)**
```bash
# The migration will run automatically on next deployment
# Just push your changes and deploy
git add .
git commit -m "Add book cover upload feature"
git push
```

**Option B: Manual**
```bash
# If using Supabase CLI locally
supabase db push

# Or apply the specific migration
supabase migration up --version 00013
```

**Option C: Supabase Dashboard**
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the contents of `supabase/migrations/00013_book_covers_storage.sql`

### 2. Verify Storage Bucket

After applying the migration:

1. Go to **Supabase Dashboard → Storage**
2. You should see a new bucket called `book-covers`
3. Verify it's marked as **Public**
4. Click on the bucket → Policies tab
5. Verify 4 policies exist:
   - Anyone can view book covers (SELECT)
   - Authenticated users can upload book covers (INSERT)
   - Authenticated users can update book covers (UPDATE)
   - Authenticated users can delete book covers (DELETE)

### 3. Test the Feature

1. Log in as an admin user
2. Navigate to **Admin → Books → Add Book**
3. Enter book title and author
4. Try all three methods:
   - Click **"Auto-Fetch"** - Should fetch from Google Books
   - Click **"Upload"** or drag & drop an image - Should upload to Storage
   - Enter a custom URL - Should accept any URL

### 4. Troubleshooting

**Storage bucket not created**
- Ensure migration ran successfully
- Check Supabase logs for errors
- Manually create bucket in Dashboard if needed

**Upload fails with "403 Forbidden"**
- Check RLS policies are active
- Verify user is authenticated
- Ensure bucket is marked as public

**Upload fails with "Network error"**
- Check Supabase project is active (not paused)
- Verify internet connection
- Check browser console for detailed errors

## Feature Overview

### Three Upload Methods

1. **Auto-Fetch** - Fetch from Google Books API (existing feature)
2. **Upload** - Drag & drop or select image file (NEW!)
3. **Custom URL** - Paste any publicly accessible URL (existing feature)

### Component Architecture

The feature uses a reusable component:
- **`<BookCoverUpload />`** - Handles all three methods
- Integrated into both Create and Edit book pages
- Provides live preview and validation

### Storage Details

- **Bucket**: `book-covers` (public)
- **Max file size**: 5MB
- **Allowed formats**: JPEG, PNG, WebP, GIF
- **File naming**: `covers/{timestamp}-{random}.{ext}`
- **Access**: Public read, authenticated write

## Next Steps

After setup is complete:

1. ✅ Migration applied
2. ✅ Storage bucket verified
3. ✅ Upload tested
4. 📚 Add books with beautiful covers!
5. 🎨 Enjoy the enhanced library experience

## Support

For issues or questions, refer to:
- **Main documentation**: `/docs/BOOK_COVER_FEATURE.md`
- **Migration file**: `/supabase/migrations/00013_book_covers_storage.sql`
- **Component code**: `/components/books/book-cover-upload.tsx`





