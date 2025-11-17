# Realness Score Assessment App – Full Specification (v2)
© Dr. Scott Conkright

This document defines the complete specification for building the **Realness Score** assessment as a single-page web app using **vanilla HTML, CSS, and JavaScript**, with data modeled in JSON and questions grouped exactly as in the Realness Score workbook.

---

## 1. Brand, Concept, and Tone

### 1.1 Product Name and Tagline
- **Product Name:** The Realness Score
- **Tagline:** *A brief affect-based profile of how you feel, show, protect, and connect.*

### 1.2 Brand Personality
- Emotionally intelligent, calm, and grounded.
- Clinical enough to feel serious, but warm enough to feel human.
- Precise and introspective rather than fluffy or inspirational.

### 1.3 Visual Direction
- **Theme:** Dark, modern, minimal.
- **Background:** Deep charcoal or near-black (#050608 to #101218).
- **Primary Text:** Off-white (#F5F5F5) for headings and main copy.
- **Secondary Text:** Muted gray (#A0A4AF).
- **Accent Color:** A desaturated teal or cyan (e.g., #4FD1C5) for highlights, active states, and section labels.
- **Error / Warning:** Desaturated rose (#F56565) used sparingly for validation and warnings.
- **Dividers / Cards:** Subtle borders (#222633) and soft shadows.

### 1.4 Typography
- **Font:** Clean geometric or humanist sans-serif (e.g., system stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Hierarchy:**
  - H1 (app title): 28–32px, semi-bold.
  - H2 (section headers): 20–24px, medium.
  - Body: 14–16px, regular.
  - Labels / helper text: 12–14px, medium.

### 1.5 Layout and Components
- Single-column layout, max-width ~960px, centered.
- Generous vertical spacing between question groups.
- Questions rendered inside lightly bordered cards with:
  - Question text
  - Inline 1–5 rating controls
- Collapsible domain sections (A–D) to reduce scroll fatigue.
- Sticky or anchored “Submit / See My Archetype” button at bottom of viewport on mobile.

### 1.6 Footer
Every view should show a tiny, tasteful copyright line at the bottom:
> `© Dr. Scott Conkright`

Use 11–12px size and muted gray.

---

## 2. Assessment Structure (As in the Excel Workbook)

The Realness Score uses 40 items organized into 4 domains (subscales), mirroring the workbook:

- **A. Noticing Your Feelings**  (Affect Self-Contact) – Items **1–10**
- **B. Showing Your Real Self** (Authentic Expression) – Items **11–20**
- **C. How You Protect Yourself** (Self-Consciousness Defense Patterns) – Items **21–30**
- **D. How You Connect With Others** (Relational Stance / Attachment–Self-Consciousness) – Items **31–40**

Each item is rated on a 1–5 Likert scale:

- 1 – Not at all true of me  
- 2 – Slightly true of me  
- 3 – Somewhat true of me  
- 4 – Mostly true of me  
- 5 – Very true of me  

---

## 3. Questions by Domain (From Excel Structure)

### 3.1 Domain A – Noticing Your Feelings (Items 1–10)

Description: *How well you notice and handle your feelings.*

1. **I can notice emotions in my body.**  
2. **When I feel uncomfortable, I act okay.**  
3. **I show excitement naturally when something matters.**  
4. **I shut down my feelings when I feel exposed.**  
5. **I can show anger or disappointment without losing control.**  
6. **I act cheerful so people don’t think I’m difficult.**  
7. **When I’m hurt, I can ask for help.**  
8. **I pull away from people before they can reject me.**  
9. **I enjoy good moments without expecting bad things.**  
10. **I use humor or confidence to hide real feelings.**

---

### 3.2 Domain B – Showing Your Real Self (Items 11–20)

Description: *How well your outside matches your inside.*

11. **When I’m scared, I tell someone.**  
12. **I explain myself too much when I feel judged.**  
13. **I notice embarrassment without attacking myself.**  
14. **I use work or helping others to avoid my feelings.**  
15. **I feel like the same person inside and outside.**  
16. **I worry that showing feelings will burden people.**  
17. **I can say no without feeling guilty.**  
18. **I use humor or charm to hide tough feelings.**  
19. **I say what I need instead of hinting.**  
20. **I act competent to avoid feeling exposed.**

---

### 3.3 Domain C – How You Protect Yourself (Items 21–30)

Description: *How you react when you feel watched or judged.*

21. **I shut down emotionally when I feel judged.**  
22. **I blame others to avoid feeling discomfort.**  
23. **I try to impress people to avoid criticism.**  
24. **I hold back opinions to avoid conflict.**  
25. **I go numb when someone gets too close.**  
26. **I move into perfectionism when I feel self-conscious.**  
27. **I hide mistakes because being wrong feels unbearable.**  
28. **I use criticism or sarcasm to cover insecurity.**  
29. **I disconnect from people when I feel exposed.**  
30. **I ruin good situations because they make me too visible.**

---

### 3.4 Domain D – How You Connect With Others (Items 31–40)

Description: *How you usually act in close relationships.*

31. **I rely on others without fear.**  
32. **I worry people will leave if I’m not emotionally available.**  
33. **I feel safer depending on myself.**  
34. **My reactions in relationships swing quickly.**  
35. **I trust that conflict can be repaired.**  
36. **I watch for signs that people are pulling away.**  
37. **Too much closeness makes me uncomfortable.**  
38. **I can’t predict how I’ll react in close situations.**  
39. **I feel understood by at least one or two people.**  
40. **I get overwhelmed when someone wants more closeness than I can handle.**

---

## 4. Scoring Model

### 4.1 Domain Sums

For each domain:

- **A_sum = sum(items 1–10)**
- **B_sum = sum(items 11–20)**
- **C_sum = sum(items 21–30)**
- **D_sum = sum(items 31–40)**

Each item is 1–5, so each subscale range is 10–50.

### 4.2 Level Conversion (Low/Medium/High)

Convert raw subscale sums to 3-level scores:

- 10 to 23 → **Level 1 (Low)**
- 24 to 36 → **Level 2 (Medium)**
- 37 to 50 → **Level 3 (High)**

Result:

- `A_level`, `B_level`, `C_level`, `D_level` each ∈ {1, 2, 3}

---

## 5. JSON Data Model

The app should treat all core data (questions, scales, archetypes) as JSON so it can be reused for other front-ends or API services.

### 5.1 Global Config JSON

```json
{
  "meta": {
    "name": "Realness Score",
    "tagline": "A brief affect-based profile of how you feel, show, protect, and connect.",
    "version": "1.0.0",
    "author": "Dr. Scott Conkright"
  },
  "scaleLevels": {
    "low": { "min": 10, "max": 23, "level": 1 },
    "medium": { "min": 24, "max": 36, "level": 2 },
    "high": { "min": 37, "max": 50, "level": 3 }
  },
  "domains": [
    {
      "id": "A",
      "name": "Noticing Your Feelings",
      "description": "How well you notice and handle your feelings.",
      "itemRange": [1, 10]
    },
    {
      "id": "B",
      "name": "Showing Your Real Self",
      "description": "How well your outside matches your inside.",
      "itemRange": [11, 20]
    },
    {
      "id": "C",
      "name": "How You Protect Yourself",
      "description": "How you react when you feel watched or judged.",
      "itemRange": [21, 30]
    },
    {
      "id": "D",
      "name": "How You Connect With Others",
      "description": "How you usually act in close relationships.",
      "itemRange": [31, 40]
    }
  ]
}
```

### 5.2 Questions JSON

```json
{
  "questions": [
    { "id": 1, "domain": "A", "text": "I can notice emotions in my body." },
    { "id": 2, "domain": "A", "text": "When I feel uncomfortable, I act okay." },
    { "id": 3, "domain": "A", "text": "I show excitement naturally when something matters." },
    { "id": 4, "domain": "A", "text": "I shut down my feelings when I feel exposed." },
    { "id": 5, "domain": "A", "text": "I can show anger or disappointment without losing control." },
    { "id": 6, "domain": "A", "text": "I act cheerful so people don’t think I’m difficult." },
    { "id": 7, "domain": "A", "text": "When I’m hurt, I can ask for help." },
    { "id": 8, "domain": "A", "text": "I pull away from people before they can reject me." },
    { "id": 9, "domain": "A", "text": "I enjoy good moments without expecting bad things." },
    { "id": 10, "domain": "A", "text": "I use humor or confidence to hide real feelings." },

    { "id": 11, "domain": "B", "text": "When I’m scared, I tell someone." },
    { "id": 12, "domain": "B", "text": "I explain myself too much when I feel judged." },
    { "id": 13, "domain": "B", "text": "I notice embarrassment without attacking myself." },
    { "id": 14, "domain": "B", "text": "I use work or helping others to avoid my feelings." },
    { "id": 15, "domain": "B", "text": "I feel like the same person inside and outside." },
    { "id": 16, "domain": "B", "text": "I worry that showing feelings will burden people." },
    { "id": 17, "domain": "B", "text": "I can say no without feeling guilty." },
    { "id": 18, "domain": "B", "text": "I use humor or charm to hide tough feelings." },
    { "id": 19, "domain": "B", "text": "I say what I need instead of hinting." },
    { "id": 20, "domain": "B", "text": "I act competent to avoid feeling exposed." },

    { "id": 21, "domain": "C", "text": "I shut down emotionally when I feel judged." },
    { "id": 22, "domain": "C", "text": "I blame others to avoid feeling discomfort." },
    { "id": 23, "domain": "C", "text": "I try to impress people to avoid criticism." },
    { "id": 24, "domain": "C", "text": "I hold back opinions to avoid conflict." },
    { "id": 25, "domain": "C", "text": "I go numb when someone gets too close." },
    { "id": 26, "domain": "C", "text": "I move into perfectionism when I feel self-conscious." },
    { "id": 27, "domain": "C", "text": "I hide mistakes because being wrong feels unbearable." },
    { "id": 28, "domain": "C", "text": "I use criticism or sarcasm to cover insecurity." },
    { "id": 29, "domain": "C", "text": "I disconnect from people when I feel exposed." },
    { "id": 30, "domain": "C", "text": "I ruin good situations because they make me too visible." },

    { "id": 31, "domain": "D", "text": "I rely on others without fear." },
    { "id": 32, "domain": "D", "text": "I worry people will leave if I’m not emotionally available." },
    { "id": 33, "domain": "D", "text": "I feel safer depending on myself." },
    { "id": 34, "domain": "D", "text": "My reactions in relationships swing quickly." },
    { "id": 35, "domain": "D", "text": "I trust that conflict can be repaired." },
    { "id": 36, "domain": "D", "text": "I watch for signs that people are pulling away." },
    { "id": 37, "domain": "D", "text": "Too much closeness makes me uncomfortable." },
    { "id": 38, "domain": "D", "text": "I can’t predict how I’ll react in close situations." },
    { "id": 39, "domain": "D", "text": "I feel understood by at least one or two people." },
    { "id": 40, "domain": "D", "text": "I get overwhelmed when someone wants more closeness than I can handle." }
  ]
}
```

### 5.3 Archetypes JSON (16 Types)

Each archetype has:

- `id`
- `name`
- `shortTag`
- `levels` – target A/B/C/D levels (1–3)
- `description`
- `mostCompatible`
- `leastCompatible`
- `imagePrompt`

```json
{
  "archetypes": [
    {
      "id": 1,
      "name": "The Resonant Sage",
      "shortTag": "Wise Regulator",
      "levels": { "A": 3, "B": 3, "C": 1, "D": 3 },
      "description": "Deep-feeling, steady, and emotionally grounded.",
      "mostCompatible": "The Soft Anchor",
      "leastCompatible": "The Iron Mask",
      "imagePrompt": "A calm guardian carved from shadowed stone, soft light glowing inside their chest, standing alone in a field at dusk, realistic, dark muted palette, subtle inner glow, highly detailed."
    },
    {
      "id": 2,
      "name": "The Soft Anchor",
      "shortTag": "Warm Stabilizer",
      "levels": { "A": 3, "B": 2, "C": 1, "D": 3 },
      "description": "Gentle, steady, and nurturing in relationships.",
      "mostCompatible": "The Resonant Sage",
      "leastCompatible": "The Stormbound",
      "imagePrompt": "A figure sitting on a weathered pier over dark water at sunset, soft light around them, posture relaxed and inviting, semi-realistic, moody but warm atmosphere."
    },
    {
      "id": 3,
      "name": "The Stormbound",
      "shortTag": "Hidden Storm",
      "levels": { "A": 3, "B": 1, "C": 3, "D": 1 },
      "description": "Feels intensely inside but stays guarded and overwhelmed.",
      "mostCompatible": "The Truth Teller",
      "leastCompatible": "The Soft Anchor",
      "imagePrompt": "A person made of swirling storm clouds, faint lightning under the skin, seated in a dim room, shafts of light from a single window, cinematic realism, dramatic shadows."
    },
    {
      "id": 4,
      "name": "The Truth Teller",
      "shortTag": "Blunt Realist",
      "levels": { "A": 3, "B": 3, "C": 2, "D": 1 },
      "description": "Emotionally aware and radically honest, sometimes too sharp.",
      "mostCompatible": "The Stormbound",
      "leastCompatible": "The Gentle Ghost",
      "imagePrompt": "A figure speaking into the dark, words forming visible glowing lines in the air, sharp edges of light, high contrast, realistic style with a slightly surreal twist."
    },
    {
      "id": 5,
      "name": "The Open Flame",
      "shortTag": "Impulsive Feeler",
      "levels": { "A": 2, "B": 3, "C": 1, "D": 2 },
      "description": "Expressive and passionate, quick to feel and show emotions.",
      "mostCompatible": "The Inner Compass",
      "leastCompatible": "The Fortress-Keeper",
      "imagePrompt": "A person surrounded by small floating sparks in a dark room, eyes bright, mid-motion as if laughing or talking, warm highlights against deep shadow, expressive realism."
    },
    {
      "id": 6,
      "name": "The Magnetic Poet",
      "shortTag": "Soul Storyteller",
      "levels": { "A": 3, "B": 3, "C": 2, "D": 3 },
      "description": "Emotionally articulate, romantic, and deeply sensitive.",
      "mostCompatible": "The Quiet Depth",
      "leastCompatible": "The Mirror Mask",
      "imagePrompt": "A lone figure writing at a desk lit by a single lamp, pages drifting into faint glowing symbols, dark room, rich shadows, painterly realistic style."
    },
    {
      "id": 7,
      "name": "The Mirror Mask",
      "shortTag": "Social Chameleon",
      "levels": { "A": 2, "B": 3, "C": 3, "D": 2 },
      "description": "Reads the room fast and adjusts their emotional display.",
      "mostCompatible": "The Quiet Depth",
      "leastCompatible": "The Magnetic Poet",
      "imagePrompt": "A person holding a half-mirror mask, one eye visible and observant, reflections of other faces in the mask surface, cool tones, realistic with subtle surreal reflections."
    },
    {
      "id": 8,
      "name": "The Boundary Breaker",
      "shortTag": "Radical Sharer",
      "levels": { "A": 2, "B": 3, "C": 1, "D": 3 },
      "description": "Open, intense, and quick to share deeply and directly.",
      "mostCompatible": "The Fortress-Keeper",
      "leastCompatible": "The Stormbound",
      "imagePrompt": "Two figures facing each other in a dark space, one pouring glowing light from their chest toward the other, bold and intimate, realistic style, strong contrast."
    },
    {
      "id": 9,
      "name": "The Iron Mask",
      "shortTag": "Locked Down",
      "levels": { "A": 1, "B": 1, "C": 3, "D": 1 },
      "description": "Emotionally shut down, highly self-protective, hard to read.",
      "mostCompatible": "The Boundary Breaker",
      "leastCompatible": "The Resonant Sage",
      "imagePrompt": "A figure in a smooth dark metal mask, eyes hidden, standing against a black background, faint cracks with tiny light leaking through, hyperreal texture."
    },
    {
      "id": 10,
      "name": "The Strategist",
      "shortTag": "Controlled Planner",
      "levels": { "A": 2, "B": 2, "C": 3, "D": 1 },
      "description": "Thinks before feeling, manages emotions through logic.",
      "mostCompatible": "The Open Flame",
      "leastCompatible": "The Boundary Breaker",
      "imagePrompt": "A person at a table covered in maps and diagrams lit from above, expression calm and focused, everything else fading into darkness, realistic, clean lines."
    },
    {
      "id": 11,
      "name": "The Gentle Ghost",
      "shortTag": "Quiet Withdrawer",
      "levels": { "A": 1, "B": 1, "C": 3, "D": 2 },
      "description": "Pulls back softly when overwhelmed, avoids conflict.",
      "mostCompatible": "The Magnetic Poet",
      "leastCompatible": "The Truth Teller",
      "imagePrompt": "A faint, semi-transparent figure walking down a dim hallway, edges blurred into the shadows, soft cool tones, melancholic but peaceful realism."
    },
    {
      "id": 12,
      "name": "The Fortress-Keeper",
      "shortTag": "Guarded Loyalist",
      "levels": { "A": 2, "B": 1, "C": 3, "D": 3 },
      "description": "Slow to trust but fiercely loyal once you are inside.",
      "mostCompatible": "The Boundary Breaker",
      "leastCompatible": "The Open Flame",
      "imagePrompt": "A tall stone gate in the night with a single warm light deep inside, heavy doors slightly open, realistic stone texture, moody sky above."
    },
    {
      "id": 13,
      "name": "The Quiet Depth",
      "shortTag": "Selective Intimate",
      "levels": { "A": 2, "B": 2, "C": 1, "D": 3 },
      "description": "Private but deeply loyal and emotionally present with a few.",
      "mostCompatible": "The Magnetic Poet",
      "leastCompatible": "The Strategist",
      "imagePrompt": "A person sitting by a dark lake at night, stars reflected in the water, posture relaxed and turned slightly away, subtle glow on the shoreline, serene realism."
    },
    {
      "id": 14,
      "name": "The Open Seeker",
      "shortTag": "Connection Explorer",
      "levels": { "A": 2, "B": 3, "C": 2, "D": 3 },
      "description": "Actively looks for meaningful connection and new emotional experiences.",
      "mostCompatible": "The Resonant Sage",
      "leastCompatible": "The Iron Mask",
      "imagePrompt": "A traveler standing at a crossroads under a twilight sky, paths lit with soft lanterns, figure looking ahead with curiosity, detailed and atmospheric."
    },
    {
      "id": 15,
      "name": "The Tethered Caretaker",
      "shortTag": "Self-Losing Helper",
      "levels": { "A": 1, "B": 2, "C": 2, "D": 3 },
      "description": "Takes care of others first and often forgets their own needs.",
      "mostCompatible": "The Inner Compass",
      "leastCompatible": "The Truth Teller",
      "imagePrompt": "A person wrapping a glowing bandage around someone else’s arm, their own arm faintly cracked and dim, warm and sad at the same time, realistic style."
    },
    {
      "id": 16,
      "name": "The Inner Compass",
      "shortTag": "Centered Guide",
      "levels": { "A": 2, "B": 2, "C": 2, "D": 3 },
      "description": "Balanced between independence and closeness, steady and clear.",
      "mostCompatible": "The Open Flame",
      "leastCompatible": "The Gentle Ghost",
      "imagePrompt": "A figure standing in a dark space with a softly glowing compass in their hands, light illuminating their face, calm expression, grounded, hyperreal detail."
    }
  ]
}
```

---

## 6. Classification Algorithm (Pseudocode / JS)

### 6.1 Steps

1. Collect responses for items 1–40, each from 1–5.  
2. Compute A_sum, B_sum, C_sum, D_sum.  
3. Convert each sum to a level (1–3) using thresholds.  
4. For each archetype, compute Manhattan distance in level space:
   - `distance = |A_level - levels.A| + |B_level - levels.B| + |C_level - levels.C| + |D_level - levels.D|`
5. Choose the archetype with the smallest distance.
6. If there is a tie, choose the archetype with the lowest `id`.

### 6.2 Example JS

```js
function levelFromScore(score) {
  if (score <= 23) return 1;
  if (score <= 36) return 2;
  return 3;
}

function classifyArchetype(A_level, B_level, C_level, D_level, archetypes) {
  let best = null;
  let minDist = Infinity;

  archetypes.forEach((t) => {
    const dist =
      Math.abs(A_level - t.levels.A) +
      Math.abs(B_level - t.levels.B) +
      Math.abs(C_level - t.levels.C) +
      Math.abs(D_level - t.levels.D);

    if (dist < minDist) {
      minDist = dist;
      best = t;
    }
  });

  return best;
}
```

---

## 7. UI Behavior and Flow

### 7.1 Initial State
- Header with product name, tagline, and short description.
- Collapsible sections for A, B, C, D.
- Each question appears as:
  - Question text
  - A 1–5 horizontal scale (radio buttons or pill-shaped selectable buttons).
- **Progress indicator:** Display "Question X of 40" prominently.
- **Domain completion status:** Show visual indicators (checkmarks or progress bars) for each completed domain section.
- Disabled "See My Realness Archetype" button until all 40 questions are answered.

### 7.2 Progress Tracking & Data Persistence
- **Progress indicator:** Show current question number (e.g., "Question 15 of 40") and overall completion percentage.
- **Domain completion status:** Visual indicators showing which domains (A, B, C, D) are complete.
- **Save progress:** Automatically save responses to `localStorage` as user answers questions.
- **Resume capability:** On page load, check `localStorage` for saved progress and allow user to resume from where they left off.
- **Retake assessment:** Provide a "Retake Assessment" button on results page that clears saved data and restarts the assessment.
- **Single result storage:** Store only the most recent result in `localStorage` (no multiple result comparison).

### 7.3 Email Collection (Before Results)
- **Required step:** Before showing results, collect user email address.
- Display a clean email collection form with:
  - Email input field
  - Submit button
  - Brief explanation: "Enter your email to receive your Realness Score results"
- Validate email format before proceeding.
- Store email (for analytics/email list purposes) before displaying results.

### 7.4 On Answer Completion
- Validate that each question has a numeric value 1–5.
- If incomplete:
  - Show a small, subtle error banner:  
    *"Please answer all questions to see your Realness Archetype."*
- If complete:
  - Show email collection form (see 7.3).
  - After email submission:
    - Compute sums, levels, and best archetype.
    - Animate smooth scroll to the Results section with transition effects.

### 7.5 Results Section
Show:

- **Archetype Title:**  
  `You are The [Archetype Name]`
- **Short Tag:**  
  e.g., `Wise Regulator`
- **Description:**  
  e.g., `Deep-feeling, steady, and emotionally grounded.`
- **Subscale Profile with Visualizations:**
  - Visual charts/graphs for domain scores (bar charts or radial charts).
  - Progress bars for each domain level (visual representation of Low/Medium/High).
  - A – Noticing Your Feelings: `[A_sum] (Level [A_level])`
  - B – Showing Your Real Self: `[B_sum] (Level [B_level])`
  - C – How You Protect Yourself: `[C_sum] (Level [C_level])`
  - D – How You Connect With Others: `[D_sum] (Level [D_level])`
- **Compatibility section:**
  - Most compatible archetype (with link to learn more)
  - Challenging match archetype (with link to learn more)
  - Visual representation of archetype compatibility (compatibility scores displayed)
- **Expandable sections:** Allow users to expand/collapse detailed archetype information.
- **Archetype Image:** Display pre-generated archetype image (see Section 12).
- **Image Prompt box:**
  - Label: "Image prompt for your archetype"
  - Show the `imagePrompt` string in a copyable text area or readonly input.
- **Retake Assessment button:** Allow users to retake the assessment.
- **Links:**
  - Link to Dr. Conkright's website/resources
  - "Learn more" about the methodology link

---

## 8. Animations & Transitions

### 8.1 Smooth Transitions
- **Question transitions:** Smooth fade/slide animations when moving between questions or sections.
- **Results reveal:** Animated reveal of results (fade in, slide up, or similar effect).
- **Micro-interactions:** 
  - Subtle hover effects on rating buttons.
  - Click/tap feedback animations.
  - Smooth transitions when selecting rating values.
- **Section expansion:** Smooth expand/collapse animations for domain sections.

### 8.2 Animation Guidelines
- Keep animations subtle and purposeful (not distracting).
- Use CSS transitions where possible for performance.
- Ensure animations respect user preferences (prefers-reduced-motion media query).

---

## 9. Viral & Sharing Features

### 9.1 Social Sharing
- **Shareable image cards:** Generate Open Graph (OG) images for each archetype result that include:
  - Archetype name
  - Short tag
  - Description
  - Visual representation/graphic
- **Direct share buttons:** Include share buttons for:
  - Twitter/X
  - Facebook
  - LinkedIn
  - Native share API (for mobile devices)
- **Shareable URLs:** Encode results in URL parameters so shared links can display results directly.
  - Format: `?archetype=[id]&A=[level]&B=[level]&C=[level]&D=[level]`
  - On page load, check for URL parameters and display results if valid.

### 9.2 Share Functionality Implementation
- Generate shareable text: "I'm The [Archetype Name] - [Short Tag]. Discover your Realness Score: [URL]"
- Copy-to-clipboard functionality for sharing links.
- Track sharing events for analytics (see Section 16).

---

## 10. Comparison Features

### 10.1 Archetype Comparison
- **Compare with friends:** Allow users to enter archetype codes or share links to compare results.
- **Compatibility scores:** Display numerical compatibility scores between archetypes based on level differences.
- **Visual comparison:** Show side-by-side comparison of:
  - Domain levels
  - Compatibility indicators
  - Relationship dynamics

### 10.2 Statistics & Distribution
- **Most common archetype stats:** Display anonymized statistics showing:
  - Most common archetype (percentage)
  - Distribution across all 16 archetypes
  - Domain level distributions
- Update statistics dynamically as more users complete the assessment.
- Ensure all statistics are anonymized (no personal data).

---

## 11. Results Visualization

### 11.1 Visual Charts & Graphs
- **Domain score charts:** 
  - Bar charts showing raw scores (10-50 range) for each domain.
  - Color-coded by level (Low/Medium/High).
- **Progress bars:** Visual progress bars for each domain level (1-3 scale).
- **Compatibility visualization:** 
  - Visual representation showing compatibility between user's archetype and others.
  - Compatibility scores displayed visually (e.g., percentage bars, compatibility meters).

### 11.2 Chart Implementation
- Use SVG or Canvas for charts (vanilla JS charting library or custom implementation).
- Ensure charts are responsive and accessible.
- Include chart labels and legends for clarity.

---

## 12. Image Generation

### 12.1 Image Generation Requirements
- **API Integration:** Integrate with image generation API (DALL-E, Midjourney, Stable Diffusion, or similar).
- **Master Style:** All archetype images must include the style: **"Pen and Ink mixed with water color"**
- **Build-time generation:** Generate all 16 archetype images once during build time (not at runtime).
- **Image storage:** Store generated images as static assets in the app.
- **Image display:** Display the appropriate archetype image on results page.

### 12.2 Image Prompt Enhancement
- Append master style to each archetype's `imagePrompt`:
  - Original prompt + ", Pen and Ink mixed with water color"
- Example: `"A calm guardian carved from shadowed stone, soft light glowing inside their chest, standing alone in a field at dusk, realistic, dark muted palette, subtle inner glow, highly detailed, Pen and Ink mixed with water color"`

### 12.3 Image Usage
- Use generated images in:
  - Results page display
  - Shareable OG images
  - Comparison views
- Ensure images are optimized for web (appropriate file size, format).

---

## 13. Mobile Experience

### 13.1 Touch-Friendly Controls
- **Rating controls:** 
  - Large, touch-friendly buttons for 1-5 rating selection.
  - Swipe gestures for rating selection (optional enhancement).
  - Tap-friendly interface (minimum 44x44px touch targets).
- **Responsive design:** 
  - Optimized for both portrait and landscape orientations.
  - Adaptive layout that works well in both orientations.
- **Mobile-specific UI:**
  - Sticky submit button at bottom of viewport.
  - Collapsible sections work smoothly on touch devices.
  - Smooth scrolling and touch interactions.

### 13.2 Mobile Considerations
- No PWA/offline capability required.
- Ensure all features work on mobile browsers (iOS Safari, Chrome Mobile, etc.).

---

## 14. SEO & Meta Tags

### 14.1 Meta Tags for Social Sharing
- **Open Graph tags:** Include OG tags for each archetype:
  - `og:title`: "The Realness Score - You are The [Archetype Name]"
  - `og:description`: Archetype description
  - `og:image`: Archetype-specific OG image
  - `og:url`: Shareable URL with encoded results
  - `og:type`: "website"
- **Twitter Card tags:** Include Twitter Card meta tags for better Twitter sharing.
- **Structured data (JSON-LD):** Include JSON-LD structured data for search engines:
  - Organization schema
  - WebApplication schema
  - Assessment/Quiz schema (if applicable)

### 14.2 Dynamic Meta Tags
- Update meta tags dynamically based on user's archetype result.
- Ensure each archetype has unique OG image and meta description.

---

## 15. Accessibility

### 15.1 Screen Reader Optimizations
- **ARIA labels:** Proper ARIA labels for all interactive elements.
- **Semantic HTML:** Use semantic HTML elements (`<header>`, `<main>`, `<section>`, `<nav>`, etc.).
- **Form labels:** All form inputs have associated labels.
- **Radio groups:** Properly grouped and labeled radio button groups.
- **Alt text:** Descriptive alt text for all images and charts.

### 15.2 Accessibility Requirements
- No specific keyboard navigation requirements beyond standard browser behavior.
- No high contrast mode required.
- No font size adjustment controls required.
- Ensure visible focus states for keyboard navigation.

---

## 16. Analytics

### 16.1 Tracking Requirements
- **Completion rates:** Track how many users start vs. complete the assessment.
- **Archetype distribution:** Track anonymized distribution of archetype results.
- **Sharing events:** Track when users share results (which platform, which archetype).
- **Email collection:** Track email collection completion rate.

### 16.2 Analytics Implementation
- Use analytics service (Google Analytics, Plausible, or similar).
- Ensure all tracking is privacy-compliant and anonymized.
- Track events:
  - Assessment started
  - Assessment completed
  - Email collected
  - Results shared (with platform)
  - Archetype result (anonymized)

---

## 17. Call-to-Action & Links

### 17.1 Email Collection
- **Required before results:** Collect email address before showing results (see Section 7.3).
- **Purpose:** Build email list for follow-up communication.
- **Privacy:** Include privacy notice about email usage.

### 17.2 External Links
- **Dr. Conkright's website:** Include link to Dr. Conkright's website/resources.
- **Methodology link:** Include "Learn more about the methodology" link with explanation of the Realness Score approach.
- **Placement:** Include links in:
  - Footer
  - Results page
  - About/Info section

---

## 18. Implementation Notes (Vanilla JS Only)

- No frameworks (no React, Vue, Angular, etc.).
- Use:
  - `<style>` in the `<head>` or a single `style.css`.
  - `<script>` at the bottom of `<body>` or single `script.js`.
- Keep data (questions, domains, archetypes) in JavaScript objects / JSON structures.
- Favor:
  - Functions like `renderQuestions()`, `collectResponses()`, `computeScores()`, `classifyArchetype()`, `renderResults()`.
- Use semantic HTML elements where possible:
  - `<header>`, `<main>`, `<section>`, `<footer>`, `<button>`, `<fieldset>`, `<legend>`, etc.
- Accessibility:
  - Ensure radio groups are labeled.
  - Provide visible focus states.

---

## 19. Footer

At the bottom of the page, always display in small, muted text:

> `© Dr. Scott Conkright`

Font size: 11–12px  
Color: same muted gray as secondary text (#A0A4AF).

Include links to:
- Dr. Conkright's website/resources
- Learn more about the methodology

---

## 20. Summary of Key Features

### Required Features:
1. ✅ Email collection before results display
2. ✅ Progress tracking (question counter, domain completion)
3. ✅ Save/resume functionality (localStorage)
4. ✅ Smooth animations and transitions
5. ✅ Visual charts/graphs for domain scores
6. ✅ Shareable image cards (OG images)
7. ✅ Social sharing buttons (Twitter/X, Facebook, LinkedIn)
8. ✅ Shareable URLs with encoded results
9. ✅ Archetype comparison features
10. ✅ Compatibility scores visualization
11. ✅ Anonymized archetype distribution statistics
12. ✅ Pre-generated archetype images (build-time, Pen and Ink + watercolor style)
13. ✅ Touch-friendly mobile controls (portrait & landscape)
14. ✅ SEO meta tags and structured data
15. ✅ Screen reader optimizations
16. ✅ Analytics tracking (completion, distribution, sharing)
17. ✅ Links to Dr. Conkright's website and methodology info
18. ✅ Retake assessment functionality

### Not Required:
- Copy-paste text results (optional)
- Loading states (not specified)
- Multiple result storage/comparison
- PWA/offline capability
- Keyboard navigation requirements
- High contrast mode
- Font size adjustments
- Print-friendly version
- Performance optimization requirements

---

This Markdown document can be used directly as a **prompt for a code-generation model** (e.g., Claude, GPT-based coders, Cursor, or other tools) to implement the Realness Score app exactly as described, using only vanilla HTML, CSS, and JavaScript.
