# Sauce.txt Integration Proposal
**Aligning the App with Core Philosophy**

**Date:** December 11, 2025
**Status:** Proposal - Awaiting Approval

---

## Core Problem Identified

The current implementation doesn't fully embody the "Feel It, Don't Think It" philosophy:

### Issues:
1. ❌ **Using "feeling" language before results** - Asking "How does your body feel?" (cognitive framing)
2. ❌ **Clinical affect descriptions** - "tight, alert, braced" instead of embodied metaphor clusters
3. ❌ **Missing "Your body already knows" philosophy** - Not trusting bodily recognition
4. ❌ **No CAS terrain** - Missing the "why you handle it this way" attachment style layer
5. ❌ **Incomplete affect theory** - Not deeply addressing each affect's full architecture

---

## Sauce.txt Core Principles to Weave In

### 1. **Recognition, Not Translation**
```
"We don't ask you to name what you feel.
We let your body recognize itself."
```

### 2. **Embodied Metaphors**
```
Instead of "Rate how angry you feel," we present:
"Blood boiling, pressure building, heat rising, ready to explode"
```

### 3. **Body Language (Not Feeling Language)**
```
BEFORE results: "sits in your body", "what's happening in your body"
AFTER results: "feelings", "emotions" (clinical language is OK)
```

### 4. **The Promise**
```
"Your body already knows. You don't have to find the words.
We'll help you see what it's been trying to tell you."
```

### 5. **Weather + Terrain**
```
Weather = WHAT (the affect)
Terrain = WHY (how you handle it - CAS attachment style)
Direction = WHERE (aimed at self/other/past/future)
Volume = HOW LOUD (intensity 1-4)
```

---

## Proposed Changes

### Phase 1: Language Shifts (High Priority)

#### **Screen 1: Intro**
**Current:**
```
"What are you really feeling?"
"Understand how your body reveals true feeling."
```

**Proposed:**
```
"What's happening inside you right now?"
"Your body already knows. We'll help you see it."
```

#### **Screen 2: Affect Selection**
**Current:**
```
"How does your body feel?"
"Select the affect that best matches what you're experiencing."
```

**Proposed:**
```
"What sits in your body right now?"
"Your body already knows. Just recognize what's true."
```

#### **Screen 3: Context Gathering**
**Current:**
```
"Tell us more about this feeling"
```

**Proposed:**
```
"What's this connecting to?"
```

---

### Phase 2: Embodied Metaphor Descriptions (High Priority)

#### **Current Affect Descriptions** (Clinical)
```javascript
{ name: 'Curiosity', description: 'leaning in, focused, drawn toward it' }
{ name: 'Fear', description: 'tight, alert, braced, scanning for danger' }
{ name: 'Anger', description: 'hot, pressured, ready to push back' }
```

#### **Proposed Affect Descriptions** (Embodied Metaphors from Sauce.txt)

```javascript
const affects = [
  {
    name: 'Curiosity',
    metaphors: [
      'leaning in toward something',
      'pulled forward',
      'tracking movement',
      'eyes focused and bright'
    ]
  },
  {
    name: 'Joy',
    metaphors: [
      'chest expanding',
      'warmth spreading',
      'softening',
      'opening up'
    ]
  },
  {
    name: 'Surprise',
    metaphors: [
      'breath catching',
      'suddenly jolted',
      'paused mid-step',
      'interrupted'
    ]
  },
  {
    name: 'Fear',
    metaphors: [
      'heart racing',
      'blood running cold',
      'frozen in place',
      'braced for impact'
    ]
  },
  {
    name: 'Anger',
    metaphors: [
      'blood boiling',
      'pressure building',
      'heat rising',
      'ready to explode'
    ]
  },
  {
    name: 'Sadness',
    metaphors: [
      'weight pressing down',
      'sinking',
      'drowning',
      'can\'t catch breath'
    ]
  },
  {
    name: 'Disgust',
    metaphors: [
      'recoiling',
      'pulling back fast',
      'wanting to spit it out',
      'nausea rising'
    ]
  },
  {
    name: 'Withdrawing',
    metaphors: [
      'stepping back',
      'creating distance',
      'turning away',
      'closing the door'
    ]
  },
  {
    name: 'Dropping',
    metaphors: [
      'want to disappear',
      'feeling small',
      'can\'t face anyone',
      'shrinking'
    ]
  }
];
```

**UI Change:** Show metaphors as bullet points or flowing text, not just a single description line.

---

### Phase 3: System Prompt Enhancement (High Priority)

#### **Add Sauce.txt Philosophy to System Prompt**

**Insert at beginning of system prompt:**

```
# Your Core Identity

You are a translator of embodied experience for "Feel It, Don't Think It."

Core Philosophy:
- The user's body already knows
- You're not teaching them what to feel
- You're revealing what they're already experiencing
- Recognition, not translation
- Function over pathology
- Agency without bypassing

The Language Rule:
- Users arrive through BODY RECOGNITION (embodied metaphors)
- You translate that into AFFECT THEORY (Tomkins)
- Then reveal the PATTERN (why they handle it this way)
- Finally offer AGENCY (a different move)

This isn't: "You're feeling X"
This is: "Your body is signaling X. Here's what that means and why you're handling it the way you are."
```

#### **Enhance Each Affect's Theory Section**

For each affect, add:
- **Embodied metaphor cluster** (how people recognize it)
- **Tomkins trigger mechanism** (what activates it)
- **Biological function** (what it's for)
- **Common misinterpretations** (what people get wrong)
- **The opening move** (leverage point)

**Example for Fear:**

```
**4. Fear** (Tomkins: Fear-Terror)

Embodied Recognition (how users arrive):
- "Heart racing", "blood running cold", "frozen in place", "braced for impact"
- "Scanning for danger", "ready to run", "body on high alert"

Tomkins Trigger:
- High, sustained level of neural firing (density remains elevated)
- Brain perceives THREAT (real or anticipated)
- System mobilizes for escape or freeze

Biological Function:
- Protection through heightened alertness
- Mobilization for flight or freeze
- NOT prophecy - it's a preparation system, not a prediction system

Common Misinterpretations:
- "I'm afraid, so the danger must be real" (confusing signal with reality)
- "If I feel fear, I must be weak" (confusing function with failure)
- "I need to eliminate fear to be safe" (confusing signal with problem)

The Opening Move:
- Separate "I feel fear" from "I am in danger"
- Let fear inform preparation without hijacking worth
- Use fear's alertness function without letting it write the story
```

---

### Phase 4: Multi-Stage Flow with CAS (Medium Priority)

#### **Problem:** Missing "Why you handle it this way" (The Terrain)

From sauce.txt:
```
"Same weather, different terrain. Different path forward."
```

#### **Proposed Addition: CAS Assessment (Optional 4th Stage)**

**New Flow:**
1. **Screen 1**: Intro - "Your body already knows"
2. **Screen 2**: Affect Selection - Embodied metaphor recognition
3. **Screen 3**: Context Gathering - What/direction/intensity
4. **Screen 3b**: CAS Brief Assessment (NEW - optional)
5. **Screen 4**: Results - Weather + Terrain + Opening

#### **Screen 3b: CAS Assessment (8 Quick Questions)**

**Prompt:**
```
"Now let's see why you handle it the way you do.
These aren't right or wrong - just patterns."
```

**Sample Questions** (Choose 3 that feel most relevant based on affect):
1. When things get intense, I tend to: [Pull away / Move closer]
2. In relationships, I usually: [Show the polished version / Show everything]
3. My instinct under stress is: [Figure it out alone / Seek support / Analyze it]
4. I'm most afraid of: [Being abandoned / Being trapped / Being exposed]
5. When I feel vulnerable, I: [Hide it / Share it / Intellectualize it]
6. I think needing people is: [Normal / A weakness / Risky]
7. Strong emotions make me want to: [Express them / Control them / Escape them]
8. I handle conflict by: [Withdrawing / Engaging / Performing / Analyzing]

**Output:** One of 8 CAS Archetypes
- Grounded Navigator (Secure)
- Emotional Enthusiast (Anxious Preoccupied)
- Heartfelt Defender (Anxious Adaptive Perfectionist)
- Passionate Pilgrim (Anxious Merging)
- Lone Wolf (Avoidant Dismissive)
- Chill Conductor (Avoidant Intellectualizer)
- Independent Icon (Avoidant Counterphobic)
- Mystery Mosaic (Disorganized)

---

### Phase 5: Results Screen Enhancement (Medium Priority)

#### **Add "Terrain" Section to Results**

**Current Results:**
```
[Affect Name]
[Context + Direction + Intensity]
[3-Paragraph AI Response]
[Share Buttons]
```

**Proposed Results:**
```
[Affect Name] - "The Weather"

[Context + Direction + Intensity]

[YOUR TERRAIN] - NEW SECTION
"You're a [CAS Archetype]. Here's why you handle it this way:
[2-3 sentences about their pattern]"

[3-Paragraph AI Response] - Now includes terrain-specific guidance

[Share Buttons]
```

#### **System Prompt Update for Terrain Integration**

Add CAS-specific pattern language to Paragraph 2:

```
**Paragraph 2: Pattern Recognition (with CAS Terrain)**

[IF CAS AVAILABLE]
"Given your [CAS ARCHETYPE] terrain, here's how you're processing this [AFFECT]:
[CAS-SPECIFIC PATTERN]. This pattern makes sense because [WHY THIS ARCHETYPE
AMPLIFIES/DAMPENS THIS AFFECT]. Most people don't realize [HIDDEN DYNAMIC]."

Example (Fear + Heartfelt Defender):
"Given your Heartfelt Defender terrain, here's how you're processing this fear:
You're experiencing it as a threat to your adequacy. Your instinct is to hide
the fear and perform confidence, because showing vulnerability feels like
revealing you're 'not enough.' At intensity 3, this fear is drowning out your
ability to focus on content - you're using all your energy to manage how you appear."
```

---

### Phase 6: Ensure Each Affect Theory is Properly Addressed (High Priority)

#### **Current Issue:** System prompt has affect definitions but doesn't ensure deep engagement

#### **Proposed Solution:** Add "Affect-Specific Guidance" section to system prompt

For each affect, provide:
1. **What users get wrong** about this affect
2. **The core misunderstanding** to address
3. **The leverage point** specific to this affect
4. **Language to avoid** (stigmatizing, pathologizing)
5. **Language to use** (functional, empowering)

**Example: Shame/Dropping**

```
**Shame (Dropping) - Special Considerations**

What Users Get Wrong:
- "I feel shame because I AM shameful" (confusing signal with identity)
- "Shame means I did something wrong" (confusing affect with morality)

Core Misunderstanding:
Shame is NOT about self-worth. It's about INTERRUPTED POSITIVE AFFECT.
Tomkins: "Shame is the affect of indignity, of defeat, of transgression,
and of alienation." It signals that interest or joy was interrupted.

The Leverage Point:
Help them see what got interrupted, not what's wrong with them.
"What were you reaching for when you got dropped?"

Language to Avoid:
- "Your shame is telling you you're not good enough" ❌
- "You need to work on your self-esteem" ❌
- "Let go of shame" ❌

Language to Use:
- "Dropping signals that positive affect was interrupted" ✓
- "Something you were reaching for got blocked" ✓
- "This isn't about your worth - it's about connection that got cut off" ✓
```

---

## Implementation Priority

### **MUST DO (Phase 1-3)**
1. ✅ Change all "feeling" language to embodied terms BEFORE results
2. ✅ Update affect descriptions to embodied metaphor clusters
3. ✅ Enhance system prompt with sauce.txt philosophy
4. ✅ Add affect-specific guidance to ensure proper theory coverage

### **SHOULD DO (Phase 4-5)**
5. 🔄 Add CAS assessment stage (optional - user can skip)
6. 🔄 Integrate terrain into results and system prompt

### **NICE TO HAVE (Phase 6)**
7. 📋 A/B test metaphor variations
8. 📋 Track which metaphors resonate most per affect
9. 📋 Progressive disclosure (show 3-4 metaphors, expand to show all)

---

## Technical Considerations

### **Multi-Stage Flow with CAS**
- Add screen 3b between context and results
- 8-question CAS assessment (~30 seconds)
- Store CAS result in state
- Pass to Cloud Function with other data

### **System Prompt Token Impact**
- Current: ~3,500 tokens
- With sauce.txt philosophy + affect-specific guidance: ~4,500 tokens
- With CAS integration: ~5,000 tokens
- Still well within Gemini's context window

### **Frontend Changes**
- Update all copy (10-15 text strings)
- Restructure affect cards to show metaphor bullets
- Add optional CAS screen
- Update results display

### **Backend Changes**
- Add CAS logic to system prompt
- Enhance affect-specific guidance
- Update response templates

---

## Expected Outcomes

### **User Experience**
1. ✅ "How do you know me better than I know myself?" moments
2. ✅ Recognition without vocabulary requirement
3. ✅ Understanding of WHY they handle it this way (not just WHAT)
4. ✅ Feels like being seen, not diagnosed

### **Response Quality**
1. ✅ More personalized (terrain-specific guidance)
2. ✅ Deeper theoretical grounding (full affect theory)
3. ✅ More actionable (terrain-informed leverage points)
4. ✅ Better aligned with app philosophy

---

## Questions for Approval

1. **Multi-stage with CAS?** Do we add the CAS assessment as a 4th stage, or save that for later?

2. **Metaphor display?** Show all 4 metaphors per affect, or start with 1-2 and expand?

3. **Required vs Optional CAS?** If we add CAS, is it required or skippable?

4. **Gradual rollout?** Start with language changes + metaphors (Phase 1-3), then add CAS (Phase 4-5)?

---

## Recommended Approach

### **Sprint 1: Foundation (This Week)**
- ✅ Change all language to embodied terms
- ✅ Update affect descriptions to metaphor clusters
- ✅ Enhance system prompt with sauce.txt philosophy
- ✅ Add affect-specific guidance

### **Sprint 2: Terrain (Next Week)**
- 🔄 Design CAS assessment flow
- 🔄 Build CAS question logic
- 🔄 Integrate CAS into system prompt
- 🔄 Update results display

### **Sprint 3: Refinement (Following Week)**
- 📋 A/B test metaphor variations
- 📋 Collect user feedback
- 📋 Refine based on data
- 📋 Document learnings

---

## Next Step

**Decision Required:** Which phases should we implement first?

**Recommendation:** Start with **Phase 1-3** (language + metaphors + prompt enhancement), then evaluate whether to add CAS in Phase 4-5.

This gives us the biggest philosophical alignment with lowest complexity, then we can layer in terrain if users need it.

**Ready to proceed?**
