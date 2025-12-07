# Feel it, Don't Think It - App Overview

## What This App Does

**Feel it, Don't Think It** is a web-based affect assessment tool that helps users understand their emotional responses to a specific person, place, thing, or concept through embodied awareness rather than cognitive analysis.

The app uses **Affect Theory** (based on Silvan Tomkins' work) to identify which of 9 core biological affects are present in the user's body when they think about their chosen subject. Instead of asking "What do you think about X?", it asks "What does your body feel when you think about X?"

## The Goal

Help users:
1. **Access embodied truth** - Recognize what their body already knows
2. **Understand emotional complexity** - See how multiple affects combine
3. **Receive personalized guidance** - Get therapeutic direction based on their unique affect combination
4. **Connect emotionally** - Experience music that matches their affective state

## The 9 Core Affects

The app is built on these biological affects (not emotions - emotions are affects + cognition):

1. **Curiosity** - leaning in, focused, drawn toward it
2. **Joy** - soft, open, warm, relaxed
3. **Surprise** - jolted, paused, suddenly interrupted
4. **Fear** - tight, alert, braced, scanning for danger
5. **Anger** - hot, pressured, ready to push back
6. **Sadness** - heavy, sinking, aching inward
7. **Disgust** - recoiling, pulling back fast, wanting to reject
8. **Withdrawing** - stepping back, taking distance, lowering intake
9. **Dropping** - shrinking, collapsing inward, eyes down

## Complete User Journey

### Screen 1: Landing Page

**Title:** "Feel it, Don't Think It"

**Subtitle:** "Understand how your body reveals true feeling."

**Body Text:**
"This isn't about what you think. It's about what your body already knows.

You'll sort 9 affects based on how your body responds when you think about something specific—a person, place, situation, or relationship.

Your sorting reveals the truth beneath your thoughts."

**Button:** "Start"

---

### Screen 2: Subject Entry

**Title:** "Name it."

**Instruction:** "When I think about..."

**Input Field Placeholder:** "someone, something, or somewhere"

**Helper Text (below input):** "Understand how your body reveals true feeling."

**Example Prompts (subtle, small text):**
- a person: "my mother", "my boss"
- a place: "Seattle", "my house"
- a thing: "my job", "money"
- a concept: "my anxiety", "change"

**Button:** "Continue"

**What Happens Behind the Scenes:**
- AI (Gemini) analyzes the subject
- Detects appropriate Lucide icon (semantic/metaphorical matching)
- Determines pronouns (she/her, he/him, they/them, it)
- Classifies subject type (person, place, thing, concept, relationship)
- Normalizes grammar for natural flow

---

### Screen 3: Affect Sorting

**Header Text (with icon and subject):**
[Icon] "When I think about [NORMALIZED SUBJECT] my body feels like it's..."

**Instruction Bar (with valence color):**
"Drag to sort. Most true at top."

**The 9 Affect Cards (drag & drop):**

Each card shows:
- **Affect Icon** (from affect-specific SVG paths)
- **Affect Name** (large, bold)
- **Physical Description** (body sensations)

Cards start in randomized order. User drags to reorder from most true (top) to least true (bottom).

**Affect Cards:**

1. **Curiosity**
   - Icon: Question mark circle
   - Body: "leaning in, focused, drawn toward it"

2. **Joy**
   - Icon: Smile circle
   - Body: "soft, open, warm, relaxed"

3. **Surprise**
   - Icon: Plus circle
   - Body: "jolted, paused, suddenly interrupted"

4. **Fear**
   - Icon: Star (alert)
   - Body: "tight, alert, braced, scanning for danger"

5. **Anger**
   - Icon: Lightning bolt
   - Body: "hot, pressured, ready to push back"

6. **Sadness**
   - Icon: Teardrop
   - Body: "heavy, sinking, aching inward"

7. **Disgust**
   - Icon: X circle
   - Body: "recoiling, pulling back fast, wanting to reject"

8. **Withdrawing**
   - Icon: Left arrow
   - Body: "stepping back, taking distance, lowering intake"

9. **Dropping**
   - Icon: Down arrow
   - Body: "shrinking, collapsing inward, eyes down"

**Button:** "See Results"

**What Happens Behind the Scenes:**
- Valence calculation: Each affect has a valence (positive, neutral, negative)
- Ranking weight: Position matters (top = 9 points, bottom = 1 point)
- Animation state: Total valence score maps to 9 color states (red → yellow → green)
- Real-time color feedback on divider as user sorts

---

### Interstitial: Processing Screen

**Full-screen overlay with icon background**

**Text (animated, cycling through affect names):**
"Processing"
[Curiosity → Joy → Surprise → Fear → Anger → Sadness → Disgust → Withdrawing → Dropping]
"(Your body already knows the truth.)"

**What Happens Behind the Scenes:**
- Top 3 affects sent to Cloud Function
- Generates CAS (Curiosity-Affect-Script) code (e.g., "CuJoSt" for Curiosity-Joy-Surprise)
- Fetches affect combination data from Firestore (1 of 504 combinations)
- AI personalizes approach text with user's subject and pronouns
- AI personalizes weather description
- Extracts Spotify seed parameters from database

---

### Screen 4: Results Page

**Layout:** Icon at top, text sections below, collapsible panels at bottom

#### Top Section

**Icon:**
- Large (240px) Lucide icon detected by AI
- Colored based on valence state (red for negative, yellow for neutral, green for positive)

**Subject Name (all caps, huge, valence colored):**
"[NORMALIZED SUBJECT]"

#### CAS Element Code
**Bottom right, above social buttons:**
- Monospace font, 32px, bold
- Example: "CuJoSt", "FeSaAn", "JoCuSa"
- 20% gray background, white text

#### Feeling Section

**Label:** "Feeling"

**Content:** Short poetic phrase describing the affective state
- Examples:
  - "exploratory radiant layered with startled depth"
  - "protective darkness holding defensive weight"
  - "warm curiosity tinged with tender loss"

Source: Direct from Firestore `feeling` field (not modified by AI)

#### Approach Section

**Label:** "Approach"

**Content:** Therapeutic guidance (400-500 characters, 3-4 sentences)

Each sentence is its own paragraph with tight line-height (1.3) and spacing between paragraphs.

**Example (for Curiosity-Joy-Sadness about "my mom"):**

"Let the Joy you feel about your mom lead the way.

Follow your Curiosity where it wants to go.

And when Sadness appears, honor it—it's pointing to what matters most."

**Characteristics:**
- Personalized with user's subject
- Uses appropriate pronouns (she/her for "my mom")
- Simple, everyday language (no "cultivate", "navigate", "embrace")
- Conversational yet profound
- Three-part structure addressing each affect
- Source: Base text from Firestore `approach` field, personalized by Gemini AI

#### Collapsible Panels

**1. Emotional Weather**

**Trigger Button:** "Emotional Weather ▼"

**Content:** Metaphorical weather description matching the affective state

**Example:**
"Soft golden light filtering through gentle clouds, with a bittersweet breeze carrying memories."

Source: Base text from Firestore `weather` field, personalized by AI with user's subject

**2. Your Soundtrack**

**Trigger Button:** "Your Soundtrack ▼"

**Music Genre Display:**
"Indie Folk / Ambient"

**Content:** 3 embedded Spotify tracks (152px height each)
- Fetched via Spotify Recommendations API
- Uses `spotify_seed` parameters from Firestore
- Example seed: `seed_genres=indie-folk,ambient&target_valence=0.65&target_energy=0.45`

#### Social Sharing Buttons

**Three buttons at bottom:**

1. **Share on Twitter**
   - Opens Twitter with pre-filled text:
   - "I just discovered my affect profile at Feel it, Don't Think It [URL]"

2. **Share on Facebook**
   - Opens Facebook share dialog with app URL

3. **Copy Link**
   - Copies current page URL to clipboard
   - Shows temporary "Copied!" feedback

#### Navigation

**Button:** "Start Over"
- Resets app to Screen 1
- Clears all state
- Randomizes affect order for next assessment

---

## Technical Architecture

### Frontend (index.html)
- Single-page vanilla JavaScript app
- Firebase SDK for Cloud Functions calls
- Lucide icons for semantic representation
- Drag-and-drop sorting interface
- Responsive design (320px mobile to desktop)
- 9-state valence color system (CSS custom properties)

### Backend (Cloud Functions)

**Function 1: detectIconAndPronouns**
- Input: User's subject text
- AI: Gemini 2.5 Flash
- Output: icon name, pronouns, subject type, normalized subject
- Purpose: Semantic analysis and grammar normalization

**Function 2: personalizeApproach**
- Input: Top 3 affects, subject, pronouns, subject type
- Database: Fetches from Firestore (1 of 504 combinations)
- AI: Gemini 2.5 Flash personalizes approach text
- Output: CAS code, feeling, personalized approach, weather, music info
- Purpose: Generate personalized therapeutic guidance

**Function 3: getSpotifyTrack**
- Input: Spotify seed parameters OR search query
- API: Spotify Recommendations API (preferred) or Search API (fallback)
- Output: 3 track details (id, name, artist, album art, preview URL)
- Purpose: Find music matching affective state

**Function 4: generateImage**
- Input: Image prompt (synthesized from affects + subject)
- API: Google Vertex AI Imagen 3
- Output: Generated image URL
- Purpose: Visual representation (currently not displayed but available)

**Function 5: getPrompts**
- Input: None
- Output: System prompts used for AI functions
- Purpose: Admin transparency

### Database (Firestore)

**Collection: affectCombinations**
- 504 documents (9 × 8 × 7 = 504 possible combinations of 3 affects)
- Document ID: CAS code (e.g., "CuJoSt")
- Fields:
  - `Affect1`, `Affect2`, `Affect3` (capitalized)
  - `approach` - Base therapeutic text with `{{subject}}` placeholder
  - `feeling` - Short poetic phrase
  - `weather` - Metaphorical weather description
  - `spotify_seed` - Recommendations API parameters
  - `spotify_prompt` - Search query (backup)
  - `valence_raw` - Numeric valence score
  - `valence_category` - Text category (Strongly Positive, Positive, Negative, Strongly Negative)

**Collection: submissions**
- Logs each completed assessment
- Fields: timestamp, subject, casElement, top3Affects, valenceScore, animationState, detectedIcon, detectedPronouns
- Used for analytics in admin panel

### Admin Panel (admin.html)

**Authentication:**
- Google Sign-In (redirect flow)
- Authorized emails only:
  - daniel@monumental-i.com (super_admin)
  - scottconkrightdcatlanta@gmail.com (admin)

**Tab 1: Submissions**
- Total submissions count
- Chart showing submissions over time (last 30 days)
- Table of all submissions with filters
- Export to CSV
- Shows: timestamp, subject, CAS code, top 3 affects, valence score

**Tab 2: Affect Combinations**
- View all 504 combinations
- Filter by: Affect1, Affect2, Affect3, Valence Category
- Edit any combination inline
- Export to CSV or JSON
- Import from CSV or JSON
- Download button for backup

**Tab 3: AI Prompts**
- Displays both system prompts for transparency:
  1. Icon Detection & Grammar Normalization prompt
  2. Approach Text Personalization prompt
- Read-only view
- Shows exact instructions given to AI

---

## Key Features

### AI-Powered Personalization
- Semantic icon matching (metaphorical, not literal)
- Grammar normalization
- Pronoun detection and adjustment
- Subject-specific therapeutic guidance
- Simple, everyday language (no jargon)

### Valence Visualization
- 9-state color gradient (red → orange → yellow → lime → green)
- Real-time feedback during sorting
- Colors applied to: divider, icon, subject text
- Based on weighted ranking of positive/neutral/negative affects

### Affect Theory Foundation
- 9 biological affects (Tomkins)
- Focus on body sensations, not cognitive labels
- 504 unique combinations (3 from 9, order matters)
- Therapeutic approach for each combination

### Music Integration
- Spotify Recommendations API
- Parameters: seed_genres, target_valence, target_energy
- 3 tracks per assessment
- Embedded playback
- Genre-matched to affective state

### Data-Driven Content
- All therapeutic content in Firestore
- Editable via admin panel
- Changes appear immediately
- 504 pre-written combinations
- CSV import/export for bulk editing

---

## The Science Behind It

### Why Affects, Not Emotions?

**Affects are biological** - They happen in your body before your brain interprets them.

**Emotions are affects + cognition** - "I feel sad" is your brain's story about the sadness affect.

**Example:**
- **Affect**: Heavy, sinking sensation in chest (Sadness)
- **Emotion**: "I'm sad because my friend moved away" (interpretation)

### The 9 Affects

These are **innate, universal, biological responses**. All humans are born with them.

**Positive Affects:**
1. Curiosity-Interest
2. Joy-Enjoyment

**Resetting Affect:**
3. Surprise-Startle

**Negative Affects:**
4. Fear-Terror
5. Anger-Rage
6. Sadness-Anguish (also called Distress)
7. Disgust
8. Withdrawing (also called Dissmell or Pulling-Away)
9. Dropping (also called Shame or The Drop)

### Why Sorting Works

Your body responds faster than your thoughts. When you think about something meaningful, multiple affects activate simultaneously. The sorting process:

1. **Bypasses cognition** - Forces attention to body sensations
2. **Reveals priority** - What's most true shows up strongest
3. **Shows complexity** - It's never just one thing
4. **Accesses truth** - Your body doesn't lie

### The CAS (Curiosity-Affect-Script) Framework

The app generates a 3-letter code representing your top 3 affects:
- **Cu** = Curiosity
- **Jo** = Joy
- **St** = Surprise
- **Fe** = Fear
- **An** = Anger
- **Sa** = Sadness
- **Di** = Disgust
- **Pu** = Withdrawing (Pulling-away)
- **Dr** = Dropping

Example: **CuJoSt** = Curiosity + Joy + Surprise

This code maps to 1 of 504 unique therapeutic approaches.

---

## Design Philosophy

### Embodied Over Cognitive
"Feel it, Don't Think It" - The entire experience prioritizes body awareness over mental analysis.

### Minimal Over Complex
Clean, focused interface. No distractions. Black background, white text, simple animations.

### Immediate Over Delayed
Real-time color feedback. Instant results. No loading bars (except processing screen).

### Personal Over Generic
AI personalization. Uses your subject. Your pronouns. Your context.

### Therapeutic Over Educational
Not here to teach affect theory. Here to provide guidance based on your unique combination.

---

## Use Cases

### Personal Growth
- Understand complex feelings about relationships
- Identify patterns in your affective responses
- Get therapeutic direction when stuck

### Therapy Integration
- Therapists can use with clients
- Provides language for body-based experience
- Starting point for deeper exploration

### Decision Making
- Check in with body wisdom before big decisions
- Understand affective complexity of choices
- Access truth beneath rationalizations

### Relationship Work
- Understand feelings about specific people
- See complexity (not just "I'm angry at my mom")
- Get guidance for working with mixed affects

### Grief & Loss
- Name the complexity of loss
- Understand multiple affects present simultaneously
- Receive compassionate guidance

---

## Mobile-First Design

The app is optimized for mobile (320px minimum width) with these considerations:

- **Large touch targets** - Drag cards are generous
- **Readable text** - Title is 72px on mobile
- **Thumb-friendly** - Most actions in bottom third
- **Vertical scrolling** - Natural mobile behavior
- **No popups** - Everything inline
- **Quick load** - Single HTML file, minimal assets

Desktop experience maintains the mobile-first aesthetic - no unnecessary complexity.

---

## Privacy & Data

**What's Stored:**
- Anonymous submissions (subject text, affects, timestamp)
- No user accounts required
- No email collection
- No tracking pixels

**What's Not Stored:**
- IP addresses
- User names
- Identifying information

**Admin Access:**
- Sees aggregate data only
- Can't identify individuals
- Used for improving therapeutic content

---

## Future Enhancements (Not Currently Implemented)

Potential additions:
- Image generation display (Imagen 3 function exists but not shown)
- Affect history tracking (optional account)
- Journaling integration
- PDF export of results
- Multiple language support
- Voice-to-text for subject entry
- Therapist dashboard for client tracking

---

## Credits & Attribution

**Affect Theory:** Silvan Tomkins, PhD
**Framework:** Curiosity-Affect-Script (CAS)
**Design & Development:** Monumental-i
**AI:** Google Gemini 2.5 Flash
**Music:** Spotify Recommendations API
**Icons:** Lucide
**Hosting:** Firebase

---

*"Your body already knows the truth."*
