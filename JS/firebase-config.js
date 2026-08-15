/**
 * Firebase Configuration & Initialization Module
 * Supports Firebase v10 SDK compat script tags with graceful offline fallback.
 */

// Place your Firebase Web App configuration credentials below.
// If left as default demo values, LEDGER operates seamlessly in LocalStorage Demo Mode.
const firebaseConfig = {
  apiKey: "AIzaSyBB3rgqcodnRl4uwAnpv5Jm0FjwTV7Y2Kw",
  authDomain: "ledger-a459c.firebaseapp.com",
  projectId: "ledger-a459c",
  storageBucket: "ledger-a459c.firebasestorage.app",
  messagingSenderId: "652409451480",
  appId: "1:652409451480:web:e8f54a2c2c7cf2e0b0b8ad",
  measurementId: "G-0J4WTYLTSL"
};

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let isFirebaseActive = false;

try {
  // Check if Firebase SDK scripts are loaded and config is valid (not default placeholder)
  if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseAuth = firebase.auth();
    firebaseDb = firebase.firestore();
    
    // Enable offline persistence for Firestore if available
    firebaseDb.enablePersistence().catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence not supported by browser');
      }
    });

    isFirebaseActive = true;
    console.log("Firebase initialized successfully. Cloud Sync active.");
  } else {
    console.log("Firebase not configured. Running in Local-Only / Demo Mode.");
  }
} catch (e) {
  console.warn("Firebase initialization skipped:", e.message);
  isFirebaseActive = false;
}

window.isFirebaseActive = isFirebaseActive;
window.firebaseAuth = firebaseAuth;
window.firebaseDb = firebaseDb;
