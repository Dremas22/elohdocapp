import { getMessaging, getToken } from "firebase/messaging";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/db/client";

// Utility to wait until Firebase Auth is ready
const waitForAuth = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      }
    });
  });

export async function getFCMToken() {
  try {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service worker not supported in this browser.");
      return null;
    }

    // Wait for auth state to resolve (ensures user is logged in)
    await waitForAuth();

    // Register service worker if not already registered
    await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    // Ensure service worker is fully ready
    const readyRegistration = await navigator.serviceWorker.ready;

    // Request permission if not already granted
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission denied");
        return null;
      }
    }

    const messaging = getMessaging();

    // Get token
    const fcmToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: readyRegistration,
    });

    if (!fcmToken) {
      console.warn("FCM token is null");
      return null;
    }

    return fcmToken;
  } catch (error) {
    console.error("FCM Token Error:", error);
    return null;
  }
}
