"use client";
import { COLLECTIONS } from "@/constants";
import { auth, db } from "@/db/client";
import { useChatStore } from "@/hooks/useChatStore";
import { useUserStore } from "@/hooks/useUserStore";
import { getDisplayName } from "@/lib/getDisplayName";
import { signOut } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Detail = () => {
  const {
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeBlock,
    resetChat,
  } = useChatStore();
  const { currentUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /**
   * Blocks or unblocks a user by updating the `blocked` field
   * in the current user's document across the correct collection.
   */
  const handleBlock = async () => {
    if (!user || !currentUser) return;

    setLoading(true);

    try {
      let userDocRef = null;

      // Find the correct collection for the currentUser
      for (const col of COLLECTIONS) {
        const ref = doc(db, col, currentUser?.userId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          userDocRef = ref;
          break;
        }
      }

      if (!userDocRef) {
        console.error("Current user document not found in any collection.");
        return;
      }

      // Update block status
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked
          ? arrayRemove(user?.userId) // unblock
          : arrayUnion(user?.userId), // block
      });

      changeBlock();
    } catch (err) {
      console.error("Error updating block status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthAction = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
        method: "DELETE",
      });
      resetChat();
      router.push(`/sign-in?role=${currentUser?.role}`);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* User Info at top */}
      <div className="flex flex-col items-center gap-4 p-8 border-b border-gray-700">
        <img
          src={user?.photoUrl || "/images/deafult_avatart.jpg"}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover"
        />
        <h2 className="text-xl font-bold">{getDisplayName(user)}</h2>
        <p className="text-gray-400 text-sm">
          {user?.role?.[0]?.toUpperCase() + user?.role?.slice(1)}
        </p>
      </div>

      {/* Middle scrollable content */}
      <div className="flex-1 flex items-center justify-center p-5 text-gray-400 text-center overflow-y-auto">
        <p>More content will be added here soon...</p>
      </div>

      {/* Buttons at the bottom */}
      <div className="flex flex-col gap-3 p-5 border-t border-gray-700">
        {isCurrentUserBlocked
          ? "You are Blocked!"
          : isReceiverBlocked
          ? "User Blocked"
          : loading
          ? "Processing..."
          : "Block User"}

        <button
          onClick={handleAuthAction}
          className="w-full p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:opacity-35 disabled:cursor-not-allowed rounded-md text-white font-medium transition-colors"
          disabled={loading}
        >
          {loading ? "Signing out..." : "Logout"}
        </button>
      </div>
    </div>
  );
};

export default Detail;
