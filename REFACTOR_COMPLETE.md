# Complete Refactor: Single-Affect Analysis Model

## Status: ✅ COMPLETE (Requires Deploy)

All code has been refactored and built successfully. **You need to authenticate and deploy:**

```bash
firebase login --reauth
firebase deploy --only functions
firebase deploy --only hosting
```

---

## What Changed: Breaking Refactor (No Backwards Compatibility)

### New User Flow

**OLD (Sorting 9 Affects):**
1. Intro
2. Enter subject
3. Sort all 9 affects from strongest to weakest
4. Results with triad analysis

**NEW (Single-Affect Selection):**
1. Intro
2. **Select ONE affect** (9 clickable cards)
3. **Context gathering**: What/who + Direction (self/other/past/future) + Intensity (1-4)
4. **Tomkins-grounded analysis**: 3 paragraphs (~150 words)

---

## Files Changed

### 1. **SYSTEM_PROMPT_V2.md** (NEW)
- Comprehensive Tomkins-grounded system prompt
- 9 affects with full Tomkins definitions
- 3-paragraph output structure
- Direction & intensity interpretation rules
- Worked examples
- **Location**: `/Users/danielcrowder/Desktop/Projects/Assessment/SYSTEM_PROMPT_V2.md`

### 2. **public/index.html** (COMPLETE REFACTOR)
**Backup created**: `public/index.html.backup`

**New Screens:**
- **Screen 2**: Affect selection (9 cards, 2 columns mobile / 3 columns desktop)
- **Screen 3**: Context gathering (text input + 4 direction buttons + 4 intensity buttons)
- **Screen 4**: Results display (affect name + context + AI response)

**Removed:**
- Drag-and-drop sorting
- Multi-affect selection
- Weather section
- Music section
- CAS element display
- Valence scoring

**New State Object:**
```javascript
const state = {
    selectedAffect: null,
    selectedAffectName: '',
    context: '',
    direction: null,  // 'self' | 'other' | 'past' | 'future'
    intensity: null   // 1 | 2 | 3 | 4
};
```

### 3. **functions/src/index.ts** (NEW FUNCTION ADDED)
**New Function**: `generateTherapeuticResponse`

**Inputs:**
```typescript
{
    affectName: string,    // One of the 9 affects
    context: string,       // "my mother", "work", etc.
    direction: string,     // 'self' | 'other' | 'past' | 'future'
    intensity: number      // 1-4
}
```

**Output:**
```typescript
{
    response: string,      // 3 paragraphs separated by \n\n
    affectName: string,
    context: string,
    direction: string,
    intensity: number
}
```

**System Prompt Includes:**
- Full Tomkins theoretical foundation
- All 9 affects with triggers, functions, somatic markers
- S-A-R sequences explanation
- Direction-specific interpretations
- Intensity calibration language
- Word count enforcement (135-165 words)

---

## The 9 Affects (User-Facing Names)

All aligned to Tomkins' original definitions:

1. **Curiosity** → Tomkins: Interest-Excitement
2. **Joy** → Tomkins: Enjoyment-Joy
3. **Surprise** → Tomkins: Surprise-Startle
4. **Fear** → Tomkins: Fear-Terror
5. **Anger** → Tomkins: Anger-Rage
6. **Sadness** → Tomkins: Distress-Anguish
7. **Disgust** → Tomkins: Disgust
8. **Withdrawing** → Tomkins: Dissmell
9. **Dropping** → Tomkins: Shame-Humiliation

---

## Technical Details

### Frontend Changes
- **Affect Selection**: Cards with icons, names, descriptions
- **Visual Feedback**: Selected cards get white border
- **Direction Buttons**: 4 buttons in 2x2 grid
  - "Pointed at myself" (self)
  - "Pointed at someone else" (other)
  - "About the past" (past)
  - "About the future" (future)
- **Intensity Buttons**: 4 buttons with labels
  - 1: "Quiet hum"
  - 2: "Steady presence"
  - 3: "Loud and insistent"
  - 4: "Overwhelming"

### Backend Changes
- **New Firebase Function**: `generateTherapeuticResponse`
- **Model**: Gemini 2.5 Flash (same as before)
- **Prompt Length**: ~3500 tokens (comprehensive Tomkins theory)
- **Response Format**: JSON with `response` field
- **Error Handling**: Validates all inputs, falls back gracefully

### Firestore
- **No changes required** - Single-affect model doesn't need the old affect combinations collection
- Old `affectCombinations` collection is now unused (can be archived/deleted)

---

## Testing Checklist

After deploying, test:

1. **Screen 1 → 2**: Click "Begin" navigates to affect selection
2. **Affect Selection**:
   - Click each of 9 cards
   - Verify visual feedback (white border)
   - Verify "Continue" button appears
3. **Context Screen**:
   - Enter text in "What or who is this about?"
   - Select direction button
   - Select intensity button
   - Verify "Get Results" button enables
4. **Results**:
   - Click "Get Results"
   - Verify loading overlay
   - Verify 3-paragraph response appears
   - Verify affect name and context displayed
   - Check response quality (Tomkins language, specific to context)
5. **Share Buttons**: Twitter, Facebook, Copy
6. **Start Over**: Resets all state

---

## Example Usage Flow

**User Journey:**
1. Selects **Fear** (sees description: "tight, alert, braced, scanning for danger")
2. Enters context: **"tomorrow's presentation"**
3. Selects direction: **Future** ("About the future")
4. Selects intensity: **3** ("Loud and insistent")

**AI Response (Example):**

> **Your body is signaling Fear.** This shows up as tightness in your chest, rapid heartbeat, scanning for danger, bracing for impact. According to Tomkins, fear is triggered by high, sustained neural activation when your brain perceives threat. When you think about tomorrow's presentation, your system is mobilizing for anticipated danger: judgment, failure, exposure.

> **Here's what's happening beneath the surface:** This fear is pointed at the future - you're anticipating what might go wrong. At intensity level 3 (loud and insistent), it's demanding your attention and making it hard to focus on preparation. The volume tells us your nervous system sees this as a significant threat, not just mild concern.

> **The opening is here:** According to Tomkins, fear's biological function is protection through alertness, not through avoidance. Your fear is doing its job - mobilizing you to prepare. If you can let the fear sharpen your focus without triggering freeze or flee, it becomes useful information rather than a hijacker. This isn't about eliminating the fear - it's about letting it serve its protective function without letting it write the story about tomorrow's outcome.

---

## What Got Removed (Intentionally)

- **Multi-affect sorting**: Too cognitively demanding, users struggled
- **Weather metaphors**: Generic, didn't add value
- **Music suggestions**: Off-brand, distracted from affect work
- **CAS element codes**: Confusing to users
- **Valence scoring**: Not grounded in Tomkins theory
- **Icon detection from subject**: Unnecessary with single-affect model
- **Pronouns and subject normalization**: Not needed for new flow

---

## What to Keep Monitoring

1. **Response Quality**: Check that AI consistently:
   - Uses Tomkins language (gradients, density, S-A-R sequences)
   - Stays within word count (135-165 words)
   - Provides specific, actionable leverage points
   - Matches intensity to language (doesn't suggest complex work at intensity 4)

2. **User Experience**:
   - Affect selection: Are users finding their primary affect easily?
   - Context input: Are users providing enough detail?
   - Direction/Intensity: Are these intuitive?

3. **Technical**:
   - Function latency (Gemini response time)
   - Error rates
   - Word count violations (track in logs)

---

## Deploy Commands

```bash
# 1. Re-authenticate (if needed)
firebase login --reauth

# 2. Deploy functions
firebase deploy --only functions

# 3. Deploy hosting (frontend)
firebase deploy --only hosting

# 4. Or deploy both at once
firebase deploy
```

---

## Rollback Plan (If Needed)

If you need to rollback:

```bash
# Restore old frontend
cp public/index.html.backup public/index.html
firebase deploy --only hosting

# Backend functions
# (Old functions still exist - detectIconAndPronouns, personalizeApproach, etc.)
# Just don't call generateTherapeuticResponse from frontend
```

---

## Next Steps

1. **Deploy** (see commands above)
2. **Test end-to-end** (use the checklist)
3. **Collect user feedback** on:
   - Affect selection clarity
   - Response quality and relevance
   - "How do you know me?" moments
4. **Monitor**:
   - Gemini token usage
   - Response word counts
   - User completion rates

---

## Files Summary

**Created:**
- `SYSTEM_PROMPT_V2.md` - Full system prompt documentation
- `public/index.html.backup` - Backup of old version
- `REFACTOR_COMPLETE.md` - This file

**Modified:**
- `public/index.html` - Complete refactor
- `functions/src/index.ts` - Added `generateTherapeuticResponse`

**Unchanged:**
- `functions/src/index.ts` - Old functions still exist (detectIconAndPronouns, personalizeApproach, getSpotifyTrack, generateImage, getPrompts)
- Firebase config
- Environment variables
- Firestore data (no migration needed)

---

## Key Innovation

**From**: "Sort 9 affects and get triad analysis"
**To**: "Select ONE affect, add context, get Tomkins-grounded personalized insight"

**Why This Works:**
- **Lower cognitive load**: Choosing 1 affect vs. sorting 9
- **More context**: Direction + intensity = richer analysis
- **Deeper insight**: Single-affect focus allows more specific therapeutic response
- **Tomkins-grounded**: Uses his actual language and theoretical framework
- **Personalized**: AI synthesizes affect + context + direction + intensity into unique response

---

## Core Philosophy

This refactor embodies the app's tagline: **"Feel It, Don't Think It"**

Instead of asking users to cognitively analyze and rank all 9 affects (thinking), we ask:
1. **What's loudest right now?** (embodied recognition)
2. **What's it connecting to?** (context)
3. **Where's it pointed?** (direction)
4. **How loud is it?** (intensity)

Then AI translates what the body already knows using Tomkins' affect theory.

---

## Build Status

✅ **Frontend**: Refactored and ready
✅ **Backend**: Built successfully
✅ **System Prompt**: Documented in SYSTEM_PROMPT_V2.md
⏳ **Deploy**: Awaiting `firebase deploy`
⏳ **Test**: After deploy

---

**Total Lines Changed**: ~1600 lines across 3 files
**Breaking Changes**: Yes (complete flow refactor)
**Backwards Compatible**: No
**Ready to Deploy**: Yes (after `firebase login --reauth`)
