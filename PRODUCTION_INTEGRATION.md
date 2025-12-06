# Production Integration Guide

## Overview

This guide explains how to integrate Firebase Functions (Gemini API calls) into your production app (`public/index.html`).

The prototype has hardcoded data. Production will call Cloud Functions to get real-time AI responses.

---

## Files Ready

✅ **`public/index.html`** - Copy of prototype.html (needs integration)
✅ **`public/default.png`** - Placeholder image (already copied)
✅ **`functions/src/index.ts`** - 2 Cloud Functions ready to deploy
✅ **Firebase config** - Needs to be added to index.html

---

## Integration Steps

### Step 1: Add Firebase SDKs to index.html

Find the closing `</body>` tag in `public/index.html` and add the Firebase SDKs **before** the existing `<script>` block:

```html
<!-- Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-functions-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>

<script>
// Initialize Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "realness-score.firebaseapp.com",
    projectId: "realness-score",
    storageBucket: "realness-score.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const functions = firebase.functions();
const db = firebase.firestore();

// For local testing with emulator (optional)
// functions.useEmulator('localhost', 5001);
</script>

<!-- Existing prototype script -->
<script>
    // ... existing code ...
</script>
```

---

### Step 2: Replace Screen 2 Icon Detection

In the prototype, find the `goToSortScreen()` function (around line 1800) that currently shows a placeholder icon.

**Original prototype code:**
```javascript
function goToSortScreen() {
    const subject = document.getElementById('subjectInput').value.trim();
    if (!subject) {
        alert('Please enter something to understand.');
        return;
    }

    currentSubject = subject;

    // Show placeholder icon (prototype)
    const iconElement = document.querySelector('.subject-icon-display svg');
    if (iconElement) {
        iconElement.innerHTML = '<circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="2"/>';
    }

    showScreen('sortScreen');
}
```

**Replace with production code:**
```javascript
async function goToSortScreen() {
    const subject = document.getElementById('subjectInput').value.trim();
    if (!subject) {
        alert('Please enter something to understand.');
        return;
    }

    currentSubject = subject;

    // Show loading state
    const nextButton = document.querySelector('#whatScreen button');
    const originalText = nextButton.textContent;
    nextButton.textContent = 'Analyzing...';
    nextButton.disabled = true;

    try {
        // Call Cloud Function 1: detectIconAndPronouns
        const detectIcon = functions.httpsCallable('detectIconAndPronouns');
        const result = await detectIcon({ subject });

        // Store detected data
        window.detectedIcon = result.data.icon;
        window.detectedPronouns = result.data.pronouns;
        window.detectedSubjectType = result.data.subjectType;

        // Update icon display on Sort screen
        updateSubjectIcon(result.data.icon);

        // Move to sort screen
        showScreen('sortScreen');
    } catch (error) {
        console.error('Error detecting icon:', error);
        alert('Failed to analyze subject. Please try again.');
        nextButton.textContent = originalText;
        nextButton.disabled = false;
    }
}

// Helper function to update icon
function updateSubjectIcon(iconName) {
    const iconElement = document.querySelector('.subject-icon-display svg');
    if (iconElement) {
        // Map Lucide icon names to SVG paths
        // For simplicity, show a placeholder circle for now
        // In production, use Lucide icon library or implement icon mapping
        iconElement.innerHTML = `
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                  fill="currentColor"/>
        `;
        console.log('Detected icon:', iconName); // For debugging
    }
}
```

---

### Step 3: Replace Results Generation

Find the function that generates results (around line 2100). This currently uses hardcoded data.

**Original prototype code:**
```javascript
function showResultsScreen() {
    // Hardcoded example data
    const casElement = 'CuJoSt';
    const feeling = 'exploratory radiant layered with startled depth';
    const approach = 'Mirror your Curiosity about the world...';
    const weather = 'Bright, shifting skies...';
    const musicGenre = 'Synth Pop / Indie Pop';

    document.getElementById('casElement').textContent = casElement;
    document.getElementById('feeling').textContent = feeling;
    document.getElementById('approach').textContent = approach;
    document.getElementById('weather').textContent = weather;
    document.getElementById('musicGenre').textContent = musicGenre;

    showScreen('resultsScreen');
}
```

**Replace with production code:**
```javascript
async function showResultsScreen() {
    // Show loading state
    showScreen('resultsScreen');

    const casElement = document.getElementById('casElement');
    const feeling = document.getElementById('feeling');
    const approach = document.getElementById('approach');
    const weather = document.getElementById('weather');
    const musicGenre = document.getElementById('musicGenre');

    // Show loading placeholders
    casElement.textContent = '...';
    feeling.textContent = 'Loading...';
    approach.textContent = 'Generating personalized insights...';

    try {
        // Get top 3 affects from sorted list
        const top3Affects = sortedAffects.slice(0, 3).map(a => a.name);

        // Call Cloud Function 2: personalizeApproach
        const personalize = functions.httpsCallable('personalizeApproach');
        const result = await personalize({
            affects: top3Affects,
            subject: currentSubject,
            pronouns: window.detectedPronouns || 'it',
            subjectType: window.detectedSubjectType || 'thing'
        });

        // Update UI with results
        const data = result.data;
        casElement.textContent = data.casElement;
        feeling.textContent = data.feeling;
        approach.textContent = data.approach;
        weather.textContent = data.weather;
        musicGenre.textContent = data.musicGenre;

        // Store Spotify query for music button
        window.spotifyQuery = data.spotifyQuery;

        // Load image (async, non-blocking)
        loadResultImage(data.casElement);
    } catch (error) {
        console.error('Error generating results:', error);
        approach.textContent = 'Failed to generate results. Please try again.';
    }
}

// Image loading function (async)
async function loadResultImage(casElement) {
    const resultImage = document.getElementById('resultImage');

    // Show placeholder immediately
    resultImage.src = 'default.png';
    resultImage.classList.add('loaded');

    try {
        // Check if image exists in Firestore cache
        const imageDoc = await db.collection('generatedImages').doc(casElement).get();

        if (imageDoc.exists) {
            const imageUrl = imageDoc.data().imageUrl;
            resultImage.src = imageUrl;
        } else {
            // Image not generated yet - use placeholder
            console.log('No cached image for', casElement);
        }
    } catch (error) {
        console.error('Error loading image:', error);
        // Keep placeholder on error
    }
}
```

---

### Step 4: Add Spotify Integration (Optional)

Find the music button click handler and update it to use the Spotify query:

**Add this function:**
```javascript
function openSpotifySearch() {
    const query = window.spotifyQuery || 'ambient electronic';
    const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
    window.open(spotifyUrl, '_blank');
}
```

**Update the music button:**
```javascript
document.getElementById('musicButton').addEventListener('click', openSpotifySearch);
```

---

### Step 5: Update Lucide Icon Display (Optional Enhancement)

To show actual Lucide icons instead of placeholders, add the Lucide icon library:

**In the `<head>` section:**
```html
<script src="https://unpkg.com/lucide@latest"></script>
```

**Update the icon display function:**
```javascript
function updateSubjectIcon(iconName) {
    const iconContainer = document.querySelector('.subject-icon-display');
    if (iconContainer) {
        // Clear existing icon
        iconContainer.innerHTML = '';

        // Create Lucide icon element
        const icon = document.createElement('i');
        icon.setAttribute('data-lucide', iconName);
        icon.style.width = '48px';
        icon.style.height = '48px';
        icon.style.strokeWidth = '1.5';

        iconContainer.appendChild(icon);

        // Initialize Lucide icons
        lucide.createIcons();
    }
}
```

---

## Testing Checklist

### Local Testing with Firebase Emulator

1. **Start emulator:**
```bash
firebase emulators:start
```

2. **Update index.html to use emulator:**
```javascript
// After firebase.initializeApp(firebaseConfig)
functions.useEmulator('localhost', 5001);
```

3. **Test flow:**
- ✅ Screen 1: Intro loads
- ✅ Screen 2: Enter subject → Icon detected
- ✅ Screen 3: Sort affects → Valence score calculates
- ✅ Screen 4: Results generate with personalized approach
- ✅ Placeholder image loads
- ✅ Music button opens Spotify search

### Production Testing

1. **Deploy everything:**
```bash
firebase deploy
```

2. **Open app:**
```
https://realness-score.web.app
```

3. **Test with real subjects:**
- ✅ "my mother" → user-heart icon, she/her pronouns
- ✅ "my job" → briefcase icon, it pronoun
- ✅ "moving to Seattle" → plane icon, it pronoun
- ✅ "my anxiety" → cloud icon, it pronoun

---

## Error Handling

### Graceful Fallbacks

**If icon detection fails:**
```javascript
try {
    const result = await detectIcon({ subject });
    // ... success
} catch (error) {
    console.error('Icon detection failed:', error);
    // Use default icon
    window.detectedIcon = 'help-circle';
    window.detectedPronouns = 'it';
    window.detectedSubjectType = 'thing';
    updateSubjectIcon('help-circle');
    showScreen('sortScreen');
}
```

**If personalization fails:**
```javascript
try {
    const result = await personalize({ ... });
    // ... success
} catch (error) {
    console.error('Personalization failed:', error);
    // Show generic message
    approach.textContent = 'Unable to generate personalized insights at this time. Please try again.';
    // Optionally allow retry
    document.getElementById('retryButton').classList.remove('hidden');
}
```

---

## Performance Optimization

### Caching Strategy

**1. Cache detected icons:**
```javascript
// Store in sessionStorage to avoid re-detecting on back navigation
sessionStorage.setItem(`icon_${subject}`, JSON.stringify(result.data));

// Check cache first
const cached = sessionStorage.getItem(`icon_${subject}`);
if (cached) {
    const data = JSON.parse(cached);
    // Use cached data
} else {
    // Call API
}
```

**2. Preload images:**
```javascript
// Start loading image as soon as we have CAS element
const preloadImage = new Image();
preloadImage.src = imageUrl;
preloadImage.onload = () => {
    resultImage.src = imageUrl;
};
```

---

## Firebase Config Values

Get these from Firebase Console:

1. Go to [Project Settings](https://console.firebase.google.com/project/realness-score/settings/general)
2. Scroll to "Your apps"
3. Click on your web app (or create one)
4. Copy the firebaseConfig object

Replace these placeholders in the code:
- `YOUR_API_KEY` → Web API key from Firebase
- `YOUR_SENDER_ID` → Messaging sender ID
- `YOUR_APP_ID` → App ID

---

## Deployment Steps

1. **Update Firebase config** in `public/index.html`
2. **Integrate API calls** (Steps 2-4 above)
3. **Test locally:**
   ```bash
   cd public
   python3 -m http.server 8000
   # Open http://localhost:8000
   ```
4. **Deploy Functions:**
   ```bash
   firebase deploy --only functions
   ```
5. **Deploy Hosting:**
   ```bash
   firebase deploy --only hosting
   ```

---

## Next Steps

1. ✅ Complete integration (Steps 1-5)
2. ✅ Test locally with emulator
3. ✅ Deploy to Firebase
4. ✅ Test production with real subjects
5. ⏳ Generate 504 images (optional - can be on-demand)
6. ⏳ Monitor usage and costs
7. ⏳ Iterate based on user feedback

---

## Quick Reference

### Key Functions to Update

| Function | Location | Change |
|:---------|:---------|:-------|
| `goToSortScreen()` | ~line 1800 | Add icon detection API call |
| `showResultsScreen()` | ~line 2100 | Add personalization API call |
| `loadResultImage()` | New function | Add image loading from Firestore |
| `openSpotifySearch()` | New function | Add Spotify query integration |

### API Call Summary

```javascript
// Call 1: Icon Detection (Screen 2)
const detectIcon = functions.httpsCallable('detectIconAndPronouns');
const result = await detectIcon({ subject: "my mother" });
// Returns: { icon, pronouns, subjectType }

// Call 2: Personalization (Screen 4)
const personalize = functions.httpsCallable('personalizeApproach');
const result = await personalize({ affects, subject, pronouns, subjectType });
// Returns: { casElement, feeling, approach, weather, musicGenre, spotifyQuery }
```

---

Ready to integrate? Start with Step 1 and work through each step sequentially!
