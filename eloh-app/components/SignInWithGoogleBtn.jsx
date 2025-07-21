"use client";

import { signInWithPopup } from "firebase/auth";
import { getMessaging, getToken } from "firebase/messaging";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, googleAuth } from "@/db/client";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import SignInOrSignUpForm from "./signInOrSignUpForm";

const GoogleSignInButton = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "doctor";
  const [isLoading, setIsLoading] = useState(false);

  const capitalizedRole =
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuth);
      const user = result.user;
      const token = await user.getIdToken();

      const messaging = getMessaging();
      let fcmToken = null;
      try {
        fcmToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
      } catch (err) {
        toast.error("Unable to get FCM token", {
          position: "top-center",
          autoClose: 5000,
          icon: <AiOutlineCloseCircle className="text-red-600 text-xl" />,
        });
      }

      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, fcmToken }),
      });

      toast.success("Logged in successfully", {
        position: "top-center",
        autoClose: 3000,
        icon: <AiOutlineCheckCircle className="text-green-600 text-xl" />,
      });
      router.push(`/onboarding/${role}`);
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("Failed to login", {
        position: "top-center",
        autoClose: 5000,
        icon: <AiOutlineCloseCircle className="text-red-600 text-xl" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-[#dbeafe] via-white to-[#caf0f8]">
      {/* Animated glowing blobs */}
      <div className="absolute w-80 h-80 bg-blue-200 rounded-full blur-[100px] top-10 left-10 opacity-30 animate-pulse" />
      <div className="absolute w-[420px] h-[420px] bg-blue-400 rounded-full blur-[140px] bottom-20 right-10 opacity-20 animate-pulse" />
      <div className="absolute w-72 h-72 bg-blue-300 rounded-full blur-[120px] top-1/2 left-[10%] opacity-20 animate-pulse" />

      {/* Frosted glass overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/20 z-0" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-30 px-4 text-center h-full">
        <h2 className="text-3xl md:text-4xl font-bold text-[#03045e] mb-6">
          {capitalizedRole} Sign-In
        </h2>

        <p className="text-gray-700 text-lg mb-8 max-w-md">
          Please sign in to your ElohDoc account to continue.
        </p>

        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="bg-[#03045e] hover:bg-[#0077b6] text-white mb-5 flex items-center gap-3 py-3 px-6 text-lg font-semibold rounded-xl shadow-[0_9px_#999] active:shadow-[0_5px_#666] active:translate-y-1 transition-all duration-200 ease-in-out cursor-pointer"
        >
          <FcGoogle size={22} />
          {isLoading ? "Signing in..." : "Sign In with Google"}
        </button>
        <div >
          < SignInOrSignUpForm />
        </div>



      </div>
    </div>
  );
};

export default GoogleSignInButton;
