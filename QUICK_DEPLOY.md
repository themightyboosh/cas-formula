# Quick Deploy Guide

## All Configurations Ready!

✅ **Firebase Config:** Saved in `public/config.js`
✅ **Spotify API Key:** `7810f1b2743e4650bd0d354f6d5abcd5`
✅ **Gemini API Key:** Already embedded in Cloud Functions
✅ **504 Combinations:** Already in Firestore

---

## Current Status

### ✅ What's Working:
- Frontend live at: https://realness-score.web.app
- Cloud Functions deployed (Gemini AI ready)
- Firestore populated with 504 combinations
- Admin interface ready at: https://realness-score.web.app/admin.html

### ⚠️ What Needs Integration:
The frontend is still showing **hardcoded prototype data**. To enable AI features:

1. Add Firebase SDK scripts to `public/index.html`
2. Load `config.js` for Firebase credentials
3. Replace hardcoded data with Cloud Function calls
4. Add Spotify integration for music

---

## Option 1: Quick Test (Current Prototype)

The app is live and functional with hardcoded data:
- Visit: https://realness-score.web.app
- All screens work
- Updated copy and bodily signatures are live
- Uses example data (CuJoSt combination)

**This is perfect for:**
- Testing UI/UX
- Showing stakeholders
- Validating design decisions

---

## Option 2: Full AI Integration

To enable real-time AI features, follow these steps:

### Step 1: Update index.html to load Firebase

Add these scripts before the closing `</body>` tag in `public/index.html`:

```html
<!-- Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-functions-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>

<!-- Load configuration -->
<script src="config.js"></script>

<script>
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const functions = firebase.functions();
const db = firebase.firestore();
</script>
```

### Step 2: Replace Icon Detection (Screen 2)

Find the `validateAndContinue()` function and replace with:

```javascript
async function validateAndContinue() {
    const input = document.getElementById('subjectInput').value.trim();
    if (input.length < 2) {
        alert('Please enter what you want to understand.');
        return;
    }

    // Show loading
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Analyzing...';
    btn.disabled = true;

    try {
        // Call Cloud Function
        const detectIcon = functions.httpsCallable('detectIconAndPronouns');
        const result = await detectIcon({ subject: input });

        // Store results
        state.subject = input;
        state.detectedIcon = result.data.icon;
        state.detectedPronouns = result.data.pronouns;
        state.detectedSubjectType = result.data.subjectType;

        document.getElementById('sortSubjectInline').textContent = state.subject;
        goToScreen(3);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to analyze. Please try again.');
        btn.textContent = originalText;
        btn.disabled = false;
    }
}
```

### Step 3: Replace Results Generation (Screen 4)

Find the `goToResults()` function and replace with:

```javascript
async function goToResults() {
    goToScreen(4);

    // Show loading
    document.getElementById('feeling').textContent = 'Loading...';
    document.getElementById('approach').textContent = 'Generating personalized insights...';

    try {
        // Get top 3 affects
        const top3 = state.affectRanking.slice(0, 3).map(a => a.name);

        // Call Cloud Function
        const personalize = functions.httpsCallable('personalizeApproach');
        const result = await personalize({
            affects: top3,
            subject: state.subject,
            pronouns: state.detectedPronouns || 'it',
            subjectType: state.detectedSubjectType || 'thing'
        });

        // Update UI
        const data = result.data;
        document.getElementById('casElement').textContent = data.casElement;
        document.getElementById('feeling').textContent = data.feeling;
        document.getElementById('approach').textContent = data.approach;
        document.getElementById('resultsSubject').textContent = state.subject;

        // Store Spotify query
        state.spotifyQuery = data.spotifyQuery;

        // Load image (if cached)
        loadResultImage(data.casElement);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('approach').textContent = 'Failed to generate results. Please try again.';
    }
}

async function loadResultImage(casElement) {
    const resultImage = document.getElementById('resultImage');
    resultImage.src = 'default.png';
    resultImage.classList.add('loaded');

    try {
        const imageDoc = await db.collection('generatedImages').doc(casElement).get();
        if (imageDoc.exists) {
            resultImage.src = imageDoc.data().imageUrl;
        }
    } catch (error) {
        console.log('No cached image');
    }
}
```

### Step 4: Add Spotify Integration

Add this function for music:

```javascript
function openSpotifySearch() {
    const query = state.spotifyQuery || 'ambient relaxing';
    const url = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
    window.open(url, '_blank');
}

// Add event listener to music button
// (Find the music button in the HTML and add: onclick="openSpotifySearch()")
```

### Step 5: Deploy Updated Frontend

```bash
firebase deploy --only hosting
```

---

## Option 3: Use Admin Interface

The admin interface is ready to use:

### Step 1: Update admin.html config

Replace the firebaseConfig in `public/admin.html` (line ~528) with:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyB29fRL5UdQodkzCDaKM8Ro7dtXpAf-Uro",
    authDomain: "realness-score.firebaseapp.com",
    projectId: "realness-score",
    storageBucket: "realness-score.firebasestorage.app",
    messagingSenderId: "427953838028",
    appId: "1:427953838028:web:a0461e5b115d7e2835af69"
};
```

### Step 2: Enable Google Auth

Already done! Google Sign-In is enabled in Firebase Console.

### Step 3: Deploy and Access

```bash
firebase deploy --only hosting
```

Then visit: https://realness-score.web.app/admin.html

---

## Firebase Project Details

**Project ID:** realness-score
**Web App ID:** 1:427953838028:web:a0461e5b115d7e2835af69

**API Keys:**
- Firebase: `AIzaSyB29fRL5UdQodkzCDaKM8Ro7dtXpAf-Uro`
- Gemini: `AIzaSyBhD7ZmVn-mWl2-Ic8fLla3N09edQuEsAY` (in functions)
- Spotify: `7810f1b2743e4650bd0d354f6d5abcd5`

---

## Cloud Functions URLs

Your functions are deployed at:
- `detectIconAndPronouns`: https://us-central1-realness-score.cloudfunctions.net/detectIconAndPronouns
- `personalizeApproach`: https://us-central1-realness-score.cloudfunctions.net/personalizeApproach

---

## Testing Cloud Functions

### Test Icon Detection:

```bash
curl -X POST \
  https://us-central1-realness-score.cloudfunctions.net/detectIconAndPronouns \
  -H "Content-Type: application/json" \
  -d '{"data": {"subject": "my mother"}}'
```

Expected response:
```json
{
  "result": {
    "icon": "user-heart",
    "pronouns": "she/her",
    "subjectType": "person"
  }
}
```

### Test Personalization:

```bash
curl -X POST \
  https://us-central1-realness-score.cloudfunctions.net/personalizeApproach \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "affects": ["Curiosity", "Joy", "Surprise–Startle"],
      "subject": "my mother",
      "pronouns": "she/her",
      "subjectType": "person"
    }
  }'
```

---

## Summary

### What You Have Right Now:

✅ **Prototype live** with all copy updates
✅ **Cloud Functions deployed** and working
✅ **Firestore populated** with 504 combinations
✅ **Admin interface** ready to use
✅ **All API keys** configured

### Choose Your Path:

**Path A (Recommended for now):**
- Use the prototype as-is for testing/demos
- It works perfectly with hardcoded data
- No code changes needed

**Path B (For full production):**
- Follow Option 2 above to integrate API calls
- Takes ~30 minutes of careful code editing
- Follow PRODUCTION_INTEGRATION.md for detailed guide

**Path C (Manage content):**
- Use admin interface to edit 504 combinations
- Update admin.html config and deploy
- Sign in with Google to manage content

---

## Quick Commands

```bash
# Deploy frontend updates
firebase deploy --only hosting

# Deploy function updates
firebase deploy --only functions

# Deploy everything
firebase deploy

# View logs
firebase functions:log

# Test locally
cd public && python3 -m http.server 8000
```

---

**Your app is live and functional!** 🎉

The prototype works great for demos. When you're ready for full AI integration, follow Option 2 or the detailed PRODUCTION_INTEGRATION.md guide.
