import { initializeApp } from "firebase/app";
import {
  getAnalytics,
  isSupported as analyticsSupported,
} from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getMessaging,
  isSupported as messagingSupported,
} from "firebase/messaging";

// Firebase Config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASURE_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);
const googleAuth = new GoogleAuthProvider();
const storage = getStorage(app);

/**
 * Initializes Firebase Analytics safely and asynchronously.
 *
 * @description
 * This promise-based IIFE ensures that Firebase Analytics is only initialized
 * in supported environments (i.e., in the browser). It prevents runtime errors
 * during server-side rendering or in browsers that do not support Analytics.
 * By returning a promise that resolves to either an Analytics instance or `null`,
 * it allows the app to safely await this value without crashing.
 *
 * @returns {Promise<Analytics|null>} A promise that resolves to the Analytics
 * instance if supported, otherwise null.
 */
const analyticsPromise = (async () => {
  if (typeof window === "undefined") return null;
  try {
    const supported = await analyticsSupported();
    return supported ? getAnalytics(app) : null;
  } catch (err) {
    console.warn("Analytics not supported:", err.message);
    return null;
  }
})();

/**
 * Initializes Firebase Cloud Messaging safely and asynchronously.
 *
 * @description
 * This promise-based IIFE ensures that Firebase Messaging is only initialized
 * in environments that support it (i.e., browsers with service worker support).
 * It prevents errors in server-side contexts or unsupported browsers.
 * By returning a promise that resolves to either a Messaging instance or `null`,
 * it allows the rest of the app to safely integrate messaging features
 * like push notifications without risking crashes.
 *
 * @returns {Promise<Messaging|null>} A promise that resolves to the Messaging
 * instance if supported, otherwise null.
 */
const messagingPromise = (async () => {
  if (typeof window === "undefined") return null;
  try {
    const supported = await messagingSupported();
    return supported ? getMessaging(app) : null;
  } catch (err) {
    console.warn("Messaging not supported:", err.message);
    return null;
  }
})();

export {
  app,
  db,
  auth,
  storage,
  googleAuth,
  messagingPromise,
  analyticsPromise,
};
