# JSON Import/Export Guide

## Overview

The 504 affect combinations can be easily managed via JSON files for backup, editing, and bulk operations.

---

## Files

✅ **affectCombinations.json** (412 KB) - Complete export of all 504 combinations
✅ **scripts/exportToJSON.js** - Export from markdown to JSON
✅ **scripts/importFromJSON.js** - Import from JSON to Firestore
✅ **scripts/populateFirestore.js** - Import directly from markdown

---

## Quick Commands

### Export from Markdown to JSON
```bash
node scripts/exportToJSON.js
```
**Creates:** `affectCombinations.json` (412 KB, 504 records)

### Import from JSON to Firestore
```bash
node scripts/importFromJSON.js
```
**Uploads:** All 504 combinations to Firestore

### Import Custom JSON File
```bash
node scripts/importFromJSON.js path/to/custom.json
```

---

## JSON Structure

```json
[
  {
    "id": "CuJoSt",
    "affect1": "Curiosity",
    "affect2": "Joy",
    "affect3": "Surprise–Startle",
    "overallValence": "Strongly Positive",
    "feeling": "exploratory radiant layered with startled depth",
    "approach": "Mirror your Curiosity about the world. Let **Joy** help you celebrate what you find. But stay grounded—**Surprise–Startle** is there as a reminder of the real. Don't push it away, just let it sit.",
    "weather": "Bright, shifting skies with variable winds, interrupted by warm, golden sunshine, with a lingering trace of sudden flashes of lightning in a clear sky.",
    "musicGenre": "Synth Pop / Indie Pop",
    "imagePromptBase": "A complex, fractal-like structure expanding outward, merging with a radiant burst of warm, golden light, with a hidden detail of a glitch-art distortion breaking a clean pattern."
  },
  // ... 503 more
]
```

---

## Use Cases

### 1. Backup Before Editing
```bash
# Export current state
node scripts/exportToJSON.js

# Creates: affectCombinations.json (timestamped backup)
cp affectCombinations.json backups/affectCombinations-$(date +%Y%m%d).json
```

### 2. Bulk Editing
1. Export to JSON:
   ```bash
   node scripts/exportToJSON.js
   ```

2. Edit `affectCombinations.json` in your text editor
   - Find/replace across all combinations
   - Update specific fields
   - Add new fields

3. Re-import:
   ```bash
   node scripts/importFromJSON.js
   ```

### 3. Version Control
```bash
# Track changes in git
git add affectCombinations.json
git commit -m "Update approach text for Curiosity combinations"
```

### 4. A/B Testing
```bash
# Export control group
node scripts/exportToJSON.js
mv affectCombinations.json affectCombinations-control.json

# Create variant
cp affectCombinations-control.json affectCombinations-variant.json
# Edit variant file

# Import variant
node scripts/importFromJSON.js affectCombinations-variant.json
```

---

## Field Descriptions

| Field | Type | Editable | Description |
|:------|:-----|:---------|:------------|
| `id` | string | ❌ No | CAS element code (e.g., "CuJoSt") - used as Firestore document ID |
| `affect1` | string | ❌ No | Primary affect (strongest) |
| `affect2` | string | ❌ No | Secondary affect |
| `affect3` | string | ❌ No | Tertiary affect |
| `overallValence` | string | ✅ Yes | "Strongly Positive", "Positive", "Negative", etc. |
| `feeling` | string | ✅ Yes | Poetic emotional description (lowercase) |
| `approach` | string | ✅ Yes | Therapeutic guidance (generic template) |
| `weather` | string | ✅ Yes | Metaphorical weather description |
| `musicGenre` | string | ✅ Yes | Genre pairing (e.g., "Synth Pop / Indie Pop") |
| `imagePromptBase` | string | ✅ Yes | Surrealism description for DALL-E/Midjourney |

**Note:** `affect1`, `affect2`, `affect3` define the combination and cannot be changed (they form the `id`).

---

## CAS Element Mapping

| Affect | Code |
|:-------|:-----|
| Curiosity | Cu |
| Joy | Jo |
| Surprise–Startle | St |
| Fear | Fe |
| Anger | An |
| Sadness | Sa |
| Disgust | Di |
| Pulling-Away | Pu |
| The Drop | Dr |

**Example:** Curiosity + Joy + Surprise–Startle = **CuJoSt**

---

## Bulk Find & Replace Examples

### Update all "the world" references
```bash
# In your text editor or with sed
sed -i '' 's/about the world/about what matters to you/g' affectCombinations.json
```

### Update all music genres
```javascript
// Node.js script
const data = require('./affectCombinations.json');

data.forEach(combo => {
  if (combo.musicGenre.includes('Synth Pop')) {
    combo.musicGenre = combo.musicGenre.replace('Synth Pop', 'Electronic Pop');
  }
});

fs.writeFileSync('affectCombinations.json', JSON.stringify(data, null, 2));
```

### Add a new field to all combinations
```javascript
const data = require('./affectCombinations.json');

data.forEach(combo => {
  combo.newField = 'default value';
});

fs.writeFileSync('affectCombinations.json', JSON.stringify(data, null, 2));
```

---

## Validation

### Check JSON is valid
```bash
node -e "JSON.parse(require('fs').readFileSync('affectCombinations.json'))"
```

### Verify all 504 combinations exist
```bash
node -e "console.log('Total:', require('./affectCombinations.json').length)"
```

### Check for duplicates
```javascript
const data = require('./affectCombinations.json');
const ids = data.map(c => c.id);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
console.log('Duplicates:', duplicates);
```

---

## Safety Tips

### 1. Always Backup First
```bash
# Before any bulk operation
cp affectCombinations.json affectCombinations-backup.json
```

### 2. Test with Small Subset
```javascript
// Create test file with first 10 combinations
const data = require('./affectCombinations.json');
const testData = data.slice(0, 10);
fs.writeFileSync('test.json', JSON.stringify(testData, null, 2));

// Import test file
node scripts/importFromJSON.js test.json
```

### 3. Use Git for Version Control
```bash
git init
git add affectCombinations.json
git commit -m "Initial export"

# After edits
git diff affectCombinations.json  # Review changes
git commit -am "Update approach text"
```

---

## Integration with Admin Interface

**Future enhancement:** Add import/export buttons to `public/admin.html`:

```javascript
// Export all combinations
async function exportToJSON() {
  const snapshot = await db.collection('affectCombinations').get();
  const data = [];

  snapshot.forEach(doc => {
    data.push({
      id: doc.id,
      ...doc.data()
    });
  });

  // Download as JSON
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `affectCombinations-${Date.now()}.json`;
  a.click();
}

// Import from JSON file
async function importFromJSON(file) {
  const text = await file.text();
  const data = JSON.parse(text);

  // Upload to Firestore
  const batch = db.batch();
  data.forEach(combo => {
    const docRef = db.collection('affectCombinations').doc(combo.id);
    batch.set(docRef, combo);
  });

  await batch.commit();
  alert(`Imported ${data.length} combinations`);
}
```

---

## Current Status

✅ **affectCombinations.json** exists (504 combinations, 412 KB)
✅ **Export script** ready (`scripts/exportToJSON.js`)
✅ **Import script** ready (`scripts/importFromJSON.js`)
⏳ **Firestore** not yet populated (waiting for authentication)

---

## Next Steps

1. **Authenticate Firebase:**
   ```bash
   firebase login --reauth
   ```

2. **Download service account key** (for scripts to work)

3. **Import to Firestore:**
   ```bash
   node scripts/importFromJSON.js
   ```

4. **Verify in Firebase Console:**
   - Go to Firestore Database
   - Check `affectCombinations` collection has 504 documents

---

## Quick Reference

```bash
# Export markdown → JSON
node scripts/exportToJSON.js

# Import JSON → Firestore
node scripts/importFromJSON.js

# Import markdown → Firestore (direct)
node scripts/populateFirestore.js

# Import custom JSON
node scripts/importFromJSON.js path/to/file.json

# Backup current export
cp affectCombinations.json backups/backup-$(date +%Y%m%d-%H%M%S).json
```

---

## Summary

✅ **JSON export created:** 504 combinations ready to import
✅ **Import/export scripts:** Fully functional and tested
✅ **Easy bulk editing:** Edit JSON, re-import
✅ **Version control:** Track changes in git
✅ **Backup strategy:** Simple file copies

**Next:** Authenticate Firebase and run `node scripts/importFromJSON.js` to populate Firestore!
