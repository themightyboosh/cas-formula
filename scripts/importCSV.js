const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper: Convert affect name to CAS code
function getCASCode(affect) {
  const codes = {
    'Curiosity': 'Cu',
    'Joy': 'Jo',
    'Surprise': 'St',
    'Fear': 'Fe',
    'Anger': 'An',
    'Sadness': 'Sa',
    'Disgust': 'Di',
    'Withdrawing': 'Pu',
    'Dropping': 'Dr'
  };
  return codes[affect] || 'Xx';
}

async function clearOldData() {
  console.log('🗑️  Clearing old affectCombinations data...');

  const snapshot = await db.collection('affectCombinations').get();
  console.log(`Found ${snapshot.size} existing documents`);

  if (snapshot.size === 0) {
    console.log('No existing data to clear');
    return;
  }

  // Delete in batches of 500
  const batches = [];
  let batch = db.batch();
  let count = 0;

  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
    count++;

    if (count === 500) {
      batches.push(batch);
      batch = db.batch();
      count = 0;
    }
  });

  if (count > 0) {
    batches.push(batch);
  }

  console.log(`Deleting in ${batches.length} batches...`);
  for (let i = 0; i < batches.length; i++) {
    await batches[i].commit();
    console.log(`Deleted batch ${i + 1}/${batches.length}`);
  }

  console.log('✅ Old data cleared!');
}

async function importCSV() {
  console.log('📥 Starting CSV import...');

  // Use affect-combinations-final.csv (new format with 13 columns)
  const csvPath = path.join(__dirname, '../affect-combinations-final.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  // Parse CSV with proper multi-line support
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true
  });

  console.log(`Found ${records.length} records in CSV`);

  let createCount = 0;
  let skipCount = 0;

  // Process each record
  for (let i = 0; i < records.length; i++) {
    const combo = records[i];

    try {
      // Validate required fields
      if (!combo.Affect1 || !combo.Affect2 || !combo.Affect3) {
        console.warn(`Skipping record ${i + 1}: missing affects`);
        skipCount++;
        continue;
      }

      // Generate CAS element code as document ID
      const casElement = getCASCode(combo.Affect1) +
                       getCASCode(combo.Affect2) +
                       getCASCode(combo.Affect3);

      // Store in Firestore with NEW fields from affect-combinations-final.csv
      await db.collection('affectCombinations').doc(casElement).set({
        Affect1: combo.Affect1,
        Affect2: combo.Affect2,
        Affect3: combo.Affect3,
        subject: combo.subject || '{{subject}}', // NEW: placeholder field
        pronoun: combo.pronoun || '{{pronoun}}', // NEW: placeholder field
        approach: combo.approach || '',
        valence_raw: combo.valence_raw || '',
        valence_category: combo.valence_category || '',
        spotify_seed: combo.spotify_seed || '',
        spotify_prompt: combo.spotify_prompt || '',
        weather: combo.weather || '',
        feeling: combo.feeling || '', // NEW: "The [adj] [adj] [noun]" format
        imagePrompt: combo['Feeling 2'] || '' // NEW: renamed from "Feeling 2"
      });

      createCount++;

      // Show progress every 100 items
      if (createCount % 100 === 0) {
        console.log(`Processed ${createCount} combinations...`);
      }

    } catch (recordError) {
      console.error(`Error processing record ${i + 1}:`, recordError.message);
      skipCount++;
    }
  }

  console.log('✅ CSV import complete!');
  console.log(`   Created: ${createCount}`);
  console.log(`   Skipped: ${skipCount}`);
}

async function main() {
  try {
    await clearOldData();
    await importCSV();
    console.log('\n🎉 All done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
