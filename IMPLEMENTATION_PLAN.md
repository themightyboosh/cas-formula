# Feel it, Don't Think It - Implementation Plan

## Overview
Production app using Firebase + Google Gemini AI for the affect assessment experience.

---

## Architecture

### Frontend
- **Tech:** Vanilla JavaScript (converted from prototype.html)
- **Hosting:** Firebase Hosting
- **Features:**
  - 5-screen flow (Intro → What → Sort → Results → Learn More)
  - Drag-and-drop affect sorting
  - Real-time animation states based on valence scoring
  - On-demand image generation with placeholder fallback
  - Spotify music integration

### Backend (Firebase)
- **Firestore Database:** Store 504 affect combinations + user sessions
- **Cloud Functions:** Handle Gemini API calls
- **Storage:** Cache generated images
- **Authentication:** (Optional) Admin-only access for management interface

### AI Integration (Google Gemini)
- **API:** Gemini 1.5 Flash (fast, cheap)
- **Calls per session:**
  1. **Icon + Pronoun Detection** (Screen 2) - Uses GEMINI_PROMPT_1_ICON_PRONOUN.md
  2. **Personalize Approach Text** (Screen 4) - Uses GEMINI_PROMPT_2_RESULTS.md (personalization only)

### Image Generation (Separate Service)
- **Options:** DALL-E 3, Midjourney, Stable Diffusion
- **Trigger:** On-demand when user reaches Screen 4
- **Caching:** Store generated images in Firebase Storage (504 total)
- **Prompt:** Use `imagePromptBase` from Firestore + "Grayscale sketch of..." prefix

---

## Phase 1: Firebase Setup

### 1.1 Update firebase.json
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ]
  },
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### 1.2 Firestore Data Structure

**Collection: `affectCombinations`**
```javascript
{
  id: "CuJoSt", // CAS element as document ID
  affect1: "Curiosity",
  affect2: "Joy",
  affect3: "Surprise–Startle",
  overallValence: "Strongly Positive",
  feeling: "exploratory radiant layered with startled depth",
  approach: "Mirror your Curiosity about the world. Let **Joy** help you celebrate what you find. But stay grounded—**Surprise–Startle** is there as a reminder of the real. Don't push it away, just let it sit.",
  weather: "Bright, shifting skies with variable winds, interrupted by warm, golden sunshine, with a lingering trace of sudden flashes of lightning in a clear sky.",
  musicGenre: "Synth Pop / Indie Pop",
  imagePromptBase: "A complex, fractal-like structure expanding outward, merging with a radiant burst of warm, golden light, with a hidden detail of a glitch-art distortion breaking a clean pattern.",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Collection: `sessions` (optional - for analytics)**
```javascript
{
  id: auto-generated,
  subject: "my mother",
  subjectType: "person",
  pronouns: "she/her",
  icon: "user-heart",
  sortedAffects: ["Curiosity", "Joy", "Surprise–Startle", ...],
  top3: ["Curiosity", "Joy", "Surprise–Startle"],
  casElement: "CuJoSt",
  valenceScore: -2,
  imageUrl: "gs://realness-score.appspot.com/images/CuJoSt_abc123.png",
  createdAt: timestamp
}
```

**Collection: `generatedImages` (cache)**
```javascript
{
  id: "CuJoSt", // CAS element as key
  imageUrl: "https://storage.googleapis.com/realness-score.appspot.com/images/CuJoSt.png",
  prompt: "Grayscale sketch of...",
  generatedAt: timestamp,
  cacheExpiresAt: timestamp // Optional: regenerate after 30 days
}
```

### 1.3 Firestore Rules

**File: `firestore.rules`**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public read access to affect combinations
    match /affectCombinations/{docId} {
      allow read: if true;
      allow write: if request.auth != null; // Admin only
    }

    // Sessions are write-only for users (analytics)
    match /sessions/{sessionId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null; // Admin only
    }

    // Image cache is public read, admin write
    match /generatedImages/{imageId} {
      allow read: if true;
      allow write: if request.auth != null; // Admin only
    }
  }
}
```

### 1.4 Storage Rules

**File: `storage.rules`**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Generated images are public read
    match /images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null; // Admin/Functions only
    }
  }
}
```

---

## Phase 2: Cloud Functions (Gemini API Integration)

### 2.1 Initialize Functions
```bash
cd /Users/danielcrowder/Desktop/Projects/Assessment
firebase init functions
# Choose TypeScript
# Choose ESLint
```

### 2.2 Install Dependencies
```bash
cd functions
npm install @google/generative-ai firebase-admin
npm install --save-dev @types/node
```

### 2.3 Set Gemini API Key
```bash
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
```

### 2.4 Function: detectIconAndPronouns

**File: `functions/src/index.ts`**
```typescript
import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as admin from 'firebase-admin';

admin.initializeApp();

const genAI = new GoogleGenerativeAI(functions.config().gemini.api_key);

// Gemini Prompt 1: Icon & Pronoun Detection
export const detectIconAndPronouns = functions.https.onCall(async (data, context) => {
  const { subject } = data;

  if (!subject) {
    throw new functions.https.HttpsError('invalid-argument', 'Subject is required');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Load GEMINI_PROMPT_1_ICON_PRONOUN.md system instructions
    const systemPrompt = `[Full contents of GEMINI_PROMPT_1_ICON_PRONOUN.md]`;

    const prompt = `${systemPrompt}\n\nInput:\n${JSON.stringify({ subject })}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse JSON response
    const parsed = JSON.parse(response);

    return {
      icon: parsed.icon,
      pronouns: parsed.pronouns,
      subjectType: parsed.subjectType
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new functions.https.HttpsError('internal', 'Failed to detect icon and pronouns');
  }
});
```

### 2.5 Function: personalizeApproach

**This is the ONLY function that uses GEMINI_PROMPT_2_RESULTS.md**

```typescript
export const personalizeApproach = functions.https.onCall(async (data, context) => {
  const { affects, subject, pronouns, subjectType } = data;

  if (!affects || affects.length !== 3 || !subject || !pronouns || !subjectType) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    // Generate CAS element
    const casElement = affects.map((affect: string) => getCASCode(affect)).join('');

    // Fetch from Firestore (matrix data)
    const db = admin.firestore();
    const docRef = db.collection('affectCombinations').doc(casElement);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new functions.https.HttpsError('not-found', `Combination ${casElement} not found in database`);
    }

    const matrixData = doc.data();

    // Use Gemini ONLY to personalize the approach text
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Simplified prompt: Only personalization rules, not full matrix
    const systemPrompt = `
You are personalizing therapeutic guidance for an affect assessment app.

Given:
- Original approach text (generic)
- User's subject
- Pronouns (she/her, he/him, they/them, it)
- Subject type (person, place, thing, concept, relationship)

Task: Replace generic phrases with personalized references to the user's subject.

Rules:
1. Replace "the world" with the subject
2. Replace "what you find" with context about the subject
3. Adjust pronouns if subject is a person
4. Keep therapeutic structure intact
5. Don't change affect-specific language

Return JSON: { "personalizedApproach": "...", "spotifyQuery": "..." }
    `;

    const prompt = `
${systemPrompt}

Original Approach:
"${matrixData.approach}"

Subject: "${subject}"
Pronouns: "${pronouns}"
Subject Type: "${subjectType}"

Personalize the approach text and generate a 3-5 word Spotify search query based on:
- Music Genre: "${matrixData.musicGenre}"
- Feeling: "${matrixData.feeling}"
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const parsed = JSON.parse(response);

    return {
      casElement,
      feeling: matrixData.feeling, // Direct from Firestore
      approach: parsed.personalizedApproach, // From Gemini
      weather: matrixData.weather, // Direct from Firestore
      musicGenre: matrixData.musicGenre, // Direct from Firestore
      spotifyQuery: parsed.spotifyQuery // From Gemini
    };
  } catch (error) {
    console.error('Error personalizing approach:', error);
    throw new functions.https.HttpsError('internal', 'Failed to personalize approach');
  }
});

function getCASCode(affect: string): string {
  const codes: { [key: string]: string } = {
    'Curiosity': 'Cu',
    'Joy': 'Jo',
    'Surprise–Startle': 'St',
    'Fear': 'Fe',
    'Anger': 'An',
    'Sadness': 'Sa',
    'Disgust': 'Di',
    'Pulling-Away': 'Pu',
    'The Drop': 'Dr'
  };
  return codes[affect] || 'Xx';
}
```

### 2.6 Function: generateImage (On-Demand)

```typescript
export const generateImage = functions.https.onCall(async (data, context) => {
  const { casElement, subject, affects } = data;

  if (!casElement || !affects || affects.length !== 3) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const db = admin.firestore();

    // Check if image already exists in cache
    const cacheRef = db.collection('generatedImages').doc(casElement);
    const cacheDoc = await cacheRef.get();

    if (cacheDoc.exists) {
      const cached = cacheDoc.data();
      return { imageUrl: cached.imageUrl, cached: true };
    }

    // Fetch base image prompt from affect combination
    const comboRef = db.collection('affectCombinations').doc(casElement);
    const comboDoc = await comboRef.get();

    if (!comboDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Combination not found');
    }

    const baseImagePrompt = comboDoc.data()?.imagePromptBase;

    // Use Gemini to format the image prompt
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `[Full contents of GEMINI_PROMPT_3_IMAGE.md]`;

    const prompt = `
${systemPrompt}

Input:
${JSON.stringify({ baseImagePrompt, subject, affects })}

Return the formatted image generation prompt as JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const parsed = JSON.parse(response);

    // TODO: Call image generation API (DALL-E, Midjourney, Stable Diffusion)
    // For now, return the formatted prompt
    // In production, generate the image and upload to Storage

    const imageUrl = `https://placeholder.com/grayscale?text=${casElement}`;

    // Cache the result
    await cacheRef.set({
      imageUrl,
      prompt: parsed.imagePrompt,
      generatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { imageUrl, cached: false, prompt: parsed.imagePrompt };
  } catch (error) {
    console.error('Error generating image:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate image');
  }
});
```

---

## Phase 3: Admin Interface

### 3.1 Admin Dashboard Structure

**File: `public/admin.html`**

Features:
- Firebase Authentication (admin-only access)
- CRUD operations on `affectCombinations` collection
- Table view matching matrix structure (9 columns)
- Search/filter by affects
- Bulk import from CSV/markdown
- Export to CSV

### 3.2 Admin Interface Requirements

**Layout:**
```
+-----------------------------------+
| Feel it, Don't Think It - Admin   |
+-----------------------------------+
| [Filter: Affect 1] [Affect 2] [Affect 3] [Search]
+-----------------------------------+
| Table: 504 Combinations           |
| Affect 1 | Affect 2 | Affect 3 | Valence | Feeling | Approach | Weather | Music | Image Prompt | [Edit]
+-----------------------------------+
| [Add New Combination]             |
+-----------------------------------+
| [Import from Matrix] [Export CSV] |
+-----------------------------------+
```

**Key Features:**
1. **Editable fields:** Feeling, Approach, Weather, Music Genre, Image Prompt
2. **Fixed fields:** Affect 1, Affect 2, Affect 3 (cannot change - tied to CAS element)
3. **Preview mode:** Click row to preview how it will display on Results screen
4. **Bulk import:** Upload `top3_affect_matrix.md` to populate all 504 combinations
5. **Real-time updates:** Changes sync to Firestore immediately
6. **Version history:** Track changes to approach text (optional)

### 3.3 Initial Data Population

**Script: `scripts/populateFirestore.js`**
```javascript
// Parse top3_affect_matrix.md and upload all 504 combinations to Firestore
// Run once to seed the database
```

---

## Phase 4: Frontend Production App

### 4.1 Convert Prototype to Production

**File: `public/index.html`**
- Import Firebase SDK
- Add API call handlers for Cloud Functions
- Implement image loading with placeholder fallback
- Add Spotify API integration

### 4.2 Firebase SDK Integration

```html
<!-- Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-functions-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-storage-compat.js"></script>

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
  const db = firebase.firestore();
  const functions = firebase.functions();
  const storage = firebase.storage();
</script>
```

### 4.3 API Call Implementation

**Screen 2: Icon Detection**
```javascript
async function analyzeSubject(subject) {
  const detectIcon = functions.httpsCallable('detectIconAndPronouns');

  try {
    const result = await detectIcon({ subject });
    return result.data; // { icon, pronouns, subjectType }
  } catch (error) {
    console.error('Error detecting icon:', error);
    return { icon: 'help-circle', pronouns: 'it', subjectType: 'thing' };
  }
}
```

**Screen 4: Results Generation**
```javascript
async function generateResults(affects, subject, pronouns, subjectType) {
  const personalize = functions.httpsCallable('personalizeApproach');

  try {
    const result = await personalize({ affects, subject, pronouns, subjectType });
    return result.data;
    // Returns: { casElement, feeling, approach (personalized), weather, musicGenre, spotifyQuery }
  } catch (error) {
    console.error('Error personalizing approach:', error);
    throw error;
  }
}
```

**Screen 4: Image Loading (Async)**
```javascript
async function loadResultImage(casElement, subject, affects) {
  const resultImage = document.getElementById('resultImage');

  // Show placeholder immediately
  resultImage.src = 'New RAG/default.png';
  resultImage.classList.add('loaded');

  // Try to load cached image first
  try {
    const cacheRef = db.collection('generatedImages').doc(casElement);
    const cacheDoc = await cacheRef.get();

    if (cacheDoc.exists) {
      const imageUrl = cacheDoc.data().imageUrl;
      resultImage.src = imageUrl;
      return;
    }
  } catch (error) {
    console.warn('No cached image found');
  }

  // Generate image on-demand
  const generateImg = functions.httpsCallable('generateImage');

  try {
    const result = await generateImg({ casElement, subject, affects });
    resultImage.src = result.data.imageUrl;
  } catch (error) {
    console.error('Error loading image:', error);
    // Fallback to placeholder (already loaded)
  }
}
```

---

## Phase 5: Deployment

### 5.1 Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 5.2 Deploy Storage Rules
```bash
firebase deploy --only storage
```

### 5.3 Deploy Functions
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### 5.4 Populate Database
```bash
node scripts/populateFirestore.js
```

### 5.5 Deploy Hosting
```bash
firebase deploy --only hosting
```

---

## Environment Variables Needed

1. **Gemini API Key** - Get from Google AI Studio
2. **Firebase Project Config** - Available in Firebase Console
3. **Spotify API Credentials** (optional) - For music integration

---

## Next Steps

1. ✅ Create 3 Gemini prompts (DONE)
2. ⏳ Get Gemini API key from Google AI Studio
3. ⏳ Initialize Firebase Functions
4. ⏳ Create Firestore data population script
5. ⏳ Build admin interface
6. ⏳ Convert prototype.html to production app
7. ⏳ Test end-to-end flow
8. ⏳ Deploy to Firebase

---

## Cost Estimation

**Firebase (Free Tier):**
- Firestore: 50K reads/day, 20K writes/day
- Functions: 2M invocations/month
- Hosting: 10GB storage, 360MB/day transfer
- Storage: 5GB

**Google Gemini API:**
- Gemini 1.5 Flash: $0.075 / 1M input tokens, $0.30 / 1M output tokens
- Estimated cost per user session: ~$0.001 (3 API calls)

**Image Generation (if using DALL-E 3):**
- $0.040 per image (1024x1024)
- With caching: Only generate once per 504 combinations = ~$20 one-time cost

**Total estimated cost:** <$50/month for moderate traffic (1000 users/month)
