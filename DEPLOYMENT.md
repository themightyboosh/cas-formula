# Deployment Guide

## ✅ Git Commit Complete

All changes have been committed to the local repository.

**Commit:** `00764aa` - Build complete Realness Score assessment app

## 🚀 Deploy to Firebase Hosting

### Step 1: Authenticate Firebase CLI

```bash
firebase login --reauth
```

This will open a browser window for authentication.

### Step 2: Initialize Firebase Hosting (if not done)

```bash
firebase init hosting
```

When prompted:
- **Public directory**: `dist/standalone`
- **Single-page app**: Yes
- **Automatic builds**: No

### Step 3: Deploy

```bash
npm run build
firebase deploy --only hosting
```

Or use the deploy script:

```bash
./scripts/deploy.sh
```

### Step 4: Access Your App

After deployment, your app will be live at:
- **Firebase Hosting**: `https://realness-score.web.app`
- **Custom Domain**: (can be configured in Firebase Console)

## 📦 Git Remote (Optional)

If you want to push to GitHub:

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/assessment.git
git branch -M main
git push -u origin main
```

## 🔍 Verify Deployment

1. Check Firebase Console: https://console.firebase.google.com/project/realness-score/hosting
2. Visit your live URL
3. Test all features:
   - Answer questions
   - Check progress tracking
   - Submit and see results
   - Test social sharing
   - Verify responsive design

## 📝 Next Steps

1. **Set up custom domain** (optional):
   - Firebase Console → Hosting → Add custom domain

2. **Configure Analytics** (optional):
   - Set up Google Analytics 4
   - Add Measurement ID to environment variables

3. **Update external links**:
   - Edit `src/index.html`:
     - `methodologyLink` - Link to methodology page
     - `websiteLink` - Link to Dr. Conkright's website

4. **Monitor usage**:
   - Check Firebase Analytics
   - Monitor completion rates
   - Track archetype distribution

## 🐛 Troubleshooting

### Firebase Authentication Error
```bash
firebase login --reauth
```

### Build Fails
```bash
node scripts/build.js
```

### Deployment Fails
- Check Firebase project: `firebase use realness-score`
- Verify hosting is initialized: `firebase init hosting`
- Check `firebase.json` configuration

