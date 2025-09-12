import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/db/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { getFCMToken } from "@/lib/getFCMToken";

/**
 * useCurrentUser hook for managing Firebase authentication and session handling.
 *
 * Provides functionality for:
 * - Monitoring authentication state
 * - Registering users with email and password
 * - Logging in users with email and password
 * - Google Sign-In authentication
 * - Password reset
 * - Signing out users and clearing sessions
 * - Creating session with token and optional FCM token
 *
 * @returns {Object} Object containing current user, loading status, and all auth handler functions:
 * @property {firebase.User|null} currentUser - The currently authenticated user
 * @property {boolean} loading - Whether authentication status is still being determined
 * @property {Function} handleRegister - Registers a user with email, password, and role
 * @property {Function} handleLogin - Logs in a user with email, password, and role
 * @property {Function} handleGoogleSignIn - Handles sign-in using Google OAuth and sets session
 * @property {Function} handlePasswordReset - Sends password reset email
 * @property {Function} handleSignOut - Signs out user and clears server session
 */
const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createSession = async (user, role) => {
    if (!user || !role) return;

    const token = await user.getIdToken();
    const fcmToken = await getFCMToken();

    // ✅ Only now, safely create the session
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, fcmToken, role }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Session creation failed:", error);
      toast.error("Could not create session. Please try again.");
      return;
    }

    const data = await res.json();

    // 🔄 Force token refresh if needed
    if (data?.roleJustSet) {
      await user.getIdToken(true);
    }
  };

  const handleRegister = async (email, password, role) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = result.user;
      await createSession(user, role);

      toast.success("Registered successfully", {
        icon: <AiOutlineCheckCircle className="text-green-600 text-xl" />,
      });
      router.push(`/onboarding/${role}`);
    } catch (error) {
      toast.error(`Registration failed; ${error?.message}`, {
        icon: <AiOutlineCloseCircle className="text-red-600 text-xl" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password, role) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      await createSession(user, role);

      toast.success("Logged in successfully", {
        icon: <AiOutlineCheckCircle className="text-green-600 text-xl" />,
      });
      router.push(`/onboarding/${role}`);
    } catch (error) {
      toast.error(`Login failed: ${error?.message}`, {
        icon: <AiOutlineCloseCircle className="text-red-600 text-xl" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (email) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent", {
        icon: <AiOutlineCheckCircle className="text-green-600 text-xl" />,
      });
    } catch (error) {
      toast.error(`Failed to send reset email: ${error?.message}`, {
        icon: <AiOutlineCloseCircle className="text-red-600 text-xl" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);

      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
        method: "DELETE",
        credentials: "include",
      });

      toast.success("Logged out successfully", {
        icon: <AiOutlineCheckCircle className="text-green-600 text-xl" />,
      });
    } catch (error) {
      console.error(`Error signing out: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    currentUser,
    loading,
    handleRegister,
    handleLogin,
    handlePasswordReset,
    handleSignOut,
  };
};

export default useCurrentUser;
