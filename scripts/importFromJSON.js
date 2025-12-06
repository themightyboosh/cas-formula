/**
 * Import affect combinations from JSON to Firestore
 * Run: node scripts/importFromJSON.js [filename]
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Import from JSON
async function importFromJSON(jsonFilePath) {
  console.log('📦 Importing affect combinations from JSON...\n');

  if (!fs.existsSync(jsonFilePath)) {
    console.error('❌ JSON file not found:', jsonFilePath);
    process.exit(1);
  }

  console.log('📖 Reading JSON file...');
  const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
  const combinations = JSON.parse(fileContent);

  console.log(`✅ Found ${combinations.length} combinations\n`);

  if (combinations.length === 0) {
    console.error('❌ No combinations in JSON file');
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
      batch.set(docRef, {
        ...combo,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await batch.commit();
    uploaded += currentBatch.length;
    console.log(`✅ Batch ${i + 1}/${batches.length} uploaded (${uploaded}/${combinations.length} total)`);
  }

  console.log(`\n🎉 Successfully uploaded ${uploaded} affect combinations to Firestore!`);
  console.log('\nSample combinations:');
  console.log('  -', combinations[0].id, '(', combinations[0].affect1, combinations[0].affect2, combinations[0].affect3, ')');
  console.log('  -', combinations[100].id, '(', combinations[100].affect1, combinations[100].affect2, combinations[100].affect3, ')');
  console.log('  -', combinations[200].id, '(', combinations[200].affect1, combinations[200].affect2, combinations[200].affect3, ')');
  console.log('\nFirestore collection: affectCombinations');
  console.log('Total documents:', uploaded);

  process.exit(0);
}

// Get filename from command line args or use default
const jsonFilePath = process.argv[2] || path.join(__dirname, '../affectCombinations.json');

// Run the script
importFromJSON(jsonFilePath).catch((error) => {
  console.error('❌ Error importing from JSON:', error);
  process.exit(1);
});
