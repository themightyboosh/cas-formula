#!/bin/bash

# Quick Deploy Script for Realness Score
# Run this after authenticating Firebase

echo "🚀 Deploying Realness Score to Firebase Hosting..."
echo ""

# Check if authenticated
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not authenticated. Please run:"
    echo "   firebase login --reauth"
    exit 1
fi

# Build the app
echo "📦 Building app..."
node scripts/build.js

# Deploy
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your app should be live at: https://realness-score.web.app"

