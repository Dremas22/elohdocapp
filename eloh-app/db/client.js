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

// Optional: Analytics
let analytics;
if (typeof window !== "undefined") {
  analyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Optional: Messaging
let messaging;
if (typeof window !== "undefined") {
  messagingSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { app, db, auth, storage, googleAuth, analytics, messaging };

/**
 * import { initializeApp } from "firebase/app";
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


// Analytics + Messaging loaders (safe, awaited)
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

 */
