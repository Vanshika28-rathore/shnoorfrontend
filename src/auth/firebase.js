import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged as fbOnAuthStateChanged,
  signOut as fbSignOut
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ ONLY what you need
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app, auth, googleProvider, db;
let onAuthStateChanged, signOut;

if (!firebaseConfig.apiKey) {
  console.error("❌ Firebase API Key is missing! Check your frontend .env file.");
  // Provide dummy objects to prevent immediate crashes in components
  auth = {
    onAuthStateChanged: () => () => { },
    signOut: () => Promise.resolve(),
    _getRecaptchaConfig: () => ({}),
  };
  db = {};
  // Guarded functions
  onAuthStateChanged = (a, callback) => {
    callback(null); // Immediately trigger "logged out" state
    return () => { }; // Return no-op unsubscribe
  };
  signOut = () => Promise.resolve();
} else {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
  // Real functions
  onAuthStateChanged = fbOnAuthStateChanged;
  signOut = fbSignOut;
}

export { auth, googleProvider, db, onAuthStateChanged, signOut };
