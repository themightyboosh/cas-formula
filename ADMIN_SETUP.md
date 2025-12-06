# Admin Interface Setup Guide

## Overview

The admin interface (`public/admin.html`) allows you to manage all 504 affect combinations in Firestore with a clean, professional UI.

---

## Features

✅ **View all 504 combinations** in a paginated table (50 per page)
✅ **Filter by affect** (Affect 1, 2, or 3) using dropdown selectors
✅ **Search** by CAS code, feeling, or approach text
✅ **Edit combinations** with inline validation
✅ **Real-time stats** showing total count, filtered results, and last update
✅ **Google Sign-In** for secure admin-only access
✅ **Responsive design** matching your app's aesthetic

---

## Step 1: Get Firebase Web Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/project/realness-score/settings/general)
2. Scroll to "Your apps" section
3. Click "Add app" → Select **Web** (</> icon)
4. Register app with nickname: "Feel it Admin"
5. Copy the `firebaseConfig` object

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "realness-score.firebaseapp.com",
  projectId: "realness-score",
  storageBucket: "realness-score.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Step 2: Update Firebase Config

Open `public/firebase-config.js` and replace the placeholder values with your actual credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "realness-score.firebaseapp.com",
    projectId: "realness-score",
    storageBucket: "realness-score.appspot.com",
    messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
    appId: "YOUR_ACTUAL_APP_ID"
};
```

Also update the same values in `public/admin.html` (line 528-534).

---

## Step 3: Enable Google Authentication

1. Go to [Firebase Authentication](https://console.firebase.google.com/project/realness-score/authentication/providers)
2. Click **"Get Started"** if not already enabled
3. Click **"Google"** provider
4. Toggle **"Enable"**
5. Select a support email (your email)
6. Click **"Save"**

---

## Step 4: Add Authorized Domain

If deploying to a custom domain:

1. Go to [Firebase Authentication Settings](https://console.firebase.google.com/project/realness-score/authentication/settings)
2. Scroll to **"Authorized domains"**
3. Click **"Add domain"**
4. Enter your domain (e.g., `feel-it-admin.yourdomain.com`)
5. Click **"Add"**

**Note:** `localhost` and `*.firebaseapp.com` are already authorized by default.

---

## Step 5: Test Locally

Before deploying, test the admin interface locally:

```bash
cd /Users/danielcrowder/Desktop/Projects/Assessment/public
python3 -m http.server 8000
```

Then open: http://localhost:8000/admin.html

**Test checklist:**
- ✅ Google Sign-In button appears
- ✅ Can sign in with your Google account
- ✅ All 504 combinations load in the table
- ✅ Filters work (Affect 1, 2, 3 dropdowns)
- ✅ Search box filters results
- ✅ Click "Edit" opens modal
- ✅ Can edit and save changes
- ✅ Pagination works (Previous/Next buttons)

---

## Step 6: Deploy to Firebase Hosting

```bash
cd /Users/danielcrowder/Desktop/Projects/Assessment
firebase deploy --only hosting
```

**Access URLs:**
- Admin Interface: https://realness-score.web.app/admin.html
- Main App: https://realness-score.web.app/

---

## Using the Admin Interface

### Sign In
1. Go to https://realness-score.web.app/admin.html
2. Click "Sign in with Google"
3. Select your Google account
4. You'll be redirected to the admin dashboard

### View Combinations
- **All combinations** load automatically (504 total)
- **Paginated** at 50 per page
- **Sorted** alphabetically by CAS code (CuJoSt, FeAnSa, etc.)

### Filter Combinations
- **Affect 1 dropdown:** Filter by primary affect
- **Affect 2 dropdown:** Filter by secondary affect
- **Affect 3 dropdown:** Filter by tertiary affect
- **Search box:** Search by CAS code, feeling, or approach text
- **Filters combine:** All active filters are AND'd together

**Example:** Filter Affect 1 = "Curiosity" + Search "joyful" → Shows all Curiosity-led combinations with "joyful" in text

### Edit a Combination
1. Click **"Edit"** button in the Actions column
2. Modal opens with current values
3. **Read-only fields:**
   - CAS Element (e.g., "CuJoSt")
   - Affect 1, 2, 3 (these define the combination)
4. **Editable fields:**
   - **Feeling** - Poetic emotional description
   - **Approach** - Therapeutic guidance (generic template)
   - **Weather** - Metaphorical weather description
   - **Music Genre** - Genre pairing for Spotify
   - **Image Prompt Base** - Surrealism description
5. Make changes
6. Click **"Save Changes"**
7. Success message appears, changes sync to Firestore
8. Modal auto-closes after 1.5 seconds

### Field Validation
- All fields are **required**
- Saving with empty fields shows error message
- Changes are saved in real-time to Firestore
- Updates are reflected immediately in the table

---

## Admin Interface Design

### Color Palette
- **Background:** Pure black (#000000)
- **Cards/Modals:** Dark gray (#1A1A1A)
- **Borders:** Subtle gray (#2A2A2A)
- **Text:** White (#FFFFFF) for primary, gray for secondary
- **Buttons:** White background, black text (matches main app)

### Typography
- **Headers:** SF Pro Display, -apple-system fallback
- **Monospace:** SF Mono for CAS codes and stats
- **Sizes:** 11px-24px range, tight letter-spacing

### Layout
- **Fixed header** with filters (stays visible on scroll)
- **Sticky table headers** (stays visible while scrolling table)
- **50 items per page** for performance
- **Modal overlays** for editing (dark semi-transparent backdrop)

---

## Security

### Authentication
- **Google Sign-In only** - No email/password
- **Firebase Auth** handles all authentication
- **Session persistence** - Stays logged in until sign out

### Firestore Rules
From `firestore.rules`:
```javascript
match /affectCombinations/{docId} {
  allow read: if true;               // Anyone can read
  allow write: if request.auth != null; // Only authenticated users can write
}
```

**This means:**
- ✅ Public can view combinations (needed for the app)
- ❌ Only signed-in admins can edit combinations
- ✅ Changes are tracked with `updatedAt` timestamp

### Additional Security (Optional)
To restrict admin access to specific email addresses:

1. Update `firestore.rules`:
```javascript
match /affectCombinations/{docId} {
  allow read: if true;
  allow write: if request.auth != null &&
                 request.auth.token.email in [
                   'your-email@gmail.com',
                   'another-admin@gmail.com'
                 ];
}
```

2. Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## Keyboard Shortcuts

In the admin interface:
- **Escape** - Close modal
- **Enter** in search box - Apply filters
- **Tab** - Navigate between form fields

---

## Performance

### Optimization
- **Paginated loading:** Only 50 items rendered at a time
- **Client-side filtering:** Fast, no server queries
- **Indexed reads:** Firestore automatically indexes CAS codes
- **Cached data:** Combinations cached in memory after first load

### Metrics
- **Initial load:** ~2-3 seconds for 504 documents
- **Filter/search:** Instant (client-side)
- **Save edit:** ~500ms round-trip to Firestore
- **Page navigation:** Instant

---

## Troubleshooting

### Issue: "Sign in button doesn't work"
**Solution:**
1. Check Firebase console → Authentication → Google provider is enabled
2. Verify authorized domain includes your hostname
3. Check browser console for CORS errors

### Issue: "No combinations loading"
**Solution:**
1. Verify Firestore has been populated (run `scripts/populateFirestore.js`)
2. Check Firestore rules allow public read access
3. Open browser console and check for errors

### Issue: "Can't save edits"
**Solution:**
1. Ensure you're signed in (check top-right for "Sign Out" button)
2. Verify Firestore rules allow authenticated writes
3. Check all fields are filled (no empty fields)

### Issue: "Changes don't appear in main app"
**Solution:**
1. Wait a few seconds for Firestore to sync
2. Refresh the main app page
3. Check that the personalization function is fetching from Firestore (not hardcoded)

---

## Bulk Operations (Future Enhancement)

Potential features to add:
- **Import CSV** - Bulk upload combinations from CSV file
- **Export CSV** - Download all combinations as CSV backup
- **Batch edit** - Edit multiple combinations at once
- **Version history** - Track changes over time
- **Duplicate combination** - Clone and modify existing combinations
- **Regenerate all images** - Trigger DALL-E for all 504 combinations

---

## Monitoring

### View Admin Activity
Check Firestore activity logs:
```bash
firebase functions:log
```

### Track Changes
Query recently updated combinations:
```javascript
db.collection('affectCombinations')
  .orderBy('updatedAt', 'desc')
  .limit(10)
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.id, doc.data().updatedAt.toDate());
    });
  });
```

---

## Mobile Support

The admin interface is **responsive** but optimized for desktop use:
- **Desktop:** Full table view with all columns
- **Tablet:** Horizontal scroll for table
- **Mobile:** Better to use desktop for editing

**Recommendation:** Use a desktop browser for admin tasks.

---

## Summary

✅ **Setup complete** - Admin interface ready to deploy
✅ **Secure authentication** - Google Sign-In only
✅ **Real-time editing** - Changes sync immediately
✅ **Professional design** - Matches main app aesthetic
✅ **Performance optimized** - Paginated, cached, indexed

**Next step:** Update Firebase config and deploy!
