const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
admin.initializeApp();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyBhD7ZmVn-mWl2-Ic8fLla3N09edQuEsAY');

const INPUT_FILE = '/Users/danielcrowder/Desktop/Projects/Assessment/New RAG/top3_affect_matrix.md';
const OUTPUT_FILE = '/Users/danielcrowder/Desktop/Projects/Assessment/New RAG/top3_affect_matrix_processed.md';

// Global substitutions to apply
const SUBSTITUTIONS = {
    'Surprise–Startle': 'Surprise',
    'Surprise-Startle': 'Surprise',
    'Pulling-Away': 'Withdrawing',
    'The Drop': 'Dropping'
};

// Parse markdown table
function parseMarkdownTable(content) {
    const lines = content.split('\n');
    const header = lines[0];
    const separator = lines[1];

    // Find the actual start of the data (after header and separator)
    let dataStartIndex = 5; // Skip header comment lines and table header

    const rows = [];
    for (let i = dataStartIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || !line.startsWith('|')) continue;

        // Split by | and remove empty first/last elements
        const cells = line.split('|').map(c => c.trim()).filter(c => c);

        // Skip separator rows (contain :--- patterns)
        if (cells.length > 0 && cells[0].includes(':---')) continue;

        if (cells.length >= 9) {
            rows.push({
                affect1: cells[0],
                affect2: cells[1],
                affect3: cells[2],
                valence: cells[3],
                feeling: cells[4],
                approach: cells[5],
                weather: cells[6],
                musicGenre: cells[7],
                imagePrompt: cells[8]
            });
        }
    }

    return { header, separator, rows };
}

// Apply global substitutions to all text
function applySubstitutions(text) {
    let result = text;
    for (const [oldText, newText] of Object.entries(SUBSTITUTIONS)) {
        result = result.replace(new RegExp(oldText, 'g'), newText);
    }
    return result;
}

// Normalize to sentence case (capitalize first letter, rest lowercase for affect names)
function normalizeSentenceCase(text) {
    // Only normalize affect names in specific columns, not the entire text
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Rewrite approach text using Gemini with retry logic
async function rewriteApproach(originalApproach, affect1, affect2, affect3, retries = 3) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a Jungian and Lacanian-trained therapist expert in affect theory (Silvan Tomkins).

**Task:** Rewrite the following therapeutic guidance to be more naturalistic, conversational, and creative while maintaining:
- The same general length and structure
- The three-part structure addressing each affect
- The compassionate, grounded, poetic tone
- The core therapeutic message
- The exact closing phrase: "Don't push it away, just let it sit."

**Important rules:**
- No em-dashes (—) anywhere
- Use natural, flowing language
- Keep the affect names as provided: ${affect1}, ${affect2}, ${affect3}
- Sound like a warm, wise therapist speaking directly to someone
- Don't make it overly formal or clinical
- Maintain therapeutic specificity to each affect

**Original text:**
${originalApproach}

**Rewritten version (natural, creative, same length, no em-dashes):**`;

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            let rewritten = response.text().trim();

            // Remove any remaining em-dashes
            rewritten = rewritten.replace(/—/g, '-');

            // Remove quotes if AI wrapped the response
            if (rewritten.startsWith('"') && rewritten.endsWith('"')) {
                rewritten = rewritten.slice(1, -1);
            }

            return rewritten;
        } catch (error) {
            // Check if it's a rate limit error (429)
            if (error.status === 429 && attempt < retries - 1) {
                const waitTime = Math.pow(2, attempt) * 60000; // Exponential backoff: 60s, 120s, 240s
                console.error(`  Rate limit hit, waiting ${waitTime/1000}s before retry ${attempt + 1}/${retries}`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            console.error(`Error rewriting approach (attempt ${attempt + 1}/${retries}):`, error.message);

            // On final attempt, return original
            if (attempt === retries - 1) {
                return originalApproach;
            }
        }
    }

    return originalApproach; // Fallback to original if all retries failed
}

// Process all rows
async function processMatrix() {
    console.log('Reading matrix file...');
    const content = fs.readFileSync(INPUT_FILE, 'utf-8');

    console.log('Parsing table...');
    const { header, separator, rows } = parseMarkdownTable(content);

    console.log(`Found ${rows.length} rows to process\n`);

    const processedRows = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        console.log(`Processing row ${i + 1}/${rows.length}: ${row.affect1}, ${row.affect2}, ${row.affect3}`);

        // Apply substitutions to all fields
        const affect1 = normalizeSentenceCase(applySubstitutions(row.affect1));
        const affect2 = normalizeSentenceCase(applySubstitutions(row.affect2));
        const affect3 = normalizeSentenceCase(applySubstitutions(row.affect3));
        const valence = applySubstitutions(row.valence);
        const feeling = applySubstitutions(row.feeling);
        const weather = applySubstitutions(row.weather);
        const musicGenre = applySubstitutions(row.musicGenre);
        const imagePrompt = applySubstitutions(row.imagePrompt);

        // Rewrite approach with AI
        const originalApproach = applySubstitutions(row.approach);
        console.log(`  Original: ${originalApproach.substring(0, 60)}...`);

        const newApproach = await rewriteApproach(originalApproach, affect1, affect2, affect3);
        console.log(`  Rewritten: ${newApproach.substring(0, 60)}...`);

        processedRows.push({
            affect1,
            affect2,
            affect3,
            valence,
            feeling,
            approach: newApproach,
            weather,
            musicGenre,
            imagePrompt
        });

        // Delay to respect rate limits (Blaze plan = higher limits, 1 second delay)
        if (i < rows.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('');
    }

    console.log('\nGenerating output file...');

    // Write output file
    let output = `# Top-3 Affect Matrix (Order Matters) - Processed\n\n`;
    output += `Think like a jungian and Lacan trained therapist expert in affect theory. The goal is synthesize answers that are elegant based on their top 3 affects (according to tomkins affect theory).\n\n`;
    output += `| Affect 1 | Affect 2 | Affect 3 | Overall Valence | Feeling | Approach | Weather | Music Genre | Image Prompt |\n`;
    output += `| :------- | :------- | :------- | :-------------- | :------ | :------- | :------ | :---------- | :----------- |\n`;

    for (const row of processedRows) {
        output += `| ${row.affect1} | ${row.affect2} | ${row.affect3} | ${row.valence} | ${row.feeling} | ${row.approach} | ${row.weather} | ${row.musicGenre} | ${row.imagePrompt} |\n`;
    }

    fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

    console.log(`\nComplete! Processed ${processedRows.length} rows.`);
    console.log(`Output written to: ${OUTPUT_FILE}`);
    console.log('\nChanges applied:');
    console.log('  - Surprise–Startle / Surprise-Startle → Surprise');
    console.log('  - Pulling-Away → Withdrawing');
    console.log('  - The Drop → Dropping');
    console.log('  - Sentence case normalization for affect names');
    console.log('  - All Approach texts rewritten to be more naturalistic');
    console.log('  - All em-dashes removed');

    process.exit(0);
}

// Run the script
processMatrix().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
