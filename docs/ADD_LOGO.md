# Adding Your Logo

## Quick Steps:

1. **Save your logo image** as `logo.png` (or `logo.svg` for better quality)

2. **Place it in the public folder**:
   ```
   /Users/treveryarrish/Projects/Cohort/public/logo.png
   ```

3. **That's it!** The homepage will automatically display it.

---

## Alternative: If you have a different file format

If your logo is a `.jpg`, `.svg`, or other format:

1. Save it as: `public/logo.svg` (or `.jpg`)

2. Update `app/page.tsx` line 24:
   ```tsx
   // Change from:
   src="/logo.png"
   
   // To:
   src="/logo.svg"  // or whatever your format is
   ```

---

## Best Practices:

- **PNG format**: Best for the badge design with transparency
- **Recommended size**: 400x400 pixels or larger
- **Transparent background**: Make the badge stand out

---

## Current Setup:

The homepage now expects your logo at:
```
public/logo.png
```

If the file isn't found, you'll see a broken image icon, but the rest of the page will work fine.

---

## To Add Logo Now:

### Option 1: Drag and Drop (Easiest)
1. Open Finder
2. Navigate to: `/Users/treveryarrish/Projects/Cohort/public/`
3. Drag your logo file into that folder
4. Rename it to `logo.png`
5. Refresh your browser

### Option 2: Using Terminal
```bash
# If your logo is on your Desktop:
cp ~/Desktop/rogue-logo.png /Users/treveryarrish/Projects/Cohort/public/logo.png

# Refresh browser - logo will appear!
```

---

The page is already set up to display your logo beautifully with:
- Drop shadow for depth
- Responsive sizing (40 units tall)
- Centered positioning
- Professional presentation

