# PWA Icon Setup Instructions

## Required Icon Files

Place the following icon files in the `public/` folder:

### 1. Main Logo (for Header)
- **File:** `public/logo.png`
- **Size:** 32x32px to 64x64px (will be scaled to 32x32 in header)
- **Format:** PNG with transparency
- **Usage:** Displayed in the header navigation

### 2. PWA Icons (for App Installation)

#### Apple Touch Icon (iOS)
- **File:** `public/apple-touch-icon.png`
- **Size:** 180x180px (required for iOS)
- **Format:** PNG
- **Usage:** Icon shown when adding to iPhone/iPad home screen

#### Android/Web Icons
- **File:** `public/icon-192x192.png`
- **Size:** 192x192px
- **Format:** PNG
- **Usage:** Standard Android and web PWA icon

- **File:** `public/icon-512x512.png`
- **Size:** 512x512px
- **Format:** PNG
- **Usage:** High-resolution icon for Android and web

## How to Generate Icons from Your Logo

If you have the logo image from Gemini, you can:

1. **Use an online tool** like:
   - [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [App Icon Generator](https://www.appicon.co/)

2. **Or manually resize** using image editing software:
   - Open your logo image
   - Resize to each required size
   - Save as PNG files with the exact names listed above

## Icon Requirements

- **Square format** (1:1 aspect ratio)
- **No rounded corners** (iOS will add them automatically)
- **High quality** - sharp and clear at all sizes
- **Good contrast** - should be visible on both light and dark backgrounds
- **Centered design** - important elements should be in the center (iOS may crop edges)

## Testing

After adding the icons:

1. **iOS (iPhone/iPad):**
   - Open the app in Safari
   - Tap the Share button
   - Select "Add to Home Screen"
   - Verify the icon appears correctly

2. **Android:**
   - Open the app in Chrome
   - Tap the menu (three dots)
   - Select "Add to Home screen" or "Install app"
   - Verify the icon appears correctly

3. **Header Logo:**
   - Check that the logo appears in the header navigation
   - Should be visible on all pages

## Current Setup

The following files are already configured:
- ✅ `public/manifest.json` - PWA manifest with icon references
- ✅ `app/layout.tsx` - Meta tags for iOS and PWA
- ✅ `components/Header.tsx` - Logo image component

You just need to add the actual icon files to the `public/` folder!

