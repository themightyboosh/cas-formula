# Google Cloud Setup for Imagen API Image Generation

This guide will help you set up Google Cloud to use Imagen API for automated image generation.

## Prerequisites

- Google account
- Credit card (for billing, though free tier may be available)
- Google Cloud project

---

## Step 1: Create or Select a Google Cloud Project

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project (or select existing):**
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter project name: `realness-score` (or your preferred name)
   - Click "Create"
   - Wait for project creation (may take a minute)

3. **Select the Project:**
   - Make sure your new project is selected in the dropdown

---

## Step 2: Enable Billing

1. **Navigate to Billing:**
   - Go to: https://console.cloud.google.com/billing
   - Or: Menu (☰) > Billing

2. **Link a Billing Account:**
   - Click "Link a billing account"
   - Create a new billing account or link existing
   - Add payment method (credit card)
   - **Note:** Google Cloud offers free credits ($300) for new accounts

3. **Link to Project:**
   - Select your project
   - Link it to your billing account

---

## Step 3: Enable Required APIs

1. **Navigate to APIs & Services:**
   - Go to: https://console.cloud.google.com/apis/library
   - Or: Menu (☰) > APIs & Services > Library

2. **Enable Vertex AI API:**
   - Search for: `Vertex AI API`
   - Click on it
   - Click "Enable"
   - Wait for activation

3. **Enable Imagen API:**
   - Search for: `Imagen API` or `Generative Language API`
   - Click on it
   - Click "Enable"
   - Wait for activation

4. **Verify Enabled APIs:**
   - Go to: Menu (☰) > APIs & Services > Enabled APIs
   - You should see:
     - Vertex AI API
     - Imagen API (or Generative Language API)

---

## Step 4: Create Service Account

1. **Navigate to Service Accounts:**
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Or: Menu (☰) > IAM & Admin > Service Accounts

2. **Create Service Account:**
   - Click "Create Service Account"
   - **Service account name:** `imagen-image-generator`
   - **Service account ID:** (auto-filled)
   - **Description:** `Service account for Imagen image generation`
   - Click "Create and Continue"

3. **Grant Roles:**
   - Add role: `Vertex AI User`
   - Add role: `Storage Object Viewer` (if needed for image storage)
   - Click "Continue"
   - Click "Done"

---

## Step 5: Create and Download Service Account Key

1. **Create Key:**
   - Find your service account in the list
   - Click on it
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Select "JSON"
   - Click "Create"
   - **JSON file will download automatically**

2. **Save the Key File:**
   - Move the downloaded JSON file to a secure location
   - Recommended: `~/cnidaria-dev-key.json` (or similar)
   - **IMPORTANT:** Never commit this file to git!

3. **Set Environment Variable:**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="~/path/to/your-key.json"
   ```

---

## Step 6: Get Project ID and Location

1. **Find Your Project ID:**
   - Go to: https://console.cloud.google.com/home/dashboard
   - Your Project ID is shown at the top (e.g., `realness-score-123456`)

2. **Choose a Location:**
   - Vertex AI is available in specific regions
   - Common locations: `us-central1`, `us-east1`, `europe-west1`
   - Check availability: https://cloud.google.com/vertex-ai/docs/general/locations

---

## Step 7: Install Google Auth Library (Optional)

If using service account authentication, install the Google Auth library:

```bash
npm install google-auth-library
# or
pnpm add google-auth-library
```

This is needed for proper OAuth token generation with service accounts.

---

## Step 8: Update the Script

Update your `.env` file or environment variables:

```bash
# Option 1: Using Service Account JSON
export GOOGLE_APPLICATION_CREDENTIALS="~/path/to/your-key.json"
export GOOGLE_PROJECT_ID="your-project-id"
export GOOGLE_LOCATION="us-central1"

# Option 2: Using API Key (if available)
export GOOGLE_API_KEY="your-api-key"
export GOOGLE_PROJECT_ID="your-project-id"
```

---

## Step 9: Test the Setup

Run the image generation script:

```bash
cd /Users/danielcrowder/Desktop/Projects/Assessment
export GOOGLE_APPLICATION_CREDENTIALS="~/path/to/your-key.json"
export GOOGLE_PROJECT_ID="your-project-id"
export GOOGLE_LOCATION="us-central1"
node scripts/generate-image.js 1
```

---

## Alternative: Using API Key (Simpler)

If you prefer using an API key instead of service account:

1. **Create API Key:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" > "API Key"
   - Copy the API key

2. **Restrict the API Key:**
   - Click on the API key to edit
   - Under "API restrictions":
     - Select "Restrict key"
     - Enable: "Vertex AI API" and "Imagen API"
   - Under "Application restrictions":
     - Select appropriate restriction (IP, HTTP referrer, etc.)
   - Click "Save"

3. **Use in Script:**
   ```bash
   export GOOGLE_API_KEY="your-api-key"
   export GOOGLE_PROJECT_ID="your-project-id"
   ```

---

## Troubleshooting

### Error: "API not enabled"
- **Solution:** Go to APIs & Services > Library and enable Vertex AI API and Imagen API

### Error: "Permission denied"
- **Solution:** Check that your service account has "Vertex AI User" role

### Error: "Project not found"
- **Solution:** Verify your PROJECT_ID is correct (not project name)

### Error: "Billing not enabled"
- **Solution:** Enable billing for your project

### Error: "Location not available"
- **Solution:** Try a different location (us-central1, us-east1, etc.)

---

## Cost Considerations

- **Imagen API Pricing:** Check current pricing at: https://cloud.google.com/vertex-ai/pricing
- **Free Tier:** Google Cloud offers $300 free credit for new accounts
- **Image Generation:** Typically costs per image generated
- **Monitor Usage:** Set up billing alerts in Google Cloud Console

---

## Security Best Practices

1. **Never commit credentials to git:**
   - Add `*.json` (service account keys) to `.gitignore`
   - Add `.env` to `.gitignore`

2. **Use environment variables:**
   - Store credentials in `.env` file (not committed)
   - Use environment variables in production

3. **Restrict API keys:**
   - Limit API keys to specific APIs
   - Restrict by IP or referrer when possible

4. **Rotate keys regularly:**
   - Update service account keys periodically
   - Revoke unused API keys

---

## Next Steps

Once setup is complete:

1. Test image generation: `node scripts/generate-image.js 1`
2. Generate all 16 archetype images
3. Integrate into build process
4. Set up automated image generation workflow

---

## Quick Reference

**Project Dashboard:** https://console.cloud.google.com/home/dashboard
**APIs & Services:** https://console.cloud.google.com/apis/library
**Service Accounts:** https://console.cloud.google.com/iam-admin/serviceaccounts
**Credentials:** https://console.cloud.google.com/apis/credentials
**Billing:** https://console.cloud.google.com/billing

---

**Need Help?**
- Google Cloud Documentation: https://cloud.google.com/docs
- Vertex AI Documentation: https://cloud.google.com/vertex-ai/docs
- Imagen API Docs: https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview

