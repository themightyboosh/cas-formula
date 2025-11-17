# Fix Firebase Hosting 404 Error

## Error
```
HTTP Error: 404, Requested entity was not found
```

This means Firebase Hosting isn't enabled for your project yet.

## Solution: Enable Hosting via Firebase Console

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/project/realness-score/hosting
2. Click "Get started" or "Add site"
3. Enter site ID: `realness-score`
4. Click "Create site"

### Step 2: After Site is Created
Once the site is created in the console, you can:

**Option A: Continue with CLI**
- At the current prompt, type: `realness-score` again
- It should work now that the site exists

**Option B: Skip the prompt**
- Press Ctrl+C to cancel
- Run: `firebase deploy --only hosting`
- It should use the site from firebase.json

### Alternative: Use Default Site
If you want to use the default site instead:
- At the prompt, type: `realness-score-default` (or whatever default name Firebase suggests)
- Or check what sites exist: Go to Firebase Console → Hosting

## Quick Fix

1. **Enable Hosting in Console:**
   - Visit: https://console.firebase.google.com/project/realness-score/hosting
   - Click "Get started"
   - Create site: `realness-score`

2. **Then deploy:**
   ```bash
   firebase deploy --only hosting
   ```

The site needs to exist in Firebase Console before the CLI can use it.

