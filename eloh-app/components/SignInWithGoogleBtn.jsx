"use client";

import { signInWithPopup } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { useRouter } from "next/navigation";
import { auth, googleAuth } from "@/db/client";
import { useState } from "react";

const GoogleSignInButton = ({ role }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the Google sign-in process using Firebase authentication.
   *
   * 1. Initiates sign-in with a popup using the configured Google provider.
   * 2. Retrieves the user's ID token upon successful authentication.
   * 3. Sends the ID token to the backend to create a secure session cookie.
   * 4. Redirects the user to the onboarding page based on their selected role.
   *
   * If any step fails, handles specific Firebase errors and shows appropriate feedback.
   *
   * @returns {Promise<void>}
   */
  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuth);
      const user = result.user;

      const token = await user.getIdToken();

      // Get FCM token for this user/device
      const messaging = getMessaging();
      let fcmToken = null;
      try {
        fcmToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
      } catch (err) {
        console.warn("Unable to get FCM token:", err);
      }

      // Send ID token and FCM token to your backend
      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, fcmToken }),
      });
      alert("LoggedIn successfully");

      router.push(`/onboarding/${role}`); // for doctors and nurses

      // TODO: Make sure users are redirected to payment
    } catch (error) {
      let message = "Login failed. Please try again.";
      let description = "An unknown error occurred during sign-in.";

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/popup-closed-by-user":
            message = "Sign-In Cancelled";
            description =
              "The sign-in popup was closed before completing the login.";
            break;
          case "auth/network-request-failed":
            message = "Network Error";
            description =
              "Please check your internet connection and try again.";
            break;
          case "auth/user-disabled":
            message = "Account Disabled";
            description = "This account has been disabled. Contact support.";
            break;
          default:
            description = error.message;
            break;
        }
      } else if (error instanceof Error) {
        description = error.message;
      }

      console.error("Sign-in error:", error);
      alert("Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const capitalizedRole =
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  return (
    <div className="flex items-center justify-center mt-10">
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="bg-[#03045e] text-white py-3 px-5 text-lg font-semibold rounded-xl shadow-[0_9px_#999] active:shadow-[0_5px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out"
      >
        {isLoading
          ? `${capitalizedRole} signing in...`
          : `${capitalizedRole} Sign In`}
      </button>
    </div>
  );
};

export default GoogleSignInButton;
