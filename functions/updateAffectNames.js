const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

async function updateAffectNames() {
    try {
        console.log('Starting affect name updates in Firestore...');

        const collectionRef = db.collection('affectCombinations');
        const snapshot = await collectionRef.get();

        let updateCount = 0;
        const batch = db.batch();
        let batchCount = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            let needsUpdate = false;
            const updates = {};

            // Check if approach text contains old affect names
            if (data.approach) {
                let updatedApproach = data.approach;

                // Replace Surprise-Startle and Surprise–Startle with Surprise
                if (updatedApproach.includes('Surprise-Startle') || updatedApproach.includes('Surprise–Startle')) {
                    updatedApproach = updatedApproach.replace(/Surprise-Startle/g, 'Surprise');
                    updatedApproach = updatedApproach.replace(/Surprise–Startle/g, 'Surprise');
                    needsUpdate = true;
                }

                // Replace Pulling-Away with Withdrawing
                if (updatedApproach.includes('Pulling-Away')) {
                    updatedApproach = updatedApproach.replace(/Pulling-Away/g, 'Withdrawing');
                    needsUpdate = true;
                }

                // Replace The Drop with Dropping
                if (updatedApproach.includes('The Drop')) {
                    updatedApproach = updatedApproach.replace(/The Drop/g, 'Dropping');
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    updates.approach = updatedApproach;
                }
            }

            // If updates needed, add to batch
            if (needsUpdate) {
                batch.update(doc.ref, updates);
                updateCount++;
                batchCount++;

                console.log(`Updated ${doc.id}`);

                // Commit batch every 500 documents (Firestore limit)
                if (batchCount >= 500) {
                    await batch.commit();
                    console.log(`Committed batch of ${batchCount} updates`);
                    batchCount = 0;
                }
            }
        }

        // Commit remaining updates
        if (batchCount > 0) {
            await batch.commit();
            console.log(`Committed final batch of ${batchCount} updates`);
        }

        console.log(`\nComplete! Updated ${updateCount} documents.`);
        console.log('Changes:');
        console.log('  - Surprise-Startle → Surprise');
        console.log('  - Surprise–Startle → Surprise');
        console.log('  - Pulling-Away → Withdrawing');
        console.log('  - The Drop → Dropping');

    } catch (error) {
        console.error('Error updating affect names:', error);
    } finally {
        process.exit();
    }
}

// Run the update
updateAffectNames();
