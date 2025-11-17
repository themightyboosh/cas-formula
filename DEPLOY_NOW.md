# 🚀 Deploy Now - Quick Steps

## Authentication Required

Firebase CLI needs to be authenticated. Run this command in your terminal:

```bash
firebase login --reauth
```

This will open a browser window for you to authenticate with your Google account.

## After Authentication

Once authenticated, run:

```bash
cd /Users/danielcrowder/Desktop/Projects/Assessment
firebase use realness-score
firebase deploy --only hosting
```

## Alternative: One-Line Deploy

After authentication, you can use the deploy script:

```bash
./scripts/deploy.sh
```

## Expected Result

After successful deployment, you'll see:
- ✅ Deployment complete
- 🌐 Your app URL: `https://realness-score.web.app`

## Troubleshooting

If you get "project not found" error:
1. Go to https://console.firebase.google.com/
2. Create a new project named "realness-score" (or use existing)
3. Enable Firebase Hosting
4. Run `firebase use realness-score` again

