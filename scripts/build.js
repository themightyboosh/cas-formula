#!/usr/bin/env node

/**
 * Build script for Realness Score Assessment App
 * Creates standalone distribution in dist/standalone
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist', 'standalone');

// Ensure dist directory exists
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Copy file or directory recursively
function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    
    if (stat.isDirectory()) {
        ensureDir(dest);
        const files = fs.readdirSync(src);
        files.forEach(file => {
            copyRecursive(
                path.join(src, file),
                path.join(dest, file)
            );
        });
    } else {
        const destDir = path.dirname(dest);
        ensureDir(destDir);
        fs.copyFileSync(src, dest);
    }
}

// Read file content
function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

// Write file content
function writeFile(filePath, content) {
    const dir = path.dirname(filePath);
    ensureDir(dir);
    fs.writeFileSync(filePath, content, 'utf-8');
}

// Build standalone version
async function build() {
    console.log('🚀 Building Realness Score Assessment App...\n');
    
    // Clean dist directory
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    ensureDir(distDir);
    
    // Copy HTML
    console.log('📄 Copying HTML...');
    const htmlContent = readFile(path.join(srcDir, 'index.html'));
    writeFile(path.join(distDir, 'index.html'), htmlContent);
    
    // Copy CSS
    console.log('🎨 Copying CSS...');
    copyRecursive(
        path.join(srcDir, 'styles.css'),
        path.join(distDir, 'styles.css')
    );
    
    // Copy JavaScript
    console.log('📜 Copying JavaScript...');
    copyRecursive(
        path.join(srcDir, 'app.js'),
        path.join(distDir, 'app.js')
    );
    
    // Copy data files
    console.log('📊 Copying data files...');
    copyRecursive(
        path.join(srcDir, 'data'),
        path.join(distDir, 'data')
    );
    
    // Copy assets (images)
    console.log('🖼️  Copying assets...');
    copyRecursive(
        path.join(srcDir, 'assets'),
        path.join(distDir, 'assets')
    );
    
    // Copy utils
    console.log('🔧 Copying utilities...');
    copyRecursive(
        path.join(srcDir, 'utils'),
        path.join(distDir, 'utils')
    );
    
    // Create README for distribution
    const readmeContent = `# Realness Score Assessment - Standalone Distribution

This is a standalone distribution of the Realness Score Assessment app.

## Files

- \`index.html\` - Main HTML file
- \`styles.css\` - All styles
- \`app.js\` - Main application JavaScript
- \`data/\` - JSON data files (config, questions, archetypes)
- \`assets/\` - Images and other assets
- \`utils/\` - Utility scripts (analytics)

## Usage

Simply open \`index.html\` in a web browser, or serve the directory with any static file server.

### Local Development Server

\`\`\`bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
\`\`\`

Then open http://localhost:8000 in your browser.

## Deployment

This standalone version can be deployed to any static hosting service:
- Firebase Hosting
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static file server

## Requirements

- Modern web browser with JavaScript enabled
- No build step required
- No dependencies required
`;
    
    writeFile(path.join(distDir, 'README.md'), readmeContent);
    
    console.log('\n✅ Build complete!');
    console.log(`📦 Output: ${distDir}`);
    console.log('\nTo preview locally:');
    console.log('  cd dist/standalone');
    console.log('  python3 -m http.server 8000');
    console.log('  Then open http://localhost:8000\n');
}

// Run build
build().catch(error => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});

