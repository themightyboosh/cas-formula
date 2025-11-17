# Realness Score - Build Plan

## Tech Stack Recommendation

### **Most Portable: Vanilla HTML/CSS/JavaScript**

**Why Vanilla JS?**
- ✅ **Maximum portability**: Works on any web server, no build tools required for runtime
- ✅ **Zero dependencies**: No npm packages needed for the core app
- ✅ **Embeddable**: Can be bundled into single file or minimal fileset
- ✅ **Fast loading**: No framework overhead
- ✅ **Universal compatibility**: Works in all browsers, including older ones
- ✅ **Easy to embed**: Can be iframed or embedded via script tag

**Trade-offs:**
- More manual DOM manipulation (but manageable for this scope)
- Need custom charting (but lightweight SVG/Canvas solutions available)
- Build tools only for image generation and optional bundling

---

## Project Structure

```
assessment/
├── src/                          # Source files (development)
│   ├── index.html               # Main HTML file
│   ├── css/
│   │   └── styles.css           # All styles
│   ├── js/
│   │   ├── data.js              # JSON data (config, questions, archetypes)
│   │   ├── scoring.js           # Scoring and classification logic
│   │   ├── ui.js                # DOM manipulation and rendering
│   │   ├── storage.js           # localStorage management
│   │   ├── charts.js            # Chart generation (SVG/Canvas)
│   │   ├── sharing.js           # Social sharing functionality
│   │   └── analytics.js         # Analytics tracking
│   └── assets/
│       └── images/              # Generated archetype images
│
├── dist/                         # Built/optimized files
│   ├── standalone/              # Standalone version
│   │   ├── index.html
│   │   ├── styles.css
│   │   ├── app.js               # Bundled JS
│   │   └── assets/
│   │       └── images/
│   │
│   └── embeddable/               # Embeddable widget version
│       ├── realness-score.html   # Single-file embeddable version
│       └── realness-score.js     # Script-tag embeddable version
│
├── scripts/                      # Build scripts
│   ├── generate-images.js       # Generate archetype images (build-time)
│   ├── bundle.js                # Bundle JS files
│   └── create-embed.js          # Create embeddable versions
│
├── package.json                  # Build dependencies only
└── README.md
```

---

## Build Strategy

### **Phase 1: Core Development (No Build Tools)**
- Develop in `src/` with separate files
- Use vanilla JS modules (ES6 modules or simple script includes)
- Test directly in browser (no bundling needed)

### **Phase 2: Build-Time Tasks**
- **Image Generation**: Script to generate 16 archetype images via API
- **Bundling**: Optional script to combine JS files (for embeddable version)
- **Minification**: Optional CSS/JS minification

### **Phase 3: Distribution Formats**

#### **1. Standalone Version** (`dist/standalone/`)
- Multiple files (HTML, CSS, JS, images)
- Best for: Hosting on your own domain
- Can be served from any static host

#### **2. Single-File Embeddable** (`dist/embeddable/realness-score.html`)
- All CSS and JS inline in one HTML file
- Best for: Embedding via iframe
- Usage: `<iframe src="realness-score.html" width="100%" height="800px"></iframe>`

#### **3. Script-Tag Embeddable** (`dist/embeddable/realness-score.js`)
- Self-contained widget that injects itself into page
- Best for: Embedding via script tag
- Usage: `<script src="realness-score.js"></script><div id="realness-score-widget"></div>`

---

## Technology Choices

### **Core Stack**
- **HTML5**: Semantic markup
- **CSS3**: Modern CSS (Grid, Flexbox, CSS Variables)
- **Vanilla JavaScript (ES6+)**: Modern JS features, no transpilation needed

### **Optional Build Tools** (for build-time only)
- **Node.js**: For build scripts
- **Image Generation API**: DALL-E, Midjourney, or Stable Diffusion API
- **Optional bundler**: Simple script concatenation or esbuild (lightweight)

### **Charting Library Options**
1. **Custom SVG** (recommended): Lightweight, no dependencies, full control
2. **Chart.js** (if needed): ~60KB, can be bundled or CDN
3. **D3.js** (overkill): Too large for this use case

**Recommendation**: Custom SVG charts - small, no dependencies, perfectly portable

### **Analytics Options**
- **Google Analytics**: Universal Analytics or GA4
- **Plausible**: Privacy-focused, lightweight
- **Custom**: Simple event tracking endpoint

---

## Embeddable Widget Implementation

### **Option 1: Iframe Embed**
```html
<!-- Host provides -->
<iframe 
  src="https://yourdomain.com/realness-score.html"
  width="100%" 
  height="800px"
  frameborder="0"
  allowtransparency="true">
</iframe>
```

**Pros:**
- Complete isolation (CSS/JS won't conflict)
- Easy to implement
- Secure (sandboxed)

**Cons:**
- Fixed height needed
- Less seamless integration

### **Option 2: Script Tag Embed**
```html
<!-- Host provides -->
<div id="realness-score-container"></div>
<script src="https://yourdomain.com/realness-score.js"></script>
<script>
  RealnessScore.init({
    containerId: 'realness-score-container',
    // Optional config
  });
</script>
```

**Pros:**
- Seamless integration
- Responsive height
- Can share parent page styles (optional)

**Cons:**
- Need namespace isolation
- CSS scoping required

**Recommendation**: Support both options

---

## Build Process

### **Development Workflow**
1. Edit files in `src/`
2. Open `src/index.html` in browser
3. Use browser dev tools for debugging
4. No build step needed during development

### **Production Build**
```bash
# 1. Generate archetype images (one-time, build-time)
npm run generate-images

# 2. Create standalone version
npm run build:standalone

# 3. Create embeddable versions
npm run build:embed

# 4. Optional: Minify
npm run minify
```

### **Build Scripts** (package.json)
```json
{
  "scripts": {
    "generate-images": "node scripts/generate-images.js",
    "build:standalone": "node scripts/bundle.js --standalone",
    "build:embed": "node scripts/create-embed.js",
    "build:all": "npm run generate-images && npm run build:standalone && npm run build:embed"
  },
  "devDependencies": {
    "esbuild": "^0.19.0"  // Optional: for fast bundling
  }
}
```

---

## File Size Targets

### **Standalone Version**
- HTML: ~10-15 KB
- CSS: ~15-20 KB
- JS: ~30-40 KB (unminified)
- Images: ~200-500 KB total (16 images, optimized)
- **Total: ~300-600 KB** (reasonable for modern web)

### **Single-File Embeddable**
- All inline: ~400-700 KB (one HTML file)
- Gzipped: ~100-150 KB (excellent for embedding)

### **Script-Tag Embeddable**
- JS bundle: ~50-60 KB (minified)
- CSS inline in JS: ~20 KB
- **Total: ~70-80 KB** (very portable)

---

## Portability Features

### **Self-Contained**
- ✅ No external CDN dependencies (optional: can use CDN for analytics)
- ✅ All images bundled
- ✅ All data embedded in JS
- ✅ Works offline (after initial load)

### **Cross-Platform**
- ✅ Works on any web server (Apache, Nginx, Netlify, Vercel, GitHub Pages)
- ✅ No server-side requirements
- ✅ No database needed
- ✅ Can be served from S3, Cloudflare, etc.

### **Browser Support**
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Graceful degradation for older browsers

---

## Implementation Phases

### **Phase 1: Core App** (Week 1)
- [ ] HTML structure
- [ ] CSS styling (dark theme)
- [ ] Question rendering
- [ ] Answer collection
- [ ] Scoring algorithm
- [ ] Results display

### **Phase 2: Enhanced Features** (Week 2)
- [ ] Progress tracking
- [ ] localStorage persistence
- [ ] Email collection
- [ ] Animations/transitions
- [ ] Charts/visualizations

### **Phase 3: Viral Features** (Week 3)
- [ ] Social sharing
- [ ] Shareable URLs
- [ ] OG image generation
- [ ] Comparison features
- [ ] Statistics display

### **Phase 4: Embeddable & Polish** (Week 4)
- [ ] Image generation (build-time)
- [ ] Embeddable widget versions
- [ ] Analytics integration
- [ ] SEO optimization
- [ ] Testing & optimization

---

## Recommendations

### **Best Approach for Maximum Portability:**
1. **Core**: Pure vanilla JS, no frameworks
2. **Charts**: Custom SVG (no library dependencies)
3. **Build tools**: Minimal (only for image generation and optional bundling)
4. **Distribution**: Multiple formats (standalone + embeddable)

### **For Embeddability:**
- **Iframe version**: Easiest, most isolated
- **Script tag version**: More flexible, better UX
- **Support both**: Maximum compatibility

### **Dependencies:**
- **Runtime**: Zero dependencies
- **Build-time**: Only image generation API (one-time)
- **Optional**: esbuild for bundling (lightweight, fast)

---

## Next Steps

1. ✅ Create project structure
2. ✅ Set up development environment
3. ✅ Build core assessment functionality
4. ✅ Add enhanced features
5. ✅ Create embeddable versions
6. ✅ Generate images
7. ✅ Deploy and test

---

**This approach gives you maximum portability while supporting both standalone and embeddable use cases.**

