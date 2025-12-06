# Spotify API Integration Setup Guide

## Overview
To fetch actual Spotify songs (with album art and preview URLs), you need to set up Spotify Web API authentication via a Cloud Function.

---

## Step 1: Create Spotify Developer Account

1. Go to https://developer.spotify.com/dashboard
2. Log in with your Spotify account (or create one)
3. Click **"Create App"**
4. Fill in the details:
   - **App Name:** Feel it, Don't Think It
   - **App Description:** Affect assessment app that recommends music
   - **Redirect URI:** `https://realness-score.web.app/callback` (won't be used for client credentials flow)
   - **Which API/SDKs:** Web API
   - Agree to terms and create

5. You'll see your app dashboard with:
   - **Client ID** (public)
   - **Client Secret** (keep private!)

---

## Step 2: Save Your Credentials

Copy your Client ID and Client Secret. We'll add them to the Functions `.env` file.

### Create `.env` file in `/functions` directory:

```bash
cd functions
```

Create a file named `.env` with your credentials:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

**Important:** Add `.env` to `.gitignore` if not already there:

```bash
echo ".env" >> .gitignore
```

---

## Step 3: Install dotenv (if not already installed)

```bash
cd functions
pnpm add dotenv
```

The Firebase SDK will automatically load `.env` files in Cloud Functions.

---

## Step 4: Create Spotify Cloud Function

Create a new Cloud Function in `functions/src/index.ts`:

```typescript
// Spotify API Integration
export const getSpotifyTrack = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { query } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query is required' });
        return;
      }

      // Get Spotify access token using Client Credentials Flow
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        res.status(500).json({ error: 'Spotify credentials not configured' });
        return;
      }

      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
        },
        body: 'grant_type=client_credentials'
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get Spotify access token');
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Search for tracks
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!searchResponse.ok) {
        throw new Error('Failed to search Spotify');
      }

      const searchData = await searchResponse.json();
      const track = searchData.tracks.items[0];

      if (!track) {
        res.status(404).json({ error: 'No tracks found' });
        return;
      }

      // Return track details
      res.status(200).json({
        result: {
          name: track.name,
          artist: track.artists[0].name,
          albumArt: track.album.images[1]?.url || track.album.images[0]?.url,
          previewUrl: track.preview_url,
          spotifyUrl: track.external_urls.spotify,
          albumName: track.album.name
        }
      });
    } catch (error: any) {
      console.error('Error fetching Spotify track:', error);
      res.status(500).json({ error: `Failed to fetch Spotify track: ${error.message}` });
    }
  });
});
```

---

## Step 5: Update Frontend to Call Spotify Function

Replace the `fetchSpotifySong()` function in `public/index.html`:

```javascript
async function fetchSpotifySong(query) {
    try {
        const response = await fetch('https://us-central1-realness-score.cloudfunctions.net/getSpotifyTrack', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch Spotify track');
        }

        const result = await response.json();
        const track = result.result;

        // Update the music section with actual track
        const musicContent = document.getElementById('musicContent');
        musicContent.innerHTML = `
            <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px;">
                <img src="${track.albumArt}" alt="${track.albumName}"
                     style="width: 80px; height: 80px; border-radius: 8px;">
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">${track.name}</div>
                    <div style="color: var(--gray-500); font-size: 14px;">${track.artist}</div>
                </div>
            </div>
            ${track.previewUrl ? `
                <audio controls style="width: 100%; margin-bottom: 16px;">
                    <source src="${track.previewUrl}" type="audio/mpeg">
                </audio>
            ` : ''}
            <a href="${track.spotifyUrl}" target="_blank" class="spotify-link">
                Open in Spotify →
            </a>
        `;
    } catch (error) {
        console.error('Error fetching Spotify song:', error);
        // Fallback to search link
    }
}
```

---

## Step 6: Deploy

```bash
# Build and deploy functions
cd functions && pnpm run build && cd ..
firebase deploy --only functions

# Deploy hosting
firebase deploy --only hosting
```

---

## Step 7: Test

1. Go to https://realness-score.web.app
2. Complete the assessment
3. On the results screen, you should see:
   - Album artwork
   - Track name and artist
   - 30-second preview player (if available)
   - Link to open in Spotify

---

## API Rate Limits

**Spotify Free Tier:**
- Client Credentials Flow: No user auth required
- Rate limit: 180 requests per minute
- Sufficient for this app

**Best Practices:**
- Cache track results in Firestore by query
- Add error handling for rate limits
- Consider adding a loading state for slow networks

---

## Optional: Add Spotify Embed Widget

Instead of preview audio, embed the full Spotify player:

```html
<iframe
    src="https://open.spotify.com/embed/track/${track.id}"
    width="100%"
    height="152"
    frameBorder="0"
    allowtransparency="true"
    allow="encrypted-media">
</iframe>
```

---

## Caching Strategy

Add to `getSpotifyTrack` function:

```typescript
// Check cache first
const cacheRef = db.collection('spotifyCache').doc(query);
const cacheDoc = await cacheRef.get();

if (cacheDoc.exists) {
    const cached = cacheDoc.data();
    // Return cached if less than 7 days old
    if (Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) {
        res.status(200).json({ result: cached.track });
        return;
    }
}

// ... fetch from Spotify API ...

// Cache the result
await cacheRef.set({
    track: trackData,
    timestamp: Date.now()
});
```

---

## Troubleshooting

### "Invalid client" error
- Check that `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are set correctly in `/functions/.env`
- Ensure the `.env` file is in the correct location
- Rebuild and redeploy functions after adding credentials

### "No tracks found"
- Query might be too specific
- Try simplifying the query or adding fallback searches

### No preview URL
- Not all tracks have 30-second previews
- Fall back to Spotify link only

---

## Summary

✅ **What you get:**
- Album artwork in results
- Track name and artist
- 30-second preview (when available)
- Direct link to full song on Spotify

✅ **What you need:**
- Spotify Developer account (free)
- Client ID and Client Secret
- Cloud Function to handle authentication
- ~30 lines of code in frontend

**Total setup time:** ~15 minutes
