/**
 * Script to populate Firestore with 504 affect combinations
 * Parses New RAG/top3_affect_matrix.md and uploads to affectCombinations collection
 *
 * Run: node scripts/populateFirestore.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json'); // You'll need to download this

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper function: Convert affect name to CAS code
function getCASCode(affect) {
  const codes = {
    'Curiosity': 'Cu',
    'Joy': 'Jo',
    'Surprise–Startle': 'St',
    'Fear': 'Fe',
    'Anger': 'An',
    'Sadness': 'Sa',
    'Disgust': 'Di',
    'Pulling-Away': 'Pu',
    'The Drop': 'Dr'
  };
  return codes[affect] || 'Xx';
}

// Parse markdown table
function parseMatrixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const combinations = [];
  let inTable = false;

  for (const line of lines) {
    // Skip header and separator rows
    if (line.startsWith('| :---') || line.startsWith('| Affect 1')) {
      inTable = true;
      continue;
    }

    // Parse data rows
    if (inTable && line.startsWith('|')) {
      const cells = line.split('|').map(cell => cell.trim()).filter(Boolean);

      if (cells.length >= 9) {
        const affect1 = cells[0];
        const affect2 = cells[1];
        const affect3 = cells[2];
        const overallValence = cells[3];
        const feeling = cells[4];
        const approach = cells[5];
        const weather = cells[6];
        const musicGenre = cells[7];
        const imagePromptBase = cells[8];

        // Generate CAS element
        const casElement = getCASCode(affect1) + getCASCode(affect2) + getCASCode(affect3);

        combinations.push({
          id: casElement,
          affect1,
          affect2,
          affect3,
          overallValence,
          feeling,
          approach,
          weather,
          musicGenre,
          imagePromptBase,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
  }

  return combinations;
}

// Upload to Firestore
async function populateFirestore() {
  console.log('🔥 Starting Firestore population...\n');

  const matrixPath = path.join(__dirname, '../New RAG/top3_affect_matrix.md');

  if (!fs.existsSync(matrixPath)) {
    console.error('❌ Matrix file not found:', matrixPath);
    process.exit(1);
  }

  console.log('📖 Parsing matrix file...');
  const combinations = parseMatrixFile(matrixPath);

  console.log(`✅ Found ${combinations.length} combinations\n`);

  if (combinations.length === 0) {
    console.error('❌ No combinations parsed from file');
    process.exit(1);
  }

  // Upload in batches (Firestore has a 500 write limit per batch)
  const batchSize = 500;
  const batches = [];

  for (let i = 0; i < combinations.length; i += batchSize) {
    batches.push(combinations.slice(i, i + batchSize));
  }

  console.log(`📦 Uploading ${batches.length} batch(es)...\n`);

  let uploaded = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = db.batch();
    const currentBatch = batches[i];

    for (const combo of currentBatch) {
      const docRef = db.collection('affectCombinations').doc(combo.id);
      batch.set(docRef, combo);
    }

    await batch.commit();
    uploaded += currentBatch.length;
    console.log(`✅ Batch ${i + 1}/${batches.length} uploaded (${uploaded}/${combinations.length} total)`);
  }

  console.log(`\n🎉 Successfully uploaded ${uploaded} affect combinations to Firestore!`);
  console.log('\nSample combinations:');
  console.log('  - CuJoSt (Curiosity, Joy, Surprise–Startle)');
  console.log('  - FeAnSa (Fear, Anger, Sadness)');
  console.log('  - JoCuDr (Joy, Curiosity, The Drop)');
  console.log('\nFirestore collection: affectCombinations');
  console.log('Total documents:', uploaded);

  process.exit(0);
}

// Run the script
populateFirestore().catch((error) => {
  console.error('❌ Error populating Firestore:', error);
  process.exit(1);
});
