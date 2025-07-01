"use client";

import { signInWithPopup } from "firebase/auth";
import { FirebaseError } from "firebase/app";
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

      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      // Optionally you can add a toast
      alert("LoggedIn successfully");

      router.push(`/onboarding/${role}`);
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

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full max-w-xl p-1 cursor-pointer"
      >
        <span> Sign in with Google</span>
      </button>
    </div>
  );
};

export default GoogleSignInButton;
