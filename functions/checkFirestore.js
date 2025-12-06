const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

async function checkFirestore() {
    try {
        console.log('Checking Firestore affectCombinations collection...\n');

        const collectionRef = db.collection('affectCombinations');
        const snapshot = await collectionRef.limit(5).get();

        console.log(`Total documents found: ${snapshot.size}`);
        console.log('\nFirst 5 documents:');
        console.log('==================\n');

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`Document ID: ${doc.id}`);
            console.log(`Approach: ${data.approach ? data.approach.substring(0, 100) + '...' : 'N/A'}`);
            console.log(`Feeling: ${data.feeling || 'N/A'}`);
            console.log('---\n');
        });

    } catch (error) {
        console.error('Error checking Firestore:', error);
    } finally {
        process.exit();
    }
}

checkFirestore();
