# Feel it, Don't Think It - Architecture Summary

## Simplified 2-Call Gemini Integration

### User Journey & API Calls

```
Screen 1: Intro
    ↓ [User clicks "Let's Go"]

Screen 2: The What
    ↓ [User enters subject: "my mother"]

    → API CALL 1: detectIconAndPronouns()
      Input: { subject: "my mother" }
      Uses: GEMINI_PROMPT_1_ICON_PRONOUN.md
      Output: { icon: "user-heart", pronouns: "she/her", subjectType: "person" }

    ↓ [Display icon + move to Screen 3]

Screen 3: The Sort
    ↓ [User drag-sorts 9 affects]
    ↓ [Calculate top 3: Curiosity, Joy, Surprise–Startle]
    ↓ [User clicks "Next"]

Screen 4: Results
    ↓ [Show placeholder image immediately]

    → API CALL 2: personalizeApproach()
      Input: {
        affects: ["Curiosity", "Joy", "Surprise–Startle"],
        subject: "my mother",
        pronouns: "she/her",
        subjectType: "person"
      }

      Backend Process:
      1. Generate CAS element: "CuJoSt"
      2. Fetch from Firestore: affectCombinations/CuJoSt
      3. Use Gemini to personalize "approach" text
      4. Generate Spotify query

      Output: {
        casElement: "CuJoSt",
        feeling: "exploratory radiant layered with startled depth",
        approach: "Mirror your Curiosity about your relationship with your mother. Let Joy help you celebrate what you discover about her...",
        weather: "Bright, shifting skies...",
        musicGenre: "Synth Pop / Indie Pop",
        spotifyQuery: "synth pop joyful discovery"
      }

    → IMAGE GENERATION (Async, Non-Blocking):
      1. Check if image exists: generatedImages/CuJoSt
      2. If not, generate on-demand using DALL-E/Midjourney
      3. Cache in Firebase Storage
      4. Fade in when ready

Screen 5: Learn More
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vanilla JS)                     │
│  prototype.html → production index.html + Firebase SDK          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─── API Call 1 (Screen 2)
                              │    detectIconAndPronouns()
                              │    ↓
                              │    ┌────────────────────────────┐
                              │    │  Google Gemini 1.5 Flash   │
                              │    │  PROMPT_1: Icon detection  │
                              │    └────────────────────────────┘
                              │
                              ├─── API Call 2 (Screen 4)
                              │    personalizeApproach()
                              │    ↓
                              │    ┌────────────────────────────┐
                              │    │  Firestore Query           │
                              │    │  affectCombinations/{CAS}  │
                              │    └────────────────────────────┘
                              │    ↓
                              │    ┌────────────────────────────┐
                              │    │  Google Gemini 1.5 Flash   │
                              │    │  PROMPT_2: Personalization │
                              │    └────────────────────────────┘
                              │
                              └─── Image Request (Screen 4, async)
                                   generateImage()
                                   ↓
                                   ┌────────────────────────────┐
                                   │  Firestore Query           │
                                   │  generatedImages/{CAS}     │
                                   └────────────────────────────┘
                                   ↓
                                   [If not cached]
                                   ↓
                                   ┌────────────────────────────┐
                                   │  DALL-E 3 / Midjourney     │
                                   │  Generate grayscale sketch │
                                   └────────────────────────────┘
                                   ↓
                                   ┌────────────────────────────┐
                                   │  Firebase Storage          │
                                   │  Cache image               │
                                   └────────────────────────────┘
```

---

## Firebase Structure

### Firestore Collections

**1. affectCombinations** (504 documents)
- Document ID: CAS element (e.g., "CuJoSt")
- Fields:
  - `affect1`: "Curiosity"
  - `affect2`: "Joy"
  - `affect3`: "Surprise–Startle"
  - `overallValence`: "Strongly Positive"
  - `feeling`: "exploratory radiant layered with startled depth"
  - `approach`: "Mirror your Curiosity about the world..." (generic template)
  - `weather`: "Bright, shifting skies..."
  - `musicGenre`: "Synth Pop / Indie Pop"
  - `imagePromptBase`: "A complex, fractal-like structure..."
  - `updatedAt`: timestamp

**2. generatedImages** (up to 504 documents)
- Document ID: CAS element (e.g., "CuJoSt")
- Fields:
  - `imageUrl`: "https://storage.googleapis.com/realness-score.../CuJoSt.png"
  - `prompt`: "Grayscale sketch of..."
  - `generatedAt`: timestamp

**3. sessions** (optional, analytics)
- Document ID: auto-generated
- Fields:
  - `subject`: "my mother"
  - `subjectType`: "person"
  - `top3`: ["Curiosity", "Joy", "Surprise–Startle"]
  - `casElement`: "CuJoSt"
  - `createdAt`: timestamp

---

## Cloud Functions

### Function 1: detectIconAndPronouns
```typescript
exports.detectIconAndPronouns = functions.https.onCall(async (data) => {
  // Input: { subject: "my mother" }
  // Gemini API call with PROMPT_1
  // Output: { icon: "user-heart", pronouns: "she/her", subjectType: "person" }
});
```

### Function 2: personalizeApproach
```typescript
exports.personalizeApproach = functions.https.onCall(async (data) => {
  // Input: { affects, subject, pronouns, subjectType }
  // 1. Generate CAS element from affects
  // 2. Fetch matrix data from Firestore
  // 3. Gemini API call to personalize approach text
  // Output: { casElement, feeling, approach, weather, musicGenre, spotifyQuery }
});
```

### Function 3: generateImage (Optional)
```typescript
exports.generateImage = functions.https.onCall(async (data) => {
  // Input: { casElement, subject, affects }
  // 1. Check cache in generatedImages collection
  // 2. If not cached, call DALL-E/Midjourney API
  // 3. Upload to Storage
  // 4. Save metadata to Firestore
  // Output: { imageUrl, cached: true/false }
});
```

---

## Cost Analysis (Per User Session)

### Gemini API Costs
- **Call 1 (Icon Detection):** ~500 input tokens + 100 output tokens = $0.00006
- **Call 2 (Personalization):** ~1000 input tokens + 500 output tokens = $0.00023
- **Total per user:** ~$0.0003 (less than 1 cent)

### Image Generation (One-Time Per Combination)
- **DALL-E 3:** $0.040 per image × 504 combinations = **$20.16 one-time**
- **After cache:** $0 per user (just serve from Storage)

### Firebase Costs (Free Tier)
- **Firestore reads:** 3 per user (within 50K/day free tier)
- **Functions invocations:** 2-3 per user (within 2M/month free tier)
- **Storage downloads:** 1 image per user (within 1GB/day free tier)

**Total recurring cost per 1000 users:** ~$0.30 (Gemini) + negligible Firebase = **<$1/month**

---

## Admin Interface Requirements

### What Admins Can Do:
1. **View all 504 combinations** in a searchable table
2. **Edit content fields:**
   - Feeling (poetic description)
   - Approach (therapeutic guidance template)
   - Weather (metaphor)
   - Music Genre (pair)
   - Image Prompt Base (surrealism description)
3. **Cannot edit:** Affect 1, 2, 3 (these define the CAS element)
4. **Bulk operations:**
   - Import CSV/markdown to populate all 504
   - Export to CSV for backup
   - Regenerate all images (calls DALL-E for all 504)

### Admin UI Structure:
```
+------------------------------------------+
| Feel it, Don't Think It - Admin          |
+------------------------------------------+
| Filters: [Affect 1 ▼] [Affect 2 ▼] [Affect 3 ▼] [Search...]
+------------------------------------------+
| Table (504 rows, paginated 50 per page) |
| CAS | Affect 1 | Affect 2 | Affect 3 | Feeling | Approach | [Edit] [Preview]
+------------------------------------------+
| [Import Matrix] [Export CSV] [Regenerate All Images]
+------------------------------------------+
```

### Edit Modal:
- Shows current values in textareas
- Live preview of how it will appear on Results screen
- Save → updates Firestore immediately
- Track `updatedAt` timestamp

---

## Deployment Checklist

### Prerequisites:
- [ ] Google Gemini API key (from Google AI Studio)
- [ ] DALL-E API key (from OpenAI) OR Midjourney/SD setup
- [ ] Firebase project credentials

### Setup Steps:
1. [ ] Initialize Firebase Functions
   ```bash
   firebase init functions
   ```

2. [ ] Set environment variables
   ```bash
   firebase functions:config:set gemini.api_key="YOUR_KEY"
   firebase functions:config:set openai.api_key="YOUR_KEY"
   ```

3. [ ] Install dependencies
   ```bash
   cd functions && npm install
   ```

4. [ ] Deploy Firestore rules
   ```bash
   firebase deploy --only firestore:rules
   ```

5. [ ] Populate database
   ```bash
   node scripts/populateFirestore.js
   ```

6. [ ] Deploy functions
   ```bash
   firebase deploy --only functions
   ```

7. [ ] Deploy frontend
   ```bash
   firebase deploy --only hosting
   ```

8. [ ] Generate all 504 images (optional, can be on-demand)
   ```bash
   node scripts/generateAllImages.js
   ```

---

## Key Design Decisions

### Why Only 2 Gemini Calls?
1. **Icon Detection:** AI is best at semantic matching (Lucide has 1000+ icons)
2. **Personalization:** AI adapts generic templates to user's specific subject
3. **Matrix Data:** Pre-written by experts, stored in Firestore (no AI needed)
4. **Image Prompts:** Pre-written surrealism prompts (can be formatted client-side)

### Why Firestore Over Hardcoded JSON?
1. **Admin interface:** Easy CRUD operations
2. **Real-time updates:** Changes sync without redeployment
3. **Scalability:** Can add versioning, A/B testing, user feedback
4. **Analytics:** Track which combinations are most common

### Why On-Demand Image Generation?
1. **Cost:** Only generate images users actually see
2. **Flexibility:** Can regenerate if prompt/style changes
3. **Caching:** Store in Firebase Storage, serve via CDN
4. **Quality:** Each generation can use latest AI model

---

## Next Immediate Steps

1. **Get Gemini API Key:**
   - Go to https://aistudio.google.com/
   - Create new API key
   - Test with PROMPT_1 using sample input

2. **Initialize Firebase Functions:**
   ```bash
   cd /Users/danielcrowder/Desktop/Projects/Assessment
   firebase init functions
   ```

3. **Create Firestore Population Script:**
   - Parse `New RAG/top3_affect_matrix.md`
   - Upload all 504 combinations to Firestore

4. **Build Admin Interface:**
   - `public/admin.html`
   - Firebase Auth for admin access
   - CRUD table for affect combinations

5. **Convert Prototype to Production:**
   - Add Firebase SDK to prototype.html
   - Replace hardcoded data with API calls
   - Test end-to-end flow

Would you like me to start with any of these steps?
