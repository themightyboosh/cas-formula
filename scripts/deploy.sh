#!/bin/bash

# Deployment script for Realness Score
# Builds the app and deploys to Firebase Hosting

set -e

echo "🚀 Starting deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Run: firebase login"
    exit 1
fi

# Build the app
echo "📦 Building app..."
npm run build

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at: https://realness-score.web.app"

