# Book Cover Management Feature

## Overview
When adding or editing books in the library, you can automatically fetch book covers from Google Books API, upload your own custom covers via drag-and-drop, or enter a custom URL. The system provides a flexible, multi-option approach to managing book covers.

## How It Works

### Three Ways to Add Covers

#### 1. **Auto-Fetch from Google Books API**
- Free, no authentication required
- Fetches high-quality book covers
- Also retrieves book descriptions and ISBNs
- Search Priority:
  - ISBN Search (most accurate) - If ISBN is provided, searches by ISBN first
  - Title + Author Search (fallback) - If no ISBN, searches by title and author

#### 2. **Upload Custom Image** (NEW!)
- Drag-and-drop interface
- Upload your own cover images
- Stored securely in Supabase Storage
- Supported formats: JPEG, PNG, WebP, GIF
- Max file size: 5MB
- Click "Upload" button or drag image onto drop zone

#### 3. **Enter Custom URL**
- Paste any publicly accessible image URL
- Great for covers from Amazon, Goodreads, etc.
- Manual entry field always available

### Features
- ✅ One-click book cover auto-fetching
- ✅ Drag-and-drop image upload
- ✅ File upload via button click
- ✅ Automatic metadata population (description, ISBN)
- ✅ Live preview of cover before saving
- ✅ Manual override with custom URL
- ✅ Works on both create and edit pages
- ✅ Displays covers in admin and student library views
- ✅ Image validation (file type and size)
- ✅ Secure storage with public access URLs

## Usage Guide

### Adding a New Book
1. Navigate to **Admin → Books → Add Book**
2. Enter the **Book Title** and **Author** (required)
3. Optionally enter the **ISBN** for better accuracy
4. **Choose your cover method:**

   **Option A: Auto-Fetch**
   - Click **"Auto-Fetch"** button
   - System searches Google Books API
   - Preview appears if found
   - Description & ISBN auto-populate if empty

   **Option B: Upload Image**
   - Click **"Upload"** button or drag-and-drop image onto the drop zone
   - Select image file (JPEG, PNG, WebP, GIF)
   - Image uploads to Supabase Storage
   - Preview appears immediately

   **Option C: Custom URL**
   - Paste URL into "Or Enter Custom Cover URL" field
   - Preview updates when valid URL is entered

5. Review the preview
6. Save the book

### Editing an Existing Book
1. Navigate to **Admin → Books** and click edit on any book
2. Use any of the three methods above to update or add a cover
3. Click "Remove Cover" to clear the current cover
4. Save changes

### Tips for Best Results
- **Use ISBN when possible** - Provides most accurate auto-fetch results
- **Drag-and-drop is fastest** - For custom covers, just drag the image file
- **Check file size** - Keep uploads under 5MB
- **Preview before saving** - Always verify the cover looks correct
- **High quality images** - Upload at least 300x450px for best display
- **Use JPEG for photos** - Smaller file sizes, good for book covers

## Display Locations

### Admin View (`/admin/books`)
- Shows book covers as thumbnails in the list view
- Displays Library icon placeholder if no cover exists

### Student Library View (`/library`)
- Shows book covers as large header images on cards
- Makes the library more visually appealing and recognizable

## Technical Details

### Files Created
- **`lib/utils/book-cover.ts`** - Utility for fetching book metadata from Google Books API
- **`lib/utils/upload-book-cover.ts`** - Utility for uploading images to Supabase Storage
- **`components/books/book-cover-upload.tsx`** - Reusable cover management component
- **`supabase/migrations/00013_book_covers_storage.sql`** - Storage bucket and policies

### Files Modified
- **`app/(dashboard)/admin/books/new/page.tsx`** - Create book with cover management
- **`app/(dashboard)/admin/books/[id]/page.tsx`** - Edit book with cover management
- **`app/(dashboard)/library/page.tsx`** - Display covers in student library

### Database
- Uses existing `cover_image_url` field in the `books` table
- Stores URL as TEXT (can be Google Books URL, Storage URL, or custom URL)

### Storage
- **Bucket**: `book-covers` (public)
- **Path structure**: `covers/{timestamp}-{random}.{ext}`
- **Public access**: Yes (read-only for all users)
- **Upload permissions**: Authenticated users only
- **Max file size**: 5MB
- **Allowed formats**: JPEG, PNG, WebP, GIF

### APIs Used
- **Google Books API**: `https://www.googleapis.com/books/v1/volumes`
  - No API key required
  - Rate limits apply (sufficient for typical usage)
- **Supabase Storage API**: File uploads and public URL generation

### Error Handling
- Graceful fallback if book not found
- Clear error messages to user
- Manual URL entry always available as backup

## Setup Required

### Apply Storage Migration
Before using the upload feature, run the storage migration:
```bash
# Apply the migration to create book-covers bucket
# This should be done automatically on next deployment
# Or manually run: supabase migration up
```

### Verify Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Verify `book-covers` bucket exists
3. Check that it's marked as public
4. Verify RLS policies are active

## Future Enhancements (Optional)
- ✅ ~~File upload option for custom covers~~ (DONE!)
- Cache book metadata to reduce API calls
- Add support for alternative sources (Open Library API)
- Bulk import books with automatic cover fetching
- Image optimization on upload (resize, compress)
- CDN integration for faster delivery

## Troubleshooting

### Auto-Fetch Issues

**"Could not find book cover"**
- Try entering the ISBN if you haven't already
- Check spelling of title and author
- Try a shortened version of the title (without subtitles)
- Fall back to manual upload or custom URL

**Wrong book found**
- Include more specific information (edition, year)
- Use ISBN for exact matching
- Try manual upload instead

### Upload Issues

**"Invalid file type"**
- Only JPEG, PNG, WebP, and GIF are supported
- Check file extension matches actual file type

**"File too large"**
- Maximum size is 5MB
- Compress image before uploading
- Use JPEG format for smaller file sizes

**Upload fails or hangs**
- Check internet connection
- Verify Supabase Storage is configured
- Check browser console for detailed errors
- Try a smaller file

### Display Issues

**Cover not loading/showing**
- Wait a moment for upload to complete
- Refresh the page
- Check browser console for errors
- Verify image URL is publicly accessible

**Cover looks blurry**
- Upload higher resolution image (at least 300x450px)
- Use PNG for sharper images
- Avoid upscaling small images

## Security Notes
- Uploaded images stored securely in Supabase Storage
- Public read access (anyone can view)
- Only authenticated admins can upload
- File type and size validation prevents abuse
- No sensitive data is transmitted or stored
- URLs are validated for proper format

