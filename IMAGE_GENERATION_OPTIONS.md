# Image Generation Options

## Current Status

Your Google API key is saved in `.env`. However, the Imagen API endpoint isn't available with this key.

## Option 1: Generate Manually in Google AI Studio (Easiest)

1. Go to: https://aistudio.google.com/
2. Click "Create New" > "Image"
3. Paste this prompt:

```
A calm guardian carved from shadowed stone, soft light glowing inside their chest, standing alone in a field at dusk, realistic, dark muted palette, subtle inner glow, highly detailed, Pen and Ink mixed with water color
```

4. Generate the image
5. Download and save to: `src/assets/images/archetype-1-the-resonant-sage.png`

## Option 2: Enable Imagen API in Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Navigate to: **APIs & Services** > **Library**
4. Search for "Imagen API" or "Generative Language API"
5. Enable it
6. Try running the script again:
   ```bash
   node scripts/generate-image.js 1
   ```

## Option 3: Use OpenAI DALL-E Instead

If you have an OpenAI API key:

```bash
export OPENAI_API_KEY="your-openai-key"
node scripts/generate-image.js 1
```

## Option 4: Use Vertex AI (More Complex)

If you have Google Cloud credentials set up, you can use Vertex AI's Imagen API, but this requires:
- Google Cloud Project
- Service account credentials
- Vertex AI API enabled

---

**Recommendation**: For now, use Option 1 (manual generation) to get the first image quickly, then we can set up automated generation later.

