// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB29fRL5UdQodkzCDaKM8Ro7dtXpAf-Uro",
    authDomain: "realness-score.firebaseapp.com",
    projectId: "realness-score",
    storageBucket: "realness-score.firebasestorage.app",
    messagingSenderId: "427953838028",
    appId: "1:427953838028:web:a0461e5b115d7e2835af69",
    measurementId: "G-4Y3QBW6SJD"
};

// Spotify Configuration
const spotifyConfig = {
    clientId: "7810f1b2743e4650bd0d354f6d5abcd5"
};

// Export configurations
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, spotifyConfig };
}
