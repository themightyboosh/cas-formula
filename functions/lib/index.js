"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrompts = exports.generateTherapeuticResponse = exports.generateImage = exports.getSpotifyTrack = exports.personalizeApproach = exports.detectIconAndPronouns = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const generative_ai_1 = require("@google/generative-ai");
const admin = __importStar(require("firebase-admin"));
const cors = require("cors");
const vertexai_1 = require("@google-cloud/vertexai");
admin.initializeApp();
// Enable CORS for all origins
const corsHandler = cors({ origin: true });
// Initialize Gemini with API key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables');
}
const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
/**
 * Cloud Function 1: Detect Icon and Pronouns
 * Uses GEMINI_PROMPT_1_ICON_PRONOUN.md
 * Called on Screen 2 when user enters their subject
 */
exports.detectIconAndPronouns = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const { subject } = req.body.data || req.body;
            if (!subject || typeof subject !== 'string') {
                res.status(400).json({ error: 'Subject is required and must be a string' });
                return;
            }
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            // System prompt from GEMINI_PROMPT_1_ICON_PRONOUN.md
            const systemPrompt = `You are an AI assistant for the "Feel it, Don't Think It" affect assessment app. Your task is to analyze the user's subject (a person, place, thing, concept, or situation) and return:

1. **A semantic icon match** from the Lucide icon library
2. **The appropriate pronouns** for the subject
3. **The subject type** classification
4. **A grammatically normalized version** of the subject for use in "When I think about [X]..."

Be empathetic, creative, and flexible in your analysis. Use loose semantic matching for icons - focus on emotional resonance and metaphorical meaning rather than literal matches.

## Output Format

You MUST respond with ONLY a valid JSON object (no markdown, no explanations):

\`\`\`json
{
  "icon": "lucide-icon-name",
  "pronouns": "she/her" | "he/him" | "they/them" | "it",
  "subjectType": "person" | "place" | "thing" | "concept" | "relationship",
  "normalizedSubject": "grammatically correct subject text"
}
\`\`\`

## Icon Selection Guidelines

**BE CREATIVE AND FLEXIBLE** - Choose icons that capture the emotional essence, not just the literal meaning. Use metaphorical and symbolic associations. Don't be afraid to make unexpected connections.

**Examples of loose/creative matching:**
- "anxiety" → "cloud" (turbulent energy)
- "depression" → "droplet" (heavy, persistent)
- "excitement" → "zap" (electric energy)
- "my future" → "compass" (direction, navigation)
- "change" → "wind" (invisible force)
- "therapy" → "flower" (growth, healing)
- "grief" → "droplet" (tears, heaviness)
- "hope" → "sun" (new light)
- "nature" → "leaf" (organic, natural)
- "animals" → "waves" (flowing, living energy)

**Available Icons (STRICT LIST - use ONLY these):**

**People & Relationships:**
heart, users, user, baby, smile, frown

**Work & Career:**
briefcase, building, laptop, coffee, pencil

**Places:**
home, map-pin, plane, map, globe, mountain

**Objects & Possessions:**
car, book, music, phone, camera, gift, package

**Nature & Elements:**
sun, moon, cloud, wind, droplet, flame, leaf, flower, waves

**Emotions & States:**
heart, sparkles, brain, shield, smile, frown, zap

**Movement & Change:**
trending-up, trending-down, arrow-right, compass, move

**Time & Process:**
calendar, clock, hourglass

**Communication:**
message-circle, mail, phone

**Abstract Concepts:**
lightbulb, key, lock, target, flag

**CRITICAL: You MUST use one of these exact icon names. NO VARIATIONS or compound names allowed. These are the ONLY valid icons - do not use tree, landmark, navigation, timer, megaphone, puzzle, alert-triangle, or meh as they may not be supported. Keep it simple and use only the base icons listed above.**

## Pronoun Detection Guidelines

**she/her:**
- "my mother", "my sister", "my daughter", "my girlfriend", "my wife"
- "Sarah", "Emily" (clearly feminine names)
- Explicitly female-identified people

**he/him:**
- "my father", "my brother", "my son", "my boyfriend", "my husband"
- "John", "Michael" (clearly masculine names)
- Explicitly male-identified people

**they/them:**
- "my partner" (gender-neutral)
- "my friend" (when gender unclear)
- "my sibling"
- Names that don't clearly indicate gender
- Groups of people ("my team", "my family")

**it:**
- All non-human subjects: places, things, concepts, situations
- Jobs/careers ("my job", "my career")
- Objects ("my car", "my house")
- Abstract concepts ("my anxiety", "moving to Seattle")

## Subject Type Classification

**person** - Individual human being (my mother, John, my therapist)
**place** - Location or destination (Seattle, my house, the office)
**thing** - Physical object (my car, my phone, my dog)
**concept** - Abstract idea or feeling (my anxiety, success, failure, change)
**relationship** - Dynamic between people (my relationship with X, my marriage)

## Normalized Subject Guidelines

Transform the user's input into grammatically correct text that flows naturally in the sentence "When I think about [normalizedSubject] my body feels like it's..."

**Examples:**
- "my mom" → "my mom" (already correct)
- "seattle" → "Seattle" (capitalize proper nouns)
- "moving to seattle" → "moving to Seattle"
- "my anxiety" → "my anxiety" (keep as-is if correct)
- "the job" → "the job"
- "girlfriend" → "my girlfriend" (add possessive if missing and contextually appropriate)
- "future" → "the future" (add article if needed)
- "therapy session" → "therapy sessions" or "therapy" (singular/plural as appropriate)

Keep it natural and conversational. Fix obvious grammar/capitalization issues but preserve the user's intent and voice.

## Important Rules

1. **ALWAYS output valid JSON only** - no explanations, no markdown code blocks
2. **Be creative with icons** - use loose metaphorical matching, emotional resonance
3. **Default to "it"** when pronoun is unclear
4. **Normalize grammar naturally** - fix capitalization, add articles, but keep user's voice
5. **Handle typos gracefully** - interpret intent even if spelling is imperfect`;
            const prompt = `${systemPrompt}\n\nInput:\n${JSON.stringify({ subject })}`;
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            // Parse JSON response
            let parsed;
            try {
                // Remove markdown code blocks if present
                const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                parsed = JSON.parse(cleanedResponse);
            }
            catch (parseError) {
                console.error('Failed to parse Gemini response:', response);
                res.status(500).json({ error: 'Invalid JSON response from AI' });
                return;
            }
            // Validate response structure
            if (!parsed.icon || !parsed.pronouns || !parsed.subjectType || !parsed.normalizedSubject) {
                res.status(500).json({ error: 'Incomplete response from AI' });
                return;
            }
            res.status(200).json({
                result: {
                    icon: parsed.icon,
                    pronouns: parsed.pronouns,
                    subjectType: parsed.subjectType,
                    normalizedSubject: parsed.normalizedSubject
                }
            });
        }
        catch (error) {
            console.error('Error calling Gemini API:', error);
            res.status(500).json({ error: `Failed to detect icon and pronouns: ${error.message}` });
        }
    });
});
/**
 * Cloud Function 2: Personalize Approach Text
 * Uses GEMINI_PROMPT_2_RESULTS.md (personalization only)
 * Called on Screen 4 after user completes sorting
 */
exports.personalizeApproach = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const { affects, subject, pronouns, subjectType } = req.body.data || req.body;
            // Validate input
            if (!affects || !Array.isArray(affects) || affects.length !== 3) {
                res.status(400).json({ error: 'affects must be an array of 3 affect names' });
                return;
            }
            if (!subject || typeof subject !== 'string') {
                res.status(400).json({ error: 'subject is required and must be a string' });
                return;
            }
            if (!pronouns || typeof pronouns !== 'string') {
                res.status(400).json({ error: 'pronouns is required' });
                return;
            }
            if (!subjectType || typeof subjectType !== 'string') {
                res.status(400).json({ error: 'subjectType is required' });
                return;
            }
            // Generate CAS element from affects
            const casElement = affects.map((affect) => getCASCode(affect)).join('');
            // Fetch matrix data from Firestore
            const db = admin.firestore();
            const docRef = db.collection('affectCombinations').doc(casElement);
            const doc = await docRef.get();
            if (!doc.exists) {
                res.status(404).json({ error: `Combination ${casElement} not found in database. Please ensure Firestore is populated.` });
                return;
            }
            const matrixData = doc.data();
            if (!matrixData) {
                res.status(500).json({ error: 'Empty matrix data' });
                return;
            }
            // Support both CSV field names (Affect1) and legacy names (affect1)
            const feeling = matrixData.feeling;
            let approach = matrixData.approach;
            let weather = matrixData.weather;
            const spotifySeed = matrixData.spotify_seed;
            const spotifyPrompt = matrixData.spotify_prompt; // NEW: priority for Spotify
            // NEW: Replace {{subject}} and {{pronoun}} placeholders
            // Enforce lowercase for subject as per requirements
            const normalizedSubjectLower = subject.toLowerCase();
            // Replace {{subject}} placeholder
            approach = approach.replace(/\{\{subject\}\}/g, normalizedSubjectLower);
            weather = weather.replace(/\{\{subject\}\}/g, normalizedSubjectLower);
            // Replace {{pronoun}} placeholder based on detected pronouns
            // When pronoun is "it", remove pronoun references entirely
            if (pronouns === 'it') {
                // Remove pronoun placeholders when subject is not a person
                approach = approach.replace(/\{\{pronoun\}\}/g, '');
                weather = weather.replace(/\{\{pronoun\}\}/g, '');
            }
            else if (pronouns === 'she/her') {
                approach = approach.replace(/\{\{pronoun\}\}/g, 'she');
                weather = weather.replace(/\{\{pronoun\}\}/g, 'she');
            }
            else if (pronouns === 'he/him') {
                approach = approach.replace(/\{\{pronoun\}\}/g, 'he');
                weather = weather.replace(/\{\{pronoun\}\}/g, 'he');
            }
            else if (pronouns === 'they/them') {
                approach = approach.replace(/\{\{pronoun\}\}/g, 'they');
                weather = weather.replace(/\{\{pronoun\}\}/g, 'they');
            }
            // Extract music genre from spotify_seed for display
            const musicGenre = extractMusicGenre(spotifySeed);
            // Use Gemini to personalize the approach text further (if needed)
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const systemPrompt = `You are a therapeutic copywriter crafting personalized affect guidance for users.

**Task:** Transform the therapeutic approach text into compelling, natural copy that feels deeply personal to the user's specific subject while preserving the core affect-based wisdom.

**CRITICAL REQUIREMENTS:**
1. **Length: 400-500 characters** (approximately 3-4 sentences) - make it substantial and flowing
2. **Think like a copywriter** - create narrative flow, rhythm, and emotional resonance
3. **Three-part structure**: Address each of the 3 affects, but weave them together naturally

**Copywriting Guidelines:**
1. Replace generic references ("the world", "the thing", etc.) with the user's specific subject
2. Adjust pronouns naturally if the subject is a person (she/her, he/him, they/them)
3. **Create flow** - use transitional phrases to connect ideas smoothly
4. **Build momentum** - start with observation, move to understanding, end with actionable wisdom
5. **Use varied sentence lengths** - mix short punchy sentences with longer flowing ones
6. **CRITICAL: Put each sentence on its own line** - insert \n\n after EVERY sentence to create clear separation and breathing room
7. **Use simple, everyday language** - prefer common words over complex vocabulary:
   - Instead of "cultivate" → use "grow" or "build"
   - Instead of "navigate" → use "move through" or "handle"
   - Instead of "illuminate" → use "show" or "reveal"
   - Instead of "embrace" → use "welcome" or "accept"
   - Instead of "acknowledge" → use "notice" or "recognize"
   - Keep it conversational and accessible, like talking to a friend
8. **Be conversational yet profound** - sound like a wise friend, not a clinical textbook
9. Maintain warmth and groundedness - this is therapeutic guidance, not marketing copy

**Subject Type Strategies:**

**Person:** Use "your relationship with [name]" or "your feelings about [name]"
- Example: "the world" → "your relationship with your mother"
- Example: "what you find" → "what you discover about her"

**Place:** Use "your move to [place]" or "your time in [place]"
- Example: "the world" → "moving to Seattle"

**Thing:** Use "[thing] in your life" or "your relationship with [thing]"
- Example: "the world" → "your job at Google"

**Concept:** Use "[concept] in your life" or "this [concept]"
- Example: "the world" → "your anxiety"

**Relationship:** Use "this relationship" or specific dynamic
- Example: "the world" → "your relationship with your father"

**Also generate a Spotify search query:**
- Combine: one genre from the music genre pair + emotional tone + key subject reference
- Include the subject or key relationship word (mother, girlfriend, job, anxiety, etc.)
- 4-6 words total
- Examples:
  * Subject "my girlfriend" → "indie pop love relationship girlfriend"
  * Subject "my job" → "electronic contemplative work job"
  * Subject "my mother" → "folk emotional mother family"
  * Subject "moving to Seattle" → "ambient hopeful change moving"

**Output Format (JSON only, no markdown):**
{
  "personalizedApproach": "Mirror your Curiosity about [personalized subject]. Let Joy help you celebrate [personalized discovery]...",
  "spotifyQuery": "genre emotional-tone"
}`;
            const prompt = `${systemPrompt}

**Original Approach Text:**
"${approach}"

**User's Subject:** "${subject}"
**Pronouns:** "${pronouns}"
**Subject Type:** "${subjectType}"

**Music Genre (for Spotify query):** "${musicGenre}"
**Feeling (for Spotify query):** "${feeling}"

Personalize the approach text and generate the Spotify query. Return JSON only.`;
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            // Parse JSON response
            let parsed;
            try {
                const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                parsed = JSON.parse(cleanedResponse);
            }
            catch (parseError) {
                console.error('Failed to parse Gemini response:', response);
                res.status(500).json({ error: 'Invalid JSON response from AI' });
                return;
            }
            // Enforce character limit (truncate if needed)
            if (parsed.personalizedApproach && parsed.personalizedApproach.length > 550) {
                console.warn('Approach text too long (' + parsed.personalizedApproach.length + ' chars), truncating...');
                parsed.personalizedApproach = parsed.personalizedApproach.substring(0, 547) + '...';
            }
            // Weather already has placeholders replaced above, no need to replace {subject} again
            // (Already done at line 260-261 and 267-278)
            // Return complete results
            res.status(200).json({
                result: {
                    casElement,
                    feeling: feeling, // Direct from Firestore - NEW format: "The [adj] [adj] [noun]"
                    approach: parsed.personalizedApproach, // From Gemini, with placeholders replaced
                    weather: weather, // Already personalized with placeholders replaced
                    musicGenre: musicGenre, // Extracted from spotify_seed
                    spotifyQuery: parsed.spotifyQuery, // From Gemini (for backwards compatibility)
                    spotifySeed: spotifySeed, // Spotify Recommendations API parameters
                    spotifyPrompt: spotifyPrompt || '' // NEW: Priority prompt for Spotify (includes feeling phrase)
                }
            });
        }
        catch (error) {
            console.error('Error personalizing approach:', error);
            res.status(500).json({ error: `Failed to personalize approach: ${error.message}` });
        }
    });
});
/**
 * Cloud Function 3: Get Spotify Tracks
 * Priority order:
 * 1. spotifyPrompt (uses feeling phrase from CSV)
 * 2. spotifySeed (Recommendations API parameters)
 * 3. query (fallback search)
 * Returns 3 track details including album art and preview URL
 */
exports.getSpotifyTrack = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        var _a, _b;
        try {
            const { query, spotifySeed, spotifyPrompt } = req.body;
            if (!query && !spotifySeed && !spotifyPrompt) {
                res.status(400).json({ error: 'Either spotifyPrompt, spotifySeed, or query is required' });
                return;
            }
            // Get Spotify credentials from environment variables
            const clientId = process.env.SPOTIFY_CLIENT_ID;
            const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
            if (!clientId || !clientSecret) {
                console.error('Spotify credentials not configured');
                res.status(500).json({ error: 'Spotify credentials not configured. Please add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to functions/.env' });
                return;
            }
            // Get Spotify access token using Client Credentials Flow
            const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
                },
                body: 'grant_type=client_credentials'
            });
            if (!tokenResponse.ok) {
                const errorText = await tokenResponse.text();
                console.error('Failed to get Spotify access token:', errorText);
                res.status(500).json({ error: 'Failed to get Spotify access token' });
                return;
            }
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;
            let tracks = [];
            // PRIORITY 1: Use spotifyPrompt if provided (contains feeling phrase)
            if (spotifyPrompt && tracks.length === 0) {
                console.log('Using Spotify Search with prompt:', spotifyPrompt);
                // Extract the feeling phrase from spotifyPrompt (e.g., "The Harsh Severe Fire")
                // Try progressively shorter versions if no match
                let searchQuery = spotifyPrompt;
                let attemptCount = 0;
                const maxAttempts = 5;
                while (tracks.length === 0 && attemptCount < maxAttempts && searchQuery) {
                    console.log(`Search attempt ${attemptCount + 1}: "${searchQuery}"`);
                    const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=3`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                    if (searchResponse.ok) {
                        const searchData = await searchResponse.json();
                        tracks = ((_a = searchData.tracks) === null || _a === void 0 ? void 0 : _a.items) || [];
                    }
                    // If no results, remove last word and try again
                    if (tracks.length === 0) {
                        const words = searchQuery.trim().split(' ');
                        if (words.length > 1) {
                            words.pop(); // Remove last word
                            searchQuery = words.join(' ');
                            attemptCount++;
                        }
                        else {
                            break; // Can't shorten further
                        }
                    }
                }
                if (tracks.length > 0) {
                    console.log(`Found ${tracks.length} tracks with query: "${searchQuery}"`);
                }
            }
            // PRIORITY 2: Use Recommendations API if spotifySeed is provided
            if (spotifySeed && tracks.length === 0) {
                console.log('Using Spotify Recommendations API with params:', spotifySeed);
                const recommendationsResponse = await fetch(`https://api.spotify.com/v1/recommendations?${spotifySeed}&limit=3`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (!recommendationsResponse.ok) {
                    const errorText = await recommendationsResponse.text();
                    console.error('Failed to get Spotify recommendations:', errorText);
                }
                else {
                    const recommendationsData = await recommendationsResponse.json();
                    tracks = recommendationsData.tracks || [];
                }
            }
            // PRIORITY 3: Fallback to Search API with query
            if (tracks.length === 0 && query) {
                console.log('Using Spotify Search API with fallback query:', query);
                const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=3`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (!searchResponse.ok) {
                    const errorText = await searchResponse.text();
                    console.error('Failed to search Spotify:', errorText);
                    res.status(500).json({ error: 'Failed to search Spotify' });
                    return;
                }
                const searchData = await searchResponse.json();
                tracks = ((_b = searchData.tracks) === null || _b === void 0 ? void 0 : _b.items) || [];
            }
            if (tracks.length === 0) {
                res.status(404).json({ error: 'No tracks found' });
                return;
            }
            // Return all tracks (up to 3)
            res.status(200).json({
                result: tracks.map((track) => {
                    var _a, _b;
                    return ({
                        id: track.id,
                        name: track.name,
                        artist: track.artists[0].name,
                        albumArt: ((_a = track.album.images[1]) === null || _a === void 0 ? void 0 : _a.url) || ((_b = track.album.images[0]) === null || _b === void 0 ? void 0 : _b.url) || '',
                        previewUrl: track.preview_url || null,
                        spotifyUrl: track.external_urls.spotify,
                        albumName: track.album.name,
                        duration: track.duration_ms
                    });
                })
            });
        }
        catch (error) {
            console.error('Error fetching Spotify track:', error);
            res.status(500).json({ error: `Failed to fetch Spotify track: ${error.message}` });
        }
    });
});
/**
 * Cloud Function 4: Generate Image using Google Imagen via Vertex AI
 * Uses Imagen 3 to generate images from synthesized prompts
 * Called after results are displayed
 */
exports.generateImage = functions.runWith({
    timeoutSeconds: 300,
    memory: '512MB'
}).https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const { imagePrompt } = req.body;
            if (!imagePrompt || typeof imagePrompt !== 'string') {
                res.status(400).json({ error: 'imagePrompt is required and must be a string' });
                return;
            }
            console.log('Generating image with Vertex AI Imagen...');
            console.log('Prompt:', imagePrompt);
            // Initialize Vertex AI with your project
            const projectId = process.env.GCLOUD_PROJECT || 'realness-score';
            const location = 'us-central1';
            const vertexAI = new vertexai_1.VertexAI({
                project: projectId,
                location: location
            });
            // Use Imagen 3
            const generativeModel = vertexAI.preview.getGenerativeModel({
                model: 'imagegeneration@006',
            });
            // Generate image
            const result = await generativeModel.generateContent({
                contents: [{
                        role: 'user',
                        parts: [{
                                text: imagePrompt
                            }]
                    }],
                generationConfig: {
                    temperature: 0.4,
                    topP: 0.95,
                    topK: 20,
                }
            });
            const response = result.response;
            // Extract image data from response
            if (response.candidates && response.candidates.length > 0) {
                const candidate = response.candidates[0];
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                    const imagePart = candidate.content.parts[0];
                    // Check if we have inline data (base64 image)
                    if (imagePart.inlineData) {
                        const base64Image = imagePart.inlineData.data;
                        const mimeType = imagePart.inlineData.mimeType || 'image/png';
                        console.log('Image generated successfully');
                        res.status(200).json({
                            result: {
                                imageUrl: base64Image,
                                mimeType: mimeType
                            }
                        });
                        return;
                    }
                }
            }
            // If we get here, no image was generated
            console.error('No image data in response');
            res.status(500).json({ error: 'No image generated' });
        }
        catch (error) {
            console.error('Error generating image:', error);
            res.status(500).json({
                error: `Failed to generate image: ${error.message}`,
                details: error.toString()
            });
        }
    });
});
/**
 * Helper function: Convert affect name to CAS code
 */
function getCASCode(affect) {
    const codes = {
        'Curiosity': 'Cu',
        'Joy': 'Jo',
        'Surprise': 'St',
        'Surprise-Startle': 'St', // Legacy support
        'Surprise–Startle': 'St', // Legacy support with en dash
        'Fear': 'Fe',
        'Anger': 'An',
        'Sadness': 'Sa',
        'Disgust': 'Di',
        'Withdrawing': 'Pu',
        'Pulling-Away': 'Pu', // Legacy support
        'Dropping': 'Dr',
        'The Drop': 'Dr' // Legacy support
    };
    return codes[affect] || 'Xx';
}
/**
 * Helper function: Extract music genre from spotify_seed parameter
 * Example: "seed_genres=indie-rock,art-pop&target_valence=0.90" -> "Indie Rock / Art Pop"
 */
function extractMusicGenre(spotifySeed) {
    if (!spotifySeed) {
        return 'Various Genres';
    }
    try {
        // Extract seed_genres parameter
        const match = spotifySeed.match(/seed_genres=([^&]+)/);
        if (!match) {
            return 'Various Genres';
        }
        const genres = match[1].split(',');
        // Format genre names: indie-rock -> Indie Rock
        const formattedGenres = genres.map(genre => genre
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '));
        return formattedGenres.join(' / ');
    }
    catch (error) {
        console.error('Error extracting music genre:', error);
        return 'Various Genres';
    }
}
/**
 * Cloud Function: Generate Therapeutic Response (NEW - Single Affect Analysis)
 * Uses Tomkins-grounded system prompt from SYSTEM_PROMPT_V2.md
 * Called after user selects ONE affect and provides context
 */
exports.generateTherapeuticResponse = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const { affectName, context, direction, intensity, casArchetype } = req.body.data || req.body;
            // Validate input
            if (!affectName || typeof affectName !== 'string') {
                res.status(400).json({ error: 'affectName is required and must be a string' });
                return;
            }
            if (!context || typeof context !== 'string') {
                res.status(400).json({ error: 'context is required and must be a string' });
                return;
            }
            if (!direction || !['self', 'other', 'past', 'future'].includes(direction)) {
                res.status(400).json({ error: 'direction must be one of: self, other, past, future' });
                return;
            }
            if (!intensity || ![1, 2, 3, 4].includes(intensity)) {
                res.status(400).json({ error: 'intensity must be 1, 2, 3, or 4' });
                return;
            }
            // casArchetype is optional but should be a string if provided
            if (casArchetype && typeof casArchetype !== 'string') {
                res.status(400).json({ error: 'casArchetype must be a string if provided' });
                return;
            }
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            // Enhanced V3 System Prompt with Sauce.txt Philosophy + CAS Integration
            const systemPrompt = `# Your Core Identity

You are a translator of embodied experience for "Feel It, Don't Think It."

## Core Philosophy (from Sauce.txt)

"Your body already knows. We're not teaching you what to feel—we're revealing what you're already experiencing."

**The Approach:**
- Users arrive through BODY RECOGNITION (embodied metaphors: "blood boiling", "heart racing")
- You translate that into AFFECT THEORY (Tomkins' biological mechanisms)
- You reveal the PATTERN (why they handle it this way - their CAS terrain)
- You offer AGENCY (a different move, not a prescription)

**Language Rule:**
- This isn't: "You're feeling X"
- This is: "Your body is signaling X. Here's what that means, why you're handling it the way you are, and what becomes possible."

---

You are a Tomkins-trained affect translator for the "Feel it, Don't Think It" app. Your role is to help users understand their currently experienced affect by revealing:
1. What the affect is (recognition & validation using Tomkins' theory)
2. What it's connecting to (contextual analysis)
3. How they're processing it (pattern recognition)

# Core Theoretical Foundation (Tomkins)

**Key Principle**: "Affect is motivating but never localizing. The experience of affect tells us only that something needs our attention."

**S-A-R Sequences**: Life is not "Stimulus-Response" pairs. We live with **Stimulus-Affect-Response** sequences. No stimulus can trigger a response unless and until it triggers an affect.

**Affect vs. Emotion**:
- **Affect**: Innate, biological, physiological mechanism (9 specific types)
- **Feeling**: Awareness that an affect has been triggered
- **Emotion**: Affect + memory + cognitive meaning

**Affects as Analogic Amplifiers**: Affects evolved as responses to neural firing density/gradient:
- Gradual increase → Interest-Curiosity
- Optimal level → Enjoyment-Joy
- Sudden increase → Surprise-Startle
- High steady level → Fear-Terror
- Non-optimal steady state → Distress-Anguish (Sadness)
- Steep increase → Anger-Rage
- Incomplete reduction of positive affect → Shame-Humiliation (Dropping)
- Auxiliary protective affects → Disgust, Dissmell (Withdrawing)

# The 9 Core Affects (with Tomkins Definitions)

**1. Curiosity** (Tomkins: Interest-Excitement)
- Trigger: Gradual increase in neural firing (novelty, complexity)
- Function: Focuses attention, sustains engagement, drives learning
- Somatic: Leaning in, focused gaze, tracking, drawn toward

**2. Joy** (Tomkins: Enjoyment-Joy)
- Trigger: Decrease in neural firing after interest/distress
- Function: Rewards connection, signals safety, promotes bonding
- Somatic: Soft, open, warm, relaxed, expanded

**3. Surprise** (Tomkins: Surprise-Startle)
- Trigger: Sudden, sharp increase (unexpected stimulus)
- Function: Resets attention system - "sudden on, sudden off"
- Somatic: Jolted, paused, interrupted, breath catches
- Note: Neutral until evaluated - doesn't tell you if something is good/bad

**4. Fear** (Tomkins: Fear-Terror)
- Trigger: High, sustained neural firing (perceived danger)
- Function: Mobilizes escape, freezes action, scans for danger
- Somatic: Tight, alert, braced, frozen, scanning, heart racing

**5. Anger** (Tomkins: Anger-Rage)
- Trigger: Steep, rapid increase (impediment, violation)
- Function: Removes obstacles, defends boundaries, protests injustice
- Somatic: Hot, pressured, blood boiling, jaw clenched, ready to push

**6. Sadness** (Tomkins: Distress-Anguish)
- Trigger: Non-optimal sustained state (loss, separation)
- Function: Signals need for comfort, slows down, recruits help
- Somatic: Heavy, sinking, aching, chest tight, throat constricted

**7. Disgust** (Tomkins: Disgust)
- Trigger: Offensive stimulus (originally bad taste, now symbolic)
- Function: Protects from toxic substances (physical/psychological)
- Somatic: Recoiling, pulling back fast, wanting to reject, nausea

**8. Withdrawing** (Tomkins: Dissmell)
- Trigger: Offensive odor (originally), now bad interpersonal "smell"
- Function: Creates distance without disgust intensity
- Somatic: Stepping back, taking distance, lowering intake, turning away

**9. Dropping** (Tomkins: Shame-Humiliation)
- Trigger: Incomplete reduction of positive affect (interest/joy interrupted)
- Function: Signals disconnection, regulates exposure, manages social bonds
- Somatic: Shrinking, collapsing inward, eyes down, wanting to disappear
- Note: NOT about self-worth - about interrupted positive affect

# CAS Terrain Integration (8 Archetypes)

**Key Insight from Sauce.txt:**
"Same weather, different terrain. Different path forward."

Two people can experience the SAME affect but handle it completely differently based on their Core Attachment Style (CAS) terrain.

## The 8 Terrains

**Secure:**
- **Grounded Navigator:** Can sit with difficult feelings without overwhelm or shutdown. Good boundaries. Emotionally flexible.

**Anxious Variants:**
- **Emotional Enthusiast:** Feels deeply, fears abandonment, amplifies signals to ensure they're not missed.
- **Heartfelt Defender:** Shows polished version, hides mess, performs competence to stay lovable.
- **Passionate Pilgrim:** Wants to belong completely, goes all-in, merges with others to feel whole.

**Avoidant Variants:**
- **Lone Wolf:** Values space/freedom, self-reliant, withdraws under stress to stay safe.
- **Chill Conductor:** Lives in head, intellectualizes to control, understands but doesn't feel.
- **Independent Icon:** Prides on not needing anyone, dismisses vulnerability as weakness.

**Disorganized:**
- **Mystery Mosaic:** Sometimes craves closeness, sometimes pushes away. Attachment system itself is conflicted.

---

# Your Task

Generate a 3-paragraph therapeutic response (~150 words total) using this structure:

**Paragraph 1: Recognition & Validation (45-55 words)**
- Start: "Your body is signaling [AFFECT NAME]."
- Describe somatic experience (use Tomkins language)
- Explain biological function
- Connect trigger type to user's context
- Use Tomkins vocabulary: "triggered by [gradient/density description]"

**Paragraph 2: Pattern Recognition with CAS Terrain (45-55 words)**
- **IF CAS PROVIDED:** Start with "Given your [CAS ARCHETYPE] terrain, here's how you're processing this [AFFECT]:"
  - Show how terrain amplifies/dampens the affect
  - Reveal CAS-specific pattern (e.g., Heartfelt Defender hides fear and performs competence)
  - Connect intensity to terrain-specific struggle
- **IF NO CAS:** Interpret how direction + intensity shapes their experience
- Direction-specific interpretation:
  - Self: about identity, worth, capability
  - Other: about what they're doing, threat FROM them
  - Past: processing what already happened
  - Future: anticipating what might happen
- Intensity-specific language:
  - 1: "noticeable but manageable," "background signal"
  - 2: "persistent," "can't ignore," "steady presence"
  - 3: "demanding attention," "hard to focus on anything else"
  - 4: "flooding," "overwhelming," "taking over"
- Create "how do you know me?" moment

**Paragraph 3: The Opening (45-55 words)**
- Start: "The opening is here:"
- Provide specific leverage point based on affect + direction + intensity
- Reference Tomkins principle about affect function
- End with reframe: "This isn't about making the affect go away - it's about [function-based reframe]"
- For intensity 4: prioritize regulation before insight

# Critical Rules

1. **Always ground in Tomkins** - use his language about triggers (gradients, density, rate of change)
2. **Use user's exact context** - don't abstract "my mother" into "parental relationships"
3. **Match intensity to approach** - intensity 4 needs regulation first, not complex insight
4. **Direction determines meaning** - same affect, different direction = different interpretation
5. **Validation + Agency** - affect is real AND they have choice
6. **Function over feeling** - "This affect is doing X" not "You shouldn't feel this"
7. **Specific not generic** - use their actual words
8. **Word count: 135-165 words total** (target: 150)

# Output Format

Return ONLY valid JSON (no markdown):
{
  "response": "Paragraph 1\\n\\nParagraph 2\\n\\nParagraph 3"
}

Use \\n\\n between paragraphs for proper formatting.`;
            const userPrompt = `
**User Input:**
- Selected Affect: ${affectName}
- Context: "${context}"
- Direction: ${direction}
- Intensity: ${intensity}
${casArchetype ? `- CAS Terrain: ${casArchetype}` : ''}

Generate the 3-paragraph therapeutic response following the structure and rules above.${casArchetype ? ' Integrate the CAS terrain into Paragraph 2 as specified.' : ''}`;
            const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
            const result = await model.generateContent(fullPrompt);
            const response = result.response.text();
            // Parse JSON response
            let parsed;
            try {
                const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                parsed = JSON.parse(cleanedResponse);
            }
            catch (parseError) {
                console.error('Failed to parse Gemini response:', response);
                res.status(500).json({ error: 'Invalid JSON response from AI' });
                return;
            }
            if (!parsed.response) {
                res.status(500).json({ error: 'No response generated' });
                return;
            }
            res.status(200).json({
                result: {
                    response: parsed.response,
                    affectName,
                    context,
                    direction,
                    intensity
                }
            });
        }
        catch (error) {
            console.error('Error generating therapeutic response:', error);
            res.status(500).json({ error: `Failed to generate response: ${error.message}` });
        }
    });
});
/**
 * Cloud Function: Get AI Prompts
 * Returns the system prompts used for icon detection and approach personalization
 * For admin panel transparency
 */
exports.getPrompts = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        const iconPrompt = `You are an AI assistant for the "Feel it, Don't Think It" affect assessment app. Your task is to analyze the user's subject (a person, place, thing, concept, or situation) and return:

1. **A semantic icon match** from the Lucide icon library
2. **The appropriate pronouns** for the subject
3. **The subject type** classification
4. **A grammatically normalized version** of the subject for use in "When I think about [X]..."

Be empathetic, creative, and flexible in your analysis. Use loose semantic matching for icons - focus on emotional resonance and metaphorical meaning rather than literal matches.

## Output Format

You MUST respond with ONLY a valid JSON object (no markdown, no explanations):

\`\`\`json
{
  "icon": "lucide-icon-name",
  "pronouns": "she/her" | "he/him" | "they/them" | "it",
  "subjectType": "person" | "place" | "thing" | "concept" | "relationship",
  "normalizedSubject": "grammatically correct subject text"
}
\`\`\`

## Icon Selection Guidelines

**BE CREATIVE AND FLEXIBLE** - Choose icons that capture the emotional essence, not just the literal meaning. Use metaphorical and symbolic associations. Don't be afraid to make unexpected connections.

**Examples of loose/creative matching:**
- "anxiety" → "cloud" (turbulent energy)
- "depression" → "droplet" (heavy, persistent)
- "excitement" → "zap" (electric energy)
- "my future" → "compass" (direction, navigation)
- "change" → "wind" (invisible force)
- "therapy" → "flower" (growth, healing)
- "grief" → "droplet" (tears, heaviness)
- "hope" → "sun" (new light)
- "nature" → "leaf" (organic, natural)
- "animals" → "waves" (flowing, living energy)

**Available Icons (STRICT LIST - use ONLY these):**

**People & Relationships:**
heart, users, user, baby, smile, frown

**Work & Career:**
briefcase, building, laptop, coffee, pencil

**Places:**
home, map-pin, plane, map, globe, mountain

**Objects & Possessions:**
car, book, music, phone, camera, gift, package

**Nature & Elements:**
sun, moon, cloud, wind, droplet, flame, leaf, flower, waves

**Emotions & States:**
heart, sparkles, brain, shield, smile, frown, zap

**Movement & Change:**
trending-up, trending-down, arrow-right, compass, move

**Time & Process:**
calendar, clock, hourglass

**Communication:**
message-circle, mail, phone

**Abstract Concepts:**
lightbulb, key, lock, target, flag

**CRITICAL: You MUST use one of these exact icon names. NO VARIATIONS or compound names allowed. These are the ONLY valid icons - do not use tree, landmark, navigation, timer, megaphone, puzzle, alert-triangle, or meh as they may not be supported. Keep it simple and use only the base icons listed above.**

## Pronoun Detection Guidelines

**she/her:**
- "my mother", "my sister", "my daughter", "my girlfriend", "my wife"
- "Sarah", "Emily" (clearly feminine names)
- Explicitly female-identified people

**he/him:**
- "my father", "my brother", "my son", "my boyfriend", "my husband"
- "John", "Michael" (clearly masculine names)
- Explicitly male-identified people

**they/them:**
- "my partner" (gender-neutral)
- "my friend" (when gender unclear)
- "my sibling"
- Names that don't clearly indicate gender
- Groups of people ("my team", "my family")

**it:**
- All non-human subjects: places, things, concepts, situations
- Jobs/careers ("my job", "my career")
- Objects ("my car", "my house")
- Abstract concepts ("my anxiety", "moving to Seattle")

## Subject Type Classification

**person** - Individual human being (my mother, John, my therapist)
**place** - Location or destination (Seattle, my house, the office)
**thing** - Physical object (my car, my phone, my dog)
**concept** - Abstract idea or feeling (my anxiety, success, failure, change)
**relationship** - Dynamic between people (my relationship with X, my marriage)

## Normalized Subject Guidelines

Transform the user's input into grammatically correct text that flows naturally in the sentence "When I think about [normalizedSubject] my body feels like it's..."

**Examples:**
- "my mom" → "my mom" (already correct)
- "seattle" → "Seattle" (capitalize proper nouns)
- "moving to seattle" → "moving to Seattle"
- "my anxiety" → "my anxiety" (keep as-is if correct)
- "the job" → "the job"
- "girlfriend" → "my girlfriend" (add possessive if missing and contextually appropriate)
- "future" → "the future" (add article if needed)
- "therapy session" → "therapy sessions" or "therapy" (singular/plural as appropriate)

Keep it natural and conversational. Fix obvious grammar/capitalization issues but preserve the user's intent and voice.

## Important Rules

1. **ALWAYS output valid JSON only** - no explanations, no markdown code blocks
2. **Be creative with icons** - use loose metaphorical matching, emotional resonance
3. **Default to "it"** when pronoun is unclear
4. **Normalize grammar naturally** - fix capitalization, add articles, but keep user's voice
5. **Handle typos gracefully** - interpret intent even if spelling is imperfect`;
        const approachPrompt = `You are a therapeutic copywriter crafting personalized affect guidance for users.

**Task:** Transform the therapeutic approach text into compelling, natural copy that feels deeply personal to the user's specific subject while preserving the core affect-based wisdom.

**CRITICAL REQUIREMENTS:**
1. **Length: 400-500 characters** (approximately 3-4 sentences) - make it substantial and flowing
2. **Think like a copywriter** - create narrative flow, rhythm, and emotional resonance
3. **Three-part structure**: Address each of the 3 affects, but weave them together naturally

**Copywriting Guidelines:**
1. Replace generic references ("the world", "the thing", etc.) with the user's specific subject
2. Adjust pronouns naturally if the subject is a person (she/her, he/him, they/them)
3. **Create flow** - use transitional phrases to connect ideas smoothly
4. **Build momentum** - start with observation, move to understanding, end with actionable wisdom
5. **Use varied sentence lengths** - mix short punchy sentences with longer flowing ones
6. **CRITICAL: Put each sentence on its own line** - insert \\n\\n after EVERY sentence to create clear separation and breathing room
7. **Use simple, everyday language** - prefer common words over complex vocabulary:
   - Instead of "cultivate" → use "grow" or "build"
   - Instead of "navigate" → use "move through" or "handle"
   - Instead of "illuminate" → use "show" or "reveal"
   - Instead of "embrace" → use "welcome" or "accept"
   - Instead of "acknowledge" → use "notice" or "recognize"
   - Keep it conversational and accessible, like talking to a friend
8. **Be conversational yet profound** - sound like a wise friend, not a clinical textbook
9. Maintain warmth and groundedness - this is therapeutic guidance, not marketing copy

**Subject Type Strategies:**

**Person:** Use "your relationship with [name]" or "your feelings about [name]"
- Example: "the world" → "your relationship with your mother"
- Example: "what you find" → "what you discover about her"

**Place:** Use "your move to [place]" or "your time in [place]"
- Example: "the world" → "moving to Seattle"

**Thing:** Use "[thing] in your life" or "your relationship with [thing]"
- Example: "the world" → "your job at Google"

**Concept:** Use "[concept] in your life" or "this [concept]"
- Example: "the world" → "your anxiety"

**Relationship:** Use "this relationship" or specific dynamic
- Example: "the world" → "your relationship with your father"

**Also generate a Spotify search query:**
- Combine: one genre from the music genre pair + emotional tone + key subject reference
- Include the subject or key relationship word (mother, girlfriend, job, anxiety, etc.)
- 4-6 words total
- Examples:
  * Subject "my girlfriend" → "indie pop love relationship girlfriend"
  * Subject "my job" → "electronic contemplative work job"
  * Subject "my mom" → "folk emotional mother family"

**Examples:**

INPUT:
{
  "defaultApproach": "Notice how Fear is trying to protect you. Let Sadness show you what matters. Stay present with Anger—it's guarding something important.",
  "subject": "my girlfriend",
  "pronouns": "she/her",
  "subjectType": "person",
  "musicGenre": "Dark Ambient / Post-Rock"
}

OUTPUT:
{
  "personalizedApproach": "Notice how Fear shows up in your relationship with your girlfriend—it's trying to protect what matters.\\n\\nLet Sadness reveal what you're really feeling about her.\\n\\nAnd when Anger appears, stay present—it's guarding something you care about deeply.",
  "spotifyQuery": "dark ambient emotional girlfriend relationship"
}

**Important:**
- Maintain the therapeutic wisdom and affect structure from the original
- Make it feel personal and specific to their subject
- Keep the tone warm, grounded, and actionable
- Use \\n\\n between sentences for proper formatting`;
        res.status(200).json({
            iconPrompt,
            approachPrompt
        });
    });
});
//# sourceMappingURL=index.js.map