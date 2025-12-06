// Firebase Configuration
// Replace these values with your actual Firebase project credentials
// Get these from: Firebase Console → Project Settings → General → Your apps

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "realness-score.firebaseapp.com",
    projectId: "realness-score",
    storageBucket: "realness-score.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseConfig;
}
