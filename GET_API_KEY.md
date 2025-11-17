# How to Get Google Gemini API Key (Nano Banana)

## Quick Method: Google AI Studio

1. **Go to Google AI Studio:**
   - Visit: https://aistudio.google.com/app/apikey

2. **Sign in with your Google account**

3. **Create API Key:**
   - Click "Create API Key"
   - Select your project (or create a new one)
   - Copy the API key that appears

4. **Set it in your terminal:**
   ```bash
   export GOOGLE_API_KEY="your-api-key-here"
   ```

5. **Or add to your project .env file:**
   ```bash
   echo "GOOGLE_API_KEY=your-api-key-here" >> .env
   ```

## Alternative: Google Cloud Console

If you prefer using Google Cloud Console:

1. Go to: https://console.cloud.google.com/
2. Select your project (or create new)
3. Navigate to: **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **API Key**
5. Enable the **Generative Language API** if prompted
6. Copy your API key

## Usage

Once you have the key, run:

```bash
export GOOGLE_API_KEY="your-key"
node scripts/generate-image.js 1
```

Or add it to a `.env` file in the project root.

