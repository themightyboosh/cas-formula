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
exports.generateImage = exports.getSpotifyTrack = exports.personalizeApproach = exports.detectIconAndPronouns = void 0;
const functions = __importStar(require("firebase-functions"));
const generative_ai_1 = require("@google/generative-ai");
const admin = __importStar(require("firebase-admin"));
const cors = require("cors");
const vertexai_1 = require("@google-cloud/vertexai");
admin.initializeApp();
// Enable CORS for all origins
const corsHandler = cors({ origin: true });
// Initialize Gemini with API key from environment
const GEMINI_API_KEY = 'AIzaSyBhD7ZmVn-mWl2-Ic8fLla3N09edQuEsAY';
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

Be empathetic, accurate, and thoughtful in your analysis.

## Output Format

You MUST respond with ONLY a valid JSON object (no markdown, no explanations):

\`\`\`json
{
  "icon": "lucide-icon-name",
  "pronouns": "she/her" | "he/him" | "they/them" | "it",
  "subjectType": "person" | "place" | "thing" | "concept" | "relationship"
}
\`\`\`

## Icon Selection Guidelines

Choose icons that semantically match the subject. Consider the emotional and symbolic meaning, not just the literal object.

**People & Relationships:**
- "user-heart" - for loved ones, close relationships (mother, father, partner, spouse)
- "users" - for groups, teams, family
- "heart-handshake" - for partnerships, collaborations
- "user" - for general person reference
- "user-circle" - for self, identity

**Work & Career:**
- "briefcase" - for jobs, careers, work in general
- "briefcase-medical" - for healthcare jobs
- "building" - for companies, organizations
- "building-2" - for offices, workplaces
- "laptop" - for remote work, tech jobs

**Places:**
- "home" - for house, residence, living space
- "map-pin" - for locations, specific places
- "plane" - for travel, relocation, moving
- "landmark" - for cities, destinations
- "map" - for journeys, paths

**Objects & Possessions:**
- "car" - for vehicles
- "book" - for education, learning, studies
- "music" - for music, art, creative pursuits
- "phone" - for technology, communication
- "camera" - for photography, memories

**Concepts & Emotions:**
- "brain" - for thoughts, mental health, intellect
- "sparkles" - for new beginnings, excitement
- "cloud" - for anxiety, uncertainty, confusion
- "sun" - for happiness, positivity
- "moon" - for night, dreams, reflection
- "heart" - for love, passion, emotions
- "shield" - for protection, safety, security

**Situations:**
- "activity" - for busy situations, transitions
- "calendar" - for events, schedules, time-based situations
- "message-circle" - for communication, conversations
- "trending-up" - for growth, improvement, progress
- "trending-down" - for decline, challenge, difficulty

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

## Important Rules

1. **ALWAYS output valid JSON only** - no explanations, no markdown code blocks
2. **Be consistent** - use exact icon names from the Lucide library
3. **Default to "it"** when pronoun is unclear
4. **Choose meaningful icons** - prioritize emotional/symbolic meaning over literal matching
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
            if (!parsed.icon || !parsed.pronouns || !parsed.subjectType) {
                res.status(500).json({ error: 'Incomplete response from AI' });
                return;
            }
            res.status(200).json({
                result: {
                    icon: parsed.icon,
                    pronouns: parsed.pronouns,
                    subjectType: parsed.subjectType
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
            // Use Gemini to personalize the approach text
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const systemPrompt = `You are personalizing therapeutic guidance for an affect assessment app.

**Task:** Adapt the therapeutic approach text to feel natural and personal to the user's specific subject while preserving the core affect-based guidance.

**Guidelines:**
1. Make the text feel conversational and natural - you have creative freedom to rephrase for better flow
2. Replace generic references ("the world", "the thing", etc.) with the user's specific subject
3. Adjust pronouns naturally if the subject is a person (she/her, he/him, they/them)
4. Preserve the core therapeutic message and the three-part structure (addressing each of the 3 affects)
5. Keep the closing phrase "Don't push it away, just let it sit." exactly as written
6. Maintain a poetic, compassionate, grounded tone
7. Feel free to adjust sentence structure, word choice, and phrasing to sound more natural
8. IMPORTANT: Readability and natural language flow are more important than rigid template adherence

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

**Also synthesize an image generation prompt:**
- Take the base image prompt and add a subtle reference to the user's subject
- Keep the surrealist, abstract style
- Example: If base is "A fractal structure expanding outward" and subject is "my mother", add "with a warm, maternal presence woven throughout"
- 1-2 sentences max

**Output Format (JSON only, no markdown):**
{
  "personalizedApproach": "Mirror your Curiosity about [personalized subject]. Let Joy help you celebrate [personalized discovery]...",
  "spotifyQuery": "genre emotional-tone",
  "imagePrompt": "synthesized image prompt with subject reference"
}`;
            const prompt = `${systemPrompt}

**Original Approach Text:**
"${matrixData.approach}"

**User's Subject:** "${subject}"
**Pronouns:** "${pronouns}"
**Subject Type:** "${subjectType}"

**Music Genre (for Spotify query):** "${matrixData.musicGenre}"
**Feeling (for Spotify query):** "${matrixData.feeling}"
**Base Image Prompt:** "${matrixData.imagePromptBase || 'Abstract surrealist composition'}"

Personalize the approach text, generate the Spotify query, and synthesize the image prompt. Return JSON only.`;
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
            // Return complete results
            res.status(200).json({
                result: {
                    casElement,
                    feeling: matrixData.feeling, // Direct from Firestore
                    approach: parsed.personalizedApproach, // From Gemini
                    weather: matrixData.weather, // Direct from Firestore
                    musicGenre: matrixData.musicGenre, // Direct from Firestore
                    spotifyQuery: parsed.spotifyQuery, // From Gemini
                    imagePrompt: parsed.imagePrompt || matrixData.imagePromptBase // From Gemini or fallback to matrix
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
 * Cloud Function 3: Get Spotify Track
 * Fetches a Spotify track based on search query
 * Returns track details including album art and preview URL
 */
exports.getSpotifyTrack = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        var _a;
        try {
            const { query } = req.body;
            if (!query || typeof query !== 'string') {
                res.status(400).json({ error: 'Query is required and must be a string' });
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
            // Search for tracks using the query (get 3 tracks)
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
            const tracks = ((_a = searchData.tracks) === null || _a === void 0 ? void 0 : _a.items) || [];
            if (tracks.length === 0) {
                res.status(404).json({ error: 'No tracks found for query: ' + query });
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
//# sourceMappingURL=index.js.map