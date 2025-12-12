# Feel It, Don't Think It - System Pipeline Documentation

**Version:** 3.0
**Last Updated:** December 11, 2024
**Purpose:** Human-readable audit trail of data flow and processing

---

## Table of Contents

1. [System Overview](#system-overview)
2. [User Journey Flow](#user-journey-flow)
3. [Data Collection Pipeline](#data-collection-pipeline)
4. [AI Processing Pipeline](#ai-processing-pipeline)
5. [Technical Architecture](#technical-architecture)
6. [Data Storage](#data-storage)
7. [Security & Privacy](#security--privacy)

---

## System Overview

### What This App Does

**Feel It, Don't Think It** helps users understand their emotional experiences through:

1. **Embodied Metaphor Recognition** - Users recognize physical sensations rather than naming emotions
2. **Tomkins Affect Theory** - Maps sensations to 9 core biological affects
3. **Core Attachment Style (CAS)** - Reveals automatic emotional processing patterns
4. **AI-Generated Insight** - Personalized therapeutic response combining all inputs

### Core Philosophy

> "Your body already knows. We're not teaching you what to feel—we're revealing what's already moving through you, asking to be seen."

The app uses embodied metaphor recognition instead of cognitive labeling. Instead of asking "How angry are you?" (requiring self-diagnosis), it presents: "Blood boiling, pressure building, heat rising, ready to explode" (recognition, not translation).

---

## User Journey Flow

### Screen 1: Introduction
**Purpose:** Frame the experience
**Display:**
- Heading: "What's happening inside you right now?"
- Tagline: "Your body can sometime tell you a lot more about what's going on than your thoughts."
- Begin button

**User Action:** Click "Begin"

---

### Screen 2: Affect Selection
**Purpose:** Let body recognize its current state through metaphor clusters

**Display:**
- Heading: "What sits in your body right now?"
- Info button (?) - Opens modal explaining embodied metaphor approach
- 9 affect cards, each containing:
  - 64x64px custom PNG icon
  - Affect name
  - 2 metaphor examples

**The 9 Affects (Tomkins-based):**

| Affect | Icon | Metaphors | Tomkins Origin |
|--------|------|-----------|----------------|
| Curiosity | `lahzo_0003_interest.png` | "leaning in toward something, pulled forward, tracking movement, eyes focused and bright" | Interest-Excitement |
| Joy | `lahzo_0006_joy.png` | "chest expanding, warmth spreading, softening, opening up" | Enjoyment-Joy |
| Surprise | `lahzo_0004_surprise.png` | "breath catching, suddenly jolted, paused mid-step, interrupted" | Surprise-Startle |
| Fear | `lahzo_0008_fear.png` | "heart racing, blood running cold, frozen in place, braced for impact" | Fear-Terror |
| Anger | `lahzo_0000_anger.png` | "blood boiling, pressure building, heat rising, ready to explode" | Anger-Rage |
| Sadness | `lahzo_0007_sadness.png` | "weight pressing down, sinking, drowning, can't catch breath" | Distress-Anguish |
| Disgust | `lahzo_0001_disgust.png` | "recoiling, pulling back fast, wanting to spit it out, nausea rising" | Disgust |
| Withdrawing | `lahzo_0005_withdrawing.png` | "stepping back, creating distance, turning away, closing the door" | Dissmell (modified) |
| Dropping | `lahzo_0002_dropping.png` | "want to disappear, feeling small, can't face anyone, shrinking" | Shame-Humiliation |

**User Action:** Click one affect card → "Continue" button appears

**Data Captured:**
```javascript
state.selectedAffect = index (0-8)
state.selectedAffectName = "Curiosity" // or Joy, Fear, etc.
```

---

### Screen 3: Context, Direction & Intensity
**Purpose:** Gather situational details that shape the affect

**Part A: Context**
- Input field: "What's this connecting to?"
- Placeholder: "A relationship, decision, situation, memory..."
- User types freeform text

**Part B: Direction**
- Question: "Where is this pointed?"
- 4 buttons:
  - "At myself" → `direction: 'self'`
  - "At someone else" → `direction: 'other'`
  - "At the past" → `direction: 'past'`
  - "At the future" → `direction: 'future'`

**Part C: Intensity**
- Question: "How loud is it?"
- 4 buttons with number + label:
  - "1 - Quiet hum" → `intensity: 1`
  - "2 - Steady presence" → `intensity: 2`
  - "3 - Loud and insistent" → `intensity: 3`
  - "4 - Overwhelming" → `intensity: 4`

**User Action:** Fill all 3 fields → "Continue" button enables

**Data Captured:**
```javascript
state.context = "My relationship with my boss"
state.direction = "other"
state.intensity = 3
```

---

### Screen 3b: CAS Assessment (8 Questions)
**Purpose:** Calculate Core Attachment Style archetype

**Display:**
- Caption: "THE TERRAIN"
- Heading: "Why you handle it the way you do"
- Explanation: "Two people with the same emotions can have completely different experiences. These questions reveal your terrain—the automatic survival strategy you've been running since childhood."
- Progress counter: "X/8 answered — Y more to go"
- 8 multiple-choice questions (4 options each)

**The 8 CAS Questions:**

1. **"I'm most afraid of:"**
   - Being abandoned or rejected → anxious_preoccupied +2
   - Being exposed as flawed → anxious_perfectionist +2
   - Losing myself in others → anxious_merging +2
   - Being trapped or controlled → avoidant +2

2. **"When I feel vulnerable, I:"**
   - Reach out and amplify my distress → anxious_preoccupied +2
   - Polish my presentation → anxious_perfectionist +2
   - Merge more deeply with others → anxious_merging +2
   - Pull away and self-soothe → avoidant +2

3. **"I think needing people is:"**
   - Essential and I'm afraid they'll leave → anxious_preoccupied +2
   - Dangerous because I might fail them → anxious_perfectionist +2
   - How I feel whole → anxious_merging +2
   - Weakness I try to avoid → avoidant +2

4. **"Strong emotions make me want to:"**
   - Share them loudly → anxious_preoccupied +2
   - Control them perfectly → anxious_perfectionist +2
   - Dissolve into someone else → anxious_merging +2
   - Retreat into my head → avoidant +2

5. **"I handle conflict by:"**
   - Getting more emotional to be heard → anxious_preoccupied +2
   - Trying to fix it immediately → anxious_perfectionist +2
   - Absorbing the other's feelings → anxious_merging +2
   - Withdrawing or intellectualizing → avoidant +2

6. **"In relationships, I:"**
   - Feel the most but get heard the least → anxious_preoccupied +2, secure +1
   - Perform competence to stay valued → anxious_perfectionist +2
   - Blur boundaries and lose myself → anxious_merging +2
   - Maintain distance to stay safe → avoidant +2

7. **"When someone I love is upset, I:"**
   - Worry they'll leave me → anxious_preoccupied +2
   - Feel responsible for fixing it → anxious_perfectionist +2, secure +1
   - Absorb their emotions as my own → anxious_merging +2
   - Observe from a distance → avoidant +2

8. **"My core belief about myself is:"**
   - I'm too much and will be abandoned → anxious_preoccupied +2
   - I'm only valuable if I'm perfect → anxious_perfectionist +2
   - I don't exist without someone else → anxious_merging +2
   - I'm safer alone → avoidant +2

**Scoring Algorithm:**

```javascript
// Initialize score buckets
scores = {
    secure: 0,
    anxious: 0,
    anxious_preoccupied: 0,
    anxious_perfectionist: 0,
    anxious_merging: 0,
    avoidant: 0,
    avoidant_dismissive: 0,
    avoidant_intellectual: 0,
    avoidant_counterphobic: 0,
    disorganized: 0
}

// Tally points from each answer
// Then determine archetype:

if (scores.disorganized >= 6) {
    archetype = "Mystery Mosaic"
}
else if (scores.secure >= 8) {
    archetype = "Grounded Navigator"
}
else if (scores.anxious_perfectionist > maxScore) {
    archetype = "Heartfelt Defender"
}
else if (scores.anxious_preoccupied > maxScore) {
    archetype = "Emotional Enthusiast"
}
else if (scores.anxious >= 6) {
    archetype = "Passionate Pilgrim"
}
else if (scores.avoidant_dismissive > maxScore) {
    archetype = "Independent Icon"
}
else if (scores.avoidant_intellectual > maxScore) {
    archetype = "Chill Conductor"
}
else if (scores.avoidant >= 6) {
    archetype = "Lone Wolf"
}
else {
    archetype = "Grounded Navigator" // default
}
```

**The 8 Archetypes:**

| Archetype | Pattern | Image |
|-----------|---------|-------|
| **Grounded Navigator** | Can sit with difficult feelings without being overwhelmed or shutting down. Good boundaries. Emotional flexibility. | `archetype-1-grounded-navigator.png` |
| **Emotional Enthusiast** | Feels everything deeply. Worries about being "too much." Amplifies signals to make sure they're not missed. Fears abandonment. | `archetype-2-emotional-enthusiast.png` |
| **Heartfelt Defender** | Shows the polished version. Hides the messy parts. Performs competence to stay lovable. | `archetype-5-heartfelt-defender.png` |
| **Passionate Pilgrim** | Wants to belong completely. Goes all-in. Merges with others to feel whole. | `archetype-7-passionate-pilgrim.png` |
| **Lone Wolf** | Values space and freedom. Self-reliant. Withdraws under stress to stay safe. | `archetype-3-lone-wolf.png` |
| **Chill Conductor** | Lives in the head. Understands but doesn't feel. Intellectualizes to stay in control. | `archetype-6-chill-conductor.png` |
| **Independent Icon** | Prides on not needing anyone. Dismisses vulnerability as weakness. Maintains fierce independence. | `archetype-8-independent-icon.png` |
| **Mystery Mosaic** | Sometimes craves closeness, sometimes pushes away. The attachment system itself is conflicted—wanting and fearing connection at once. | `archetype-4-mystery-mosaic.png` |

**User Action:** Answer all 8 questions → "Get Results" button appears and auto-scrolls into view

**Data Captured:**
```javascript
state.casArchetype = "Heartfelt Defender"
state.casAnswers = {
    'q1': 1, // Selected option index for question 1
    'q2': 1,
    // ... etc
}
```

---

### Loading Screen
**Purpose:** Show progress while AI generates response

**Display:**
- Full-screen dark overlay
- Selected affect icon as large (80% width) background image at 10% opacity
- Text: "Generating your response..."

**Backend Processing:** (See [AI Processing Pipeline](#ai-processing-pipeline) below)

---

### Screen 4: Results
**Purpose:** Display personalized therapeutic insight

**Display:**

1. **Transformation Header**
   - Caption: "FROM CONFUSION → TO CLARITY"
   - Heading: "Now you can see it."

2. **Terrain Section** (Cinematic card)
   - Full-width background: CAS archetype cubist image (400px height, 85% opacity)
   - Dark diagonal gradient overlay for text readability
   - Text overlaid at bottom:
     - Caption: "YOUR TERRAIN"
     - Archetype name (36px bold, white with text shadow)
     - Archetype description (18px, max-width 600px)

3. **AI Response** (3 paragraphs)
   - Paragraph 1: What this affect is doing right now
   - Paragraph 2: How your CAS terrain shapes it
   - Paragraph 3: What this means / next step

4. **Share Buttons**
   - Twitter
   - Facebook
   - Copy Link

5. **Start Over** button

**Data Displayed:**
- CAS archetype name + image + description
- AI-generated therapeutic response (3 paragraphs)

---

## Data Collection Pipeline

### Complete User Input Package

When "Get Results" is clicked, the following data structure is sent to the backend:

```javascript
{
    affectName: "Anger",               // String: Selected affect name
    context: "My relationship with...", // String: Freeform user input
    direction: "other",                 // String: 'self'|'other'|'past'|'future'
    intensity: 3,                       // Number: 1-4
    casArchetype: "Heartfelt Defender" // String: Calculated archetype name
}
```

### Data Validation

**Frontend Checks:**
- Context must be non-empty string
- Direction must be selected (one of 4 options)
- Intensity must be selected (1-4)
- All 8 CAS questions must be answered

**Backend Checks:**
- All parameters present
- Types validated (string, number as expected)

---

## AI Processing Pipeline

### Stage 1: Therapeutic Response Generation

**Endpoint:** Cloud Function `generateTherapeuticResponse`
**Model:** Google Gemini 2.5 Flash
**Temperature:** 0.7 (balanced creativity/consistency)

#### System Prompt Structure

The system prompt has 3 main sections:

**1. Core Identity**
```
You are a translator of the body's whispered language—a guide who helps
people recognize what they already know but haven't yet found words for.

Core Philosophy: "Your body already knows. We're not teaching you what to
feel—we're revealing what's already moving through you, asking to be seen."
```

**2. The 9 Affects (Biological Mechanism Descriptions)**

Each affect includes:
- **Biological trigger** - What neural firing pattern causes it
- **Purpose** - What it's trying to do
- **Experience** - How it feels in the body
- **Metaphorical language** - Embodied descriptions
- **Common misreadings** - What people get wrong

Example for **Anger**:
```
ANGER (Anger-Rage)
- Biology: Response to obstacle/violation—mobilizes attack/defense
- Purpose: To clear the obstacle, restore boundary, discharge the pressure
- Experience: Mobilization, heat, pressure, readiness to act
- Metaphor: "Fire spreading, blood boiling, fists clenching, jaw tight"
- Common misreading: "I'm a bad person for feeling this" vs "Something
  crossed my line and my body is mobilizing to handle it"
```

**3. Response Structure Rules**

The AI must generate exactly 3 paragraphs:

**Paragraph 1: What This Affect Is Doing**
- Name the affect and explain what it does biologically
- Connect to the specific context user provided
- Use embodied language, not clinical terms
- Make them feel SEEN (not diagnosed)

**Paragraph 2: How Your Terrain Shapes It**
- Explain how their CAS archetype processes this affect differently
- Show why same affect = different experience for different archetypes
- Name their pattern without shame
- Only included if `casArchetype` is present

**Paragraph 3: What This Means**
- Synthesize the insight
- Offer a "different move" (agency, not prescription)
- Use naturalistic language
- End with possibility, not diagnosis

#### User Prompt Structure

```
**User Input:**
- Selected Affect: Anger
- Context: "My relationship with my boss"
- Direction: other
- Intensity: 3
- CAS Terrain: Heartfelt Defender

**CRITICAL REQUIREMENT**: Every single input above MUST meaningfully shape
your response. Changing ANY of these variables should produce a DIFFERENT
response:
- Different context → completely different analysis
- Different direction (self vs other vs past vs future) → changes where
  the affect is aimed
- Different intensity (1 vs 4) → dramatically changes how it's experienced
- Different CAS terrain → changes the pattern of how they handle it
```

#### Direction-Specific Language

The AI uses different language based on `direction`:

- **self**: "turned inward on yourself, watching yourself, checking if you're doing it right"
- **other**: "aimed at them, about what they're bringing, what they're doing or not doing"
- **past**: "looking backward, still holding it, not finished yet"
- **future**: "scanning ahead, bracing for what's coming, rehearsing danger"

#### Intensity-Specific Language

- **1**: "background signal, you can still function, but it's there"
- **2**: "steady presence, follows you through the day, persistent"
- **3**: "drowning out other signals, demanding attention, hard to ignore"
- **4**: "nothing else can get through, overwhelming, flooding your system"

### Stage 2: Copywriting Pass (Readability Enhancement)

**Purpose:** Convert therapeutic response to 9th grade reading level while maintaining all insights

**Model:** Google Gemini 2.5 Flash
**Temperature:** 0.7

#### Copywriting Prompt

```
You are a skilled copywriter specializing in therapeutic content. Rewrite
the following response with these goals:

1. Reading Level: 9th grade maximum (simpler words, shorter sentences)
2. Story & Flow: Flow like a story someone is telling you, not clinical
3. Emotional Connection: Keep poetic language but more accessible
4. Maintain Structure: Keep 3-paragraph structure intact
5. Keep Key Elements: Don't lose Tomkins theory, context, or CAS insights
6. More Conversational: Like talking to a friend, not a textbook

Guidelines:
- Replace complex words with simpler ones (e.g., "mobilizes" → "gets you ready")
- Break long sentences into shorter ones
- Use "you" and "your" frequently
- Keep metaphors but make them clearer
- Maintain exact same meaning and insights, just more readable

**Original Response:**
[Stage 1 output here]
```

#### Fallback Behavior

If Stage 2 fails for any reason:
- Return Stage 1 output unchanged
- Log error to console
- User still receives therapeutic response

### Final Output Structure

```javascript
{
    response: "Anger is your body's way of saying... [3 paragraphs]...",
    metadata: {
        stage1_complete: true,
        stage2_complete: true,
        model: "gemini-2.5-flash",
        timestamp: "2024-12-11T..."
    }
}
```

---

## Technical Architecture

### Frontend Stack

**Technology:** Vanilla JavaScript (no framework)
**Styling:** Custom CSS with CSS variables
**Hosting:** Firebase Hosting

**Key Files:**
- `/public/index.html` - Single-page app (1,300+ lines)
- `/public/admin.html` - Admin panel for reviewing submissions
- `/public/icons/` - 9 custom PNG affect icons
- `/public/src/assets/images/` - 8 cubist archetype images

**State Management:**
```javascript
const state = {
    selectedAffect: null,        // Index 0-8
    selectedAffectName: '',      // "Anger", "Joy", etc.
    context: '',                 // User's freeform text
    direction: null,             // 'self'|'other'|'past'|'future'
    intensity: null,             // 1-4
    casAnswers: {},              // {q1: 0, q2: 1, ...}
    casArchetype: null           // "Heartfelt Defender", etc.
}
```

### Backend Stack

**Technology:** Firebase Cloud Functions (Node.js)
**AI Model:** Google Gemini 2.5 Flash via Generative Language API
**Database:** Cloud Firestore

**Key Files:**
- `/functions/src/index.ts` - Cloud Function definitions
- `/functions/package.json` - Dependencies

**Cloud Functions:**

1. **`generateTherapeuticResponse`** (HTTPS Callable)
   - Input: `{affectName, context, direction, intensity, casArchetype}`
   - Processing: Two-stage AI generation
   - Output: `{response: string}`
   - Error handling: Try/catch with fallback messages

**Environment Variables:**
```bash
GEMINI_API_KEY=<Google AI API key>
```

### Database Schema

**Collection:** `submissions`

**Document Structure:**
```javascript
{
    affectName: "Anger",
    context: "My relationship with my boss",
    direction: "other",
    intensity: 3,
    casArchetype: "Heartfelt Defender",
    response: "[AI generated response]",
    timestamp: Firestore.Timestamp,
    userId: null // Anonymous for now
}
```

**Purpose:**
- Track usage patterns
- Review user inputs via admin panel
- Analyze common affect/archetype combinations
- Quality assurance

**Admin Access:**
- Google Sign-In required
- Authorized emails only (configurable in admin.html)
- Can view, filter, and export submissions

---

## Security & Privacy

### Data Privacy

**What We Store:**
- Affect selection
- Context text (freeform input)
- Direction, intensity
- CAS archetype
- AI-generated response
- Timestamp

**What We DON'T Store:**
- Names
- Email addresses
- IP addresses
- Device identifiers
- Location data

**Anonymity:** All submissions are anonymous. No user authentication required for main app.

### API Security

**Cloud Functions:**
- CORS enabled for web app domain only
- Rate limiting via Firebase defaults
- Input validation on all parameters

**AI API:**
- API key stored as environment variable (not in code)
- Requests go through Firebase Cloud Functions (never client-side)
- Gemini API key has usage quotas

### Admin Panel Security

**Authentication:**
- Google Sign-In required
- Authorized email list hardcoded:
```javascript
const AUTHORIZED_EMAILS = [
    'your-email@example.com'
];
```

**Access Control:**
- Read-only access to submissions
- No edit or delete capabilities
- Can download CSV exports

---

## Data Flow Summary

### Complete Pipeline Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│ USER JOURNEY                                                     │
└─────────────────────────────────────────────────────────────────┘

Screen 1: Introduction
    ↓ [Click Begin]

Screen 2: Select Affect (9 options)
    → State: selectedAffect, selectedAffectName
    ↓ [Click Continue]

Screen 3: Context + Direction + Intensity
    → State: context, direction, intensity
    ↓ [Click Continue]

Screen 3b: CAS Assessment (8 questions)
    → Calculate archetype from scores
    → State: casArchetype
    ↓ [Click Get Results]

Loading Screen
    → Display selected affect icon at 10% opacity
    ↓

┌─────────────────────────────────────────────────────────────────┐
│ BACKEND PROCESSING                                               │
└─────────────────────────────────────────────────────────────────┘

Firebase Cloud Function: generateTherapeuticResponse
    ↓
[Stage 1] Build System Prompt
    - 9 affects with biological mechanisms
    - Response structure rules
    ↓
[Stage 1] Build User Prompt
    - Include all 5 user inputs
    - Critical requirement for uniqueness
    ↓
[Stage 1] Call Gemini 2.5 Flash API
    - Temperature: 0.7
    - Generate therapeutic response (3 paragraphs)
    ↓
[Stage 2] Copywriting Pass
    - Rewrite for 9th grade reading level
    - Maintain all insights
    - Fallback to Stage 1 if fails
    ↓
[Storage] Save to Firestore 'submissions' collection
    ↓
[Return] Send response to frontend
    ↓

┌─────────────────────────────────────────────────────────────────┐
│ RESULTS DISPLAY                                                  │
└─────────────────────────────────────────────────────────────────┘

Screen 4: Results
    → Show transformation header
    → Display terrain card with cubist archetype image
    → Render 3-paragraph AI response
    → Share buttons
    → Start Over option
```

---

## Key Algorithms

### CAS Archetype Calculation

**Input:** 8 question answers (each worth 2 points to various buckets)

**Logic:**
1. Initialize all score buckets to 0
2. For each of 8 answers, add points to appropriate buckets
3. Determine archetype using priority rules:
   - Disorganized (Mystery Mosaic) wins if ≥6 points
   - Secure (Grounded Navigator) wins if ≥8 points
   - Otherwise, highest anxious variant wins
   - Otherwise, highest avoidant variant wins
   - Default to Grounded Navigator

**Code Location:** `index.html` line ~1070-1140

### Affect Icon Display

**Mapping:**
```javascript
const affects = [
    { name: 'Curiosity', icon: 'icons/lahzo_0003_interest.png', metaphors: [...] },
    { name: 'Joy', icon: 'icons/lahzo_0006_joy.png', metaphors: [...] },
    // ... 7 more
]
```

**Render:** Dynamic card generation with:
- 64x64px PNG icon
- Affect name
- First 2 metaphors shown

### Loading Screen Icon

**Logic:**
```javascript
// Get selected affect's icon path
const selectedAffectIcon = affects[state.selectedAffect].icon;

// Set as loading screen background
document.getElementById('loadingIcon').src = selectedAffectIcon;
```

---

## Version History

### Version 3.0 (Current)
- Custom PNG icons (replaced Lucide)
- Cinematic archetype display with background images
- Info modal explaining embodied metaphor
- Pitch deck content integration
- Simplified Screen 1
- Removed results header (cleaner presentation)

### Version 2.0
- Two-stage AI processing (therapeutic + copywriting)
- Enhanced system prompts with poetic language
- CAS assessment progress feedback
- Intensity and direction influence on responses

### Version 1.0
- Basic affect selection
- Single AI pass
- Simple archetype display
- Firestore integration

---

## Maintenance & Auditing

### Regular Checks

1. **Review Submissions** (Admin Panel)
   - Check for inappropriate inputs
   - Verify AI response quality
   - Identify common patterns

2. **Monitor AI Costs**
   - Gemini API usage
   - Firebase Functions invocations
   - Firestore read/write operations

3. **Test User Flow**
   - Complete full journey quarterly
   - Verify all 9 affects work
   - Test all 8 archetypes calculate correctly

### Known Limitations

1. **Single Affect Only** - Users select one affect, not a triad (intentional design choice)
2. **No User Accounts** - All submissions anonymous
3. **No Response History** - Users can't view past results
4. **English Only** - No internationalization
5. **Mobile-First** - Optimized for 320px-640px screens

---

## Contact & Support

**Project Owner:** Scott Conkright, Psy.D.
**Technical Lead:** [To be filled]
**Deployment URL:** https://realness-score.web.app

---

*End of Pipeline Documentation*
