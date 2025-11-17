# Fix Firebase Deployment Error

## Error Message
```
Error: Assertion failed: resolving hosting target of a site with no site name or target name
```

This error occurs because:
1. Firebase authentication is expired
2. Firebase project may not exist or hosting isn't initialized

## Solution Steps

### Step 1: Authenticate Firebase
```bash
firebase login --reauth
```
This will open a browser window for Google authentication.

### Step 2: Create Firebase Project (if needed)

If the project doesn't exist, create it:

**Option A: Via Firebase Console (Recommended)**
1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Name it: `realness-score`
4. Enable Firebase Hosting when prompted

**Option B: Via CLI (after authentication)**
```bash
firebase projects:create realness-score --display-name "Realness Score"
```

### Step 3: Link Project
```bash
firebase use realness-score
```

### Step 4: Initialize Hosting
```bash
firebase init hosting
```

When prompted:
- **What do you want to use as your public directory?** → `dist/standalone`
- **Configure as a single-page app?** → `Yes`
- **Set up automatic builds?** → `No`

### Step 5: Deploy
```bash
firebase deploy --only hosting
```

## Quick Fix Script

After authenticating, you can run:

```bash
# Make sure project exists
firebase projects:list

# If project doesn't exist, create it:
firebase projects:create realness-score --display-name "Realness Score"

# Link project
firebase use realness-score

# Initialize hosting (if not already done)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## Alternative: Use Firebase Console

1. Go to https://console.firebase.google.com/
2. Create/select project `realness-score`
3. Go to Hosting section
4. Click "Get started"
5. Follow the manual upload instructions OR connect via CLI

## Verify Setup

Check your Firebase configuration:
```bash
firebase projects:list
firebase use
cat .firebaserc
cat firebase.json
```

All should show `realness-score` as the active project.

