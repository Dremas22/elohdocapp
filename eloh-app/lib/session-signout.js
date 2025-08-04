import { auth } from "@/db/client";
import { signOut } from "firebase/auth";

/**
 * Signs the user out of Firebase authentication and removes the active session on the server.
 *
 * This function performs two main actions:
 * 1. Calls Firebase's `signOut` to log the user out on the client side.
 * 2. Sends a DELETE request to the `/api/session` endpoint to remove the session on the backend.
 *
 * It also manages a loading state before and after the sign-out process, and logs any errors to the console.
 *
 * @async
 * @function handleAuthAction
 * @returns {Promise<void>} A promise that resolves when the sign-out and session cleanup are complete.
 */
export const handleAuthAction = async (setLoading) => {
  setLoading(true);
  try {
    await signOut(auth);
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error signing out:", error);
  } finally {
    setLoading(false);
  }
};
