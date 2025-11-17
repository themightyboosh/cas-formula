#!/bin/bash

# Firebase Hosting Setup Script
# This script helps set up Firebase Hosting for the Realness Score app

set -e

echo "🚀 Setting up Firebase Hosting..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install with:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check authentication
echo "📋 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  Not authenticated. Please run:"
    echo "   firebase login --reauth"
    exit 1
fi

echo "✅ Authenticated"
echo ""

# Check if project exists
echo "📋 Checking Firebase project..."
PROJECT_EXISTS=$(firebase projects:list 2>/dev/null | grep -q "realness-score" && echo "yes" || echo "no")

if [ "$PROJECT_EXISTS" = "no" ]; then
    echo "⚠️  Project 'realness-score' not found."
    echo "Creating project..."
    firebase projects:create realness-score --display-name "Realness Score"
    echo "✅ Project created"
else
    echo "✅ Project 'realness-score' exists"
fi

echo ""

# Use the project
echo "📋 Linking project..."
firebase use realness-score
echo "✅ Project linked"
echo ""

# Build the app
echo "📦 Building app..."
node scripts/build.js
echo "✅ Build complete"
echo ""

# Check if hosting is initialized
if [ ! -f ".firebase/hosting.cache" ]; then
    echo "📋 Initializing Firebase Hosting..."
    echo ""
    echo "When prompted:"
    echo "  - Site ID: realness-score"
    echo "  - Public directory: dist/standalone"
    echo "  - Single-page app: Yes"
    echo "  - Automatic builds: No"
    echo ""
    read -p "Press Enter to continue..."
    firebase init hosting --project realness-score
else
    echo "✅ Hosting already initialized"
fi

echo ""
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Setup complete!"
echo "🌐 Your app is live at: https://realness-score.web.app"

