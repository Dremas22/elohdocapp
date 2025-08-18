import { getToken } from "firebase/messaging";
import { onAuthStateChanged } from "firebase/auth";
import { auth, messaging } from "@/db/client";
import { toastError, toastInfo } from "@/helpers/toastHelper";

// Utility to wait until Firebase Auth is ready
const waitForAuth = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve(user || null);
      }
    });
  });

/**
 * Retrieves a Firebase Cloud Messaging (FCM) token for the currently authenticated user.
 *
 * This function ensures:
 *  - The browser supports Service Workers.
 *  - The user is authenticated before attempting to fetch the token.
 *  - The Firebase Messaging service worker is registered and ready.
 *  - The user has granted Notification permission.
 *
 * Flow:
 *  1. Waits for Firebase Auth state to resolve.
 *  2. Checks if a user is logged in — exits early if not.
 *  3. Registers the FCM service worker (`/firebase-messaging-sw.js`).
 *  4. Requests Notification permission if not already granted.
 *  5. Retrieves the FCM token using the configured VAPID key.
 *
 * @async
 * @function getFCMToken
 * @returns {Promise<string|null>} The FCM token if successfully retrieved, otherwise `null`.
 *
 * @example
 * const token = await getFCMToken();
 * if (token) {
 *   console.log("FCM Token:", token);
 *   // Send the token to your backend for push notifications
 * }
 *
 * @notes
 * - Requires Firebase Auth and Firebase Messaging to be configured in `@/db/client`.
 * - Uses `toastInfo` and `toastError` for user feedback.
 * - Set `NEXT_PUBLIC_FIREBASE_VAPID_KEY` in your `.env` file for web push authentication.
 */
export async function getFCMToken() {
  try {
    if (!("serviceWorker" in navigator)) {
      toastInfo("Service worker not supported in this browser.");
      return null;
    }

    // Wait for auth state to resolve (ensures user is logged in)
    const user = await waitForAuth();

    if (!user) {
      toastError(
        "No user logged in — FCM token generation skipped. Please log in first."
      );
      return null;
    }

    // Register service worker if not already registered
    await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    // Ensure service worker is fully ready
    const readyRegistration = await navigator.serviceWorker.ready;

    // Request permission if not already granted
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toastError("Notification permission denied", 5000);
        return null;
      }
    }

    // Get token
    const fcmToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: readyRegistration,
      forceRefresh: true,
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
