# Deployment Guide: Feel it, Don't Think It

## Overview

This guide will walk you through deploying the complete affect assessment app with Firebase Functions, Firestore, and Gemini AI integration.

---

## Prerequisites

✅ Google Gemini API Key: `AIzaSyBhD7ZmVn-mWl2-Ic8fLla3N09edQuEsAY` (already configured)
✅ Firebase Project: `realness-score` (already created)
⏳ Firebase Authentication (need to re-login)

---

## Step 1: Re-authenticate with Firebase

Your Firebase credentials have expired. Run this command in your terminal:

```bash
firebase login --reauth
```

This will open a browser window for you to sign in with your Google account.

---

## Step 2: Download Firebase Service Account Key

For the population script to work, you need to download your service account key:

1. Go to [Firebase Console](https://console.firebase.google.com/project/realness-score/settings/serviceaccounts/adminsdk)
2. Click **"Generate New Private Key"**
3. Save the file as `serviceAccountKey.json` in the project root:
   ```
   /Users/danielcrowder/Desktop/Projects/Assessment/serviceAccountKey.json
   ```

⚠️ **Important:** Add this file to `.gitignore` (already configured) to keep your credentials secure.

---

## Step 3: Install Dependencies

### 3.1 Install Functions Dependencies

```bash
cd /Users/danielcrowder/Desktop/Projects/Assessment/functions
pnpm install
```

This installs:
- `firebase-functions` - Cloud Functions framework
- `firebase-admin` - Firestore admin SDK
- `@google/generative-ai` - Gemini API client
- `typescript` - TypeScript compiler

### 3.2 Install Scripts Dependencies

```bash
cd /Users/danielcrowder/Desktop/Projects/Assessment/scripts
pnpm install
```

This installs:
- `firebase-admin` - For Firestore population script

---

## Step 4: Deploy Firestore Rules

```bash
cd /Users/danielcrowder/Desktop/Projects/Assessment
firebase deploy --only firestore:rules
```

This sets up security rules for:
- `affectCombinations` - Public read, admin write
- `sessions` - Public create, admin read
- `generatedImages` - Public read, admin write

---

## Step 5: Populate Firestore with 504 Combinations

Run the population script to upload all affect combinations from the matrix:

```bash
cd /Users/danielcrowder/Desktop/Projects/Assessment/scripts
node populateFirestore.js
```

**Expected output:**
```
🔥 Starting Firestore population...

📖 Parsing matrix file...
✅ Found 504 combinations

📦 Uploading 2 batch(es)...

✅ Batch 1/2 uploaded (500/504 total)
✅ Batch 2/2 uploaded (504/504 total)

🎉 Successfully uploaded 504 affect combinations to Firestore!
```

**Verify in Firebase Console:**
1. Go to [Firestore Database](https://console.firebase.google.com/project/realness-score/firestore)
2. You should see `affectCombinations` collection with 504 documents
3. Sample document IDs: `CuJoSt`, `FeAnSa`, `JoCuDr`, etc.

---

## Step 6: Deploy Cloud Functions

```bash
cd /Users/danielcrowder/Desktop/Projects/Assessment
firebase deploy --only functions
```

This deploys 2 functions:
1. **detectIconAndPronouns** - Uses GEMINI_PROMPT_1 for icon selection
2. **personalizeApproach** - Uses GEMINI_PROMPT_2 for personalization

**Expected output:**
```
✔ functions[detectIconAndPronouns(us-central1)] Successful create operation.
✔ functions[personalizeApproach(us-central1)] Successful create operation.

✔ Deploy complete!

Function URLs:
  detectIconAndPronouns: https://us-central1-realness-score.cloudfunctions.net/detectIconAndPronouns
  personalizeApproach: https://us-central1-realness-score.cloudfunctions.net/personalizeApproach
```

---

## Step 7: Test the Functions

### Test 1: Icon Detection

```bash
firebase functions:shell
```

Then run:
```javascript
detectIconAndPronouns({ subject: "my mother" })
```

**Expected response:**
```json
{
  "icon": "user-heart",
  "pronouns": "she/her",
  "subjectType": "person"
}
```

### Test 2: Personalized Approach

```javascript
personalizeApproach({
  affects: ["Curiosity", "Joy", "Surprise–Startle"],
  subject: "my mother",
  pronouns: "she/her",
  subjectType": "person"
})
```

**Expected response:**
```json
{
  "casElement": "CuJoSt",
  "feeling": "exploratory radiant layered with startled depth",
  "approach": "Mirror your Curiosity about your relationship with your mother. Let Joy help you celebrate what you discover about her. But stay grounded—Surprise–Startle is there as a reminder of the real. Don't push it away, just let it sit.",
  "weather": "Bright, shifting skies with variable winds, interrupted by warm, golden sunshine, with a lingering trace of sudden flashes of lightning in a clear sky.",
  "musicGenre": "Synth Pop / Indie Pop",
  "spotifyQuery": "synth pop joyful discovery"
}
```

---

## Step 8: Create Public Directory

Move prototype.html to production structure:

```bash
cd /Users/danielcrowder/Desktop/Projects/Assessment
mkdir -p public
cp prototype.html public/index.html
cp -r "New RAG/default.png" public/
cp -r src/assets public/ # If you have existing assets
```

---

## Step 9: Deploy Hosting

```bash
firebase deploy --only hosting
```

**Expected output:**
```
✔ hosting[realness-score]: file upload complete

✔ Deploy complete!

Hosting URL: https://realness-score.web.app
```

---

## Troubleshooting

### Issue: "Authentication Error"
**Solution:** Run `firebase login --reauth` and sign in again

### Issue: "Combination not found in database"
**Solution:** Ensure you've run the population script (Step 5)

### Issue: "Invalid JSON response from AI"
**Solution:** Check Gemini API key is correct and you have API quota remaining

### Issue: Functions deployment fails
**Solution:**
1. Check Node version: `node --version` (should be 18 or higher)
2. Install dependencies: `cd functions && pnpm install`
3. Build TypeScript: `pnpm run build`

---

## Environment Variables Summary

### Hardcoded in functions/src/index.ts:
- **Gemini API Key:** `AIzaSyBhD7ZmVn-mWl2-Ic8fLla3N09edQuEsAY`

### Required files:
- **serviceAccountKey.json** - Download from Firebase Console

---

## Next Steps After Deployment

1. **Test the live app** at https://realness-score.web.app
2. **Monitor function logs:** `firebase functions:log`
3. **Check Firestore usage:** [Firebase Console](https://console.firebase.google.com/project/realness-score/usage)
4. **Build admin interface** (Step 10 - next task)

---

## Step 10: Build Admin Interface (Next)

The admin interface will let you:
- View and edit all 504 affect combinations
- Update Feeling, Approach, Weather, Music Genre, Image Prompts
- Import/export CSV
- Preview changes before saving

This will be built as `public/admin.html` with Firebase Authentication for security.

---

## Cost Monitoring

**Firebase Free Tier Limits:**
- Firestore: 50K reads/day, 20K writes/day
- Functions: 2M invocations/month
- Hosting: 10GB storage, 360MB/day transfer

**Gemini API Costs:**
- ~$0.0003 per user session (2 API calls)
- Monitor usage at: https://aistudio.google.com/

**Current Status:**
- 504 documents in Firestore
- 2 Cloud Functions deployed
- Estimated cost: <$1/month for 1000 users

---

## Quick Command Reference

```bash
# Re-authenticate
firebase login --reauth

# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only functions
firebase deploy --only hosting

# View logs
firebase functions:log

# Test locally
firebase emulators:start

# Populate Firestore
cd scripts && node populateFirestore.js
```

---

## File Structure

```
Assessment/
├── functions/
│   ├── src/
│   │   └── index.ts          # Cloud Functions (2 Gemini integrations)
│   ├── package.json
│   └── tsconfig.json
├── scripts/
│   ├── populateFirestore.js  # Firestore population script
│   └── package.json
├── public/
│   ├── index.html            # Production app (converted from prototype)
│   ├── default.png           # Placeholder image
│   └── admin.html            # Admin interface (to be built)
├── New RAG/
│   ├── top3_affect_matrix.md # Source data (504 combinations)
│   ├── GEMINI_PROMPT_1_ICON_PRONOUN.md
│   ├── GEMINI_PROMPT_2_RESULTS.md
│   └── GEMINI_PROMPT_3_IMAGE.md
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── .firebaserc
├── serviceAccountKey.json    # (Download from Firebase Console)
├── IMPLEMENTATION_PLAN.md
├── ARCHITECTURE_SUMMARY.md
└── DEPLOYMENT_GUIDE.md       # This file
```

---

## Support

If you encounter issues during deployment:
1. Check the Firebase Console for error messages
2. Review function logs: `firebase functions:log`
3. Verify Firestore has 504 documents in `affectCombinations`
4. Test functions locally: `firebase emulators:start`

---

Ready to deploy? Start with **Step 1: Re-authenticate** and work through each step in order.
