/**
 * Export affect combinations from markdown to JSON
 * Run: node scripts/exportToJSON.js
 */

const fs = require('fs');
const path = require('path');

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
          imagePromptBase
        });
      }
    }
  }

  return combinations;
}

// Main export function
function exportToJSON() {
  console.log('📦 Exporting affect combinations to JSON...\n');

  const matrixPath = path.join(__dirname, '../New RAG/top3_affect_matrix.md');
  const outputPath = path.join(__dirname, '../affectCombinations.json');

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

  // Write to JSON
  const jsonContent = JSON.stringify(combinations, null, 2);
  fs.writeFileSync(outputPath, jsonContent, 'utf-8');

  console.log(`✅ Exported to: ${outputPath}`);
  console.log(`📊 File size: ${(jsonContent.length / 1024).toFixed(2)} KB`);
  console.log(`\n🎉 Export complete!`);
  console.log('\nSample entries:');
  console.log('  -', combinations[0].id, '(', combinations[0].affect1, combinations[0].affect2, combinations[0].affect3, ')');
  console.log('  -', combinations[100].id, '(', combinations[100].affect1, combinations[100].affect2, combinations[100].affect3, ')');
  console.log('  -', combinations[200].id, '(', combinations[200].affect1, combinations[200].affect2, combinations[200].affect3, ')');
}

// Run the script
exportToJSON();
