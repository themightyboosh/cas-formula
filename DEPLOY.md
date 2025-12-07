# Deployment Instructions

## What's Ready to Deploy

All code has been updated and committed to git. Here's what's changed:

### 1. Firebase Updates
- **firebase-functions**: 4.9.0 → 7.0.1
- **firebase-admin**: 12.7.0 → 13.6.0
- **Client SDK**: 10.7.x → 10.14.1
- Fixed compatibility issues with v1 API

### 2. New Features
- **AI Prompts Tab** in admin panel - displays both system prompts for transparency
- **Icon validation fixes** - removed unsupported Lucide icons
- **Paragraph spacing** - improved approach text formatting with tight line-height

### 3. UI Improvements
- Line-height: 1.8 → 1.3 (tighter, normal leading)
- Each sentence as discrete paragraph with proper spacing
- Additional `<br>` between paragraphs for visual separation

## How to Deploy

### Step 1: Re-authenticate with Firebase
```bash
firebase login --reauth
```
This will open a browser window for you to sign in with Google.

### Step 2: Deploy Everything
```bash
# Deploy all changes (recommended)
firebase deploy

# Or deploy specific parts:
firebase deploy --only functions
firebase deploy --only hosting
```

### Step 3: Test the Admin Panel
1. Go to: https://realness-score.web.app/admin.html
2. Sign in with authorized Google account:
   - daniel@monumental-i.com
   - scottconkrightdcatlanta@gmail.com
3. Test the new "AI Prompts" tab
4. Download CSV if needed

## Troubleshooting

### Admin Panel Login Issues

If you can't log in to admin panel:

1. **Hard refresh** the page (Cmd+Shift+R or Ctrl+Shift+R)
2. Check browser console (F12) for errors
3. Verify Google Sign-In is enabled in Firebase Console:
   - Go to: https://console.firebase.google.com/project/realness-score/authentication
   - Authentication → Sign-in providers → Google → Enabled

### Firebase Authentication Expired

If you see "Authentication Error: Your credentials are no longer valid":
```bash
firebase login --reauth
```

### Build Errors

If you need to rebuild functions:
```bash
cd functions
pnpm run build
```

## What's New

### AI Prompts Tab (Admin Panel)
- View the exact prompts used for icon detection and approach personalization
- Transparent display of AI behavior
- Accessible via new "AI Prompts" tab
- Fetches from new `getPrompts()` Cloud Function

### Icon Validation Fixes
- Removed: tree, landmark, navigation, timer, megaphone, puzzle, alert-triangle, meh
- Total: 47 verified Lucide icons
- No more console warnings about missing icons

### Paragraph Formatting
- Tight line-height (1.3) for readability
- Each sentence as own paragraph
- Extra spacing between sentences
- Better visual hierarchy

## Files Changed

### Cloud Functions
- `functions/src/index.ts` - Updated API, added getPrompts()
- `functions/package.json` - Updated dependencies

### Frontend
- `public/index.html` - Updated Firebase SDK, paragraph formatting
- `public/admin.html` - Updated Firebase SDK, added AI Prompts tab

### Configuration
- All changes committed to git
- Ready to deploy with `firebase deploy`

## Next Steps

1. Run `firebase login --reauth`
2. Run `firebase deploy`
3. Test at https://realness-score.web.app
4. Verify admin panel at https://realness-score.web.app/admin.html
5. Download CSV from admin panel if needed

---

*Generated: 2025-12-07*
*Firebase Project: realness-score*
