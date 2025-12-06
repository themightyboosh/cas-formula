# Feel it, Don't Think It

An affect assessment app powered by AI that helps users understand their bodily signals (affects) toward people, situations, or concepts using Silvan Tomkins' Core Affect System (CAS).

---

## 🎯 Project Status: Ready for Deployment

All infrastructure, AI prompts, admin tools, and integration guides are complete. Ready to deploy to Firebase.

## Features

✅ **40 Questions** across 4 domains (A-D)  
✅ **16 Archetypes** with Manhattan distance classification  
✅ **Progress Tracking** with localStorage persistence  
✅ **Email Collection** before results display  
✅ **Visual Charts** for domain scores  
✅ **Social Sharing** (Twitter, Facebook, LinkedIn, native share)  
✅ **Shareable URLs** with encoded results  
✅ **Compatibility Scores** between archetypes  
✅ **Analytics Integration** (Firebase Analytics / Google Analytics 4)  
✅ **Responsive Design** (mobile, tablet, desktop)  
✅ **Animated Background** with dark gray circles  
✅ **Accessibility** features (ARIA labels, semantic HTML)  

## Project Structure

```
Assessment/
├── src/                    # Source files
│   ├── index.html         # Main HTML
│   ├── styles.css         # All styles
│   ├── app.js             # Main application logic
│   ├── data/              # JSON data files
│   │   ├── config.json
│   │   ├── questions.json
│   │   └── archetypes.json
│   ├── assets/            # Images and assets
│   │   └── images/        # 16 archetype images
│   └── utils/             # Utility scripts
│       └── analytics.js   # Analytics integration
├── dist/standalone/       # Built standalone version
├── scripts/               # Build and utility scripts
│   ├── build.js          # Build script
│   └── generate-image.js # Image generation script
├── docs/                  # Documentation
└── preview.html           # Design reference

```

## Quick Start

### Development

1. **Serve the source files:**
   ```bash
   cd src
   python3 -m http.server 8000
   ```
   Then open http://localhost:8000

### Build

1. **Build standalone version:**
   ```bash
   npm run build
   # or
   node scripts/build.js
   ```

2. **Preview built version:**
   ```bash
   cd dist/standalone
   python3 -m http.server 8000
   ```

### Deployment

1. **Firebase Hosting:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

2. **Other static hosts:**
   - Deploy the `dist/standalone` directory to any static hosting service

## Configuration

### Analytics

Set up analytics by:

1. **Firebase Analytics** (automatic with Firebase Hosting)
2. **Google Analytics 4:**
   - Create a GA4 property
   - Get your Measurement ID (`G-XXXXXXXXXX`)
   - Add to `.env`: `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

### External Links

Update these in `src/index.html`:
- `methodologyLink` - Link to methodology page
- `websiteLink` - Link to Dr. Conkright's website

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript** - No frameworks, ES6 modules
- **JSON** - Data storage
- **localStorage** - Progress persistence

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

© Dr. Scott Conkright

## Documentation

- [Full Specification](./docs/RealnessScore_FullPrompt.md)
- [Firebase Setup](./FIREBASE_SETUP.md)
- [Hosting Requirements](./HOSTING_REQUIREMENTS.md)

