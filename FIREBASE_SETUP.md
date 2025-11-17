# Firebase Hosting Setup Guide

## ✅ Completed Steps

1. ✅ Created Google Cloud project: `realness-score`
2. ✅ Created Firebase configuration files:
   - `firebase.json` - Hosting configuration
   - `.firebaserc` - Project selection

## 🔐 Authentication Required

You need to authenticate Firebase CLI:

```bash
firebase login --reauth
```

This will open a browser window for you to authenticate with your Google account.

## 📋 Next Steps

### 1. Authenticate Firebase CLI
```bash
cd /Users/danielcrowder/Desktop/Projects/Assessment
firebase login --reauth
```

### 2. Link Firebase Project
```bash
firebase use realness-score
```

If the project doesn't exist in Firebase yet, create it:
```bash
firebase projects:create realness-score --display-name "Realness Score"
```

### 3. Enable Firebase Hosting
```bash
firebase init hosting
```

When prompted:
- **Public directory**: `dist/standalone` (or `dist` if you prefer)
- **Single-page app**: Yes
- **Automatic builds**: No (we'll deploy manually)

### 4. Enable Billing (if needed)
Firebase Hosting free tier includes:
- 10 GB storage
- 360 MB/day bandwidth
- Custom domain support

If you need more, enable billing in Firebase Console.

## 🚀 Deployment

Once authenticated and configured:

```bash
# Build the app (when ready)
npm run build  # or your build command

# Deploy to Firebase
firebase deploy --only hosting
```

## 📊 Google Analytics Setup

### Option 1: Firebase Analytics (Recommended)
Firebase Analytics is automatically available when using Firebase Hosting.

### Option 2: Google Analytics 4 (GA4)
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property for "Realness Score"
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)
4. Add it to your app's HTML (see `src/index.html` or similar)

## 🔗 Firebase Console

Access your Firebase project:
- Console: https://console.firebase.google.com/project/realness-score
- Hosting: https://console.firebase.google.com/project/realness-score/hosting

## 📝 Environment Variables

Create a `.env` file (already in `.gitignore`):

```bash
# Google Analytics (if using GA4)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Or Firebase Analytics (automatic)
# No config needed
```

## 🎯 Current Configuration

- **Project ID**: `realness-score`
- **Hosting Public Directory**: `dist/standalone`
- **SPA Mode**: Enabled (all routes → index.html)
- **Cache Headers**: Configured for images and assets

## 📚 Resources

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Firebase Analytics Docs](https://firebase.google.com/docs/analytics)
- [Google Analytics 4 Setup](https://support.google.com/analytics/answer/9304153)

