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

  /**
   * Handles user sign-out and session cleanup.
   */
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
    <div className="flex justify-center">
      <div className="flex flex-col w-full max-w-lg lg:max-w-2xl lg:h-[80vh] bg-gray-900 text-white rounded-xl shadow-lg">
        {/* User Info at top */}
        <div className="flex flex-col items-center gap-4 p-8 border-b border-gray-700">
          <img
            src={user?.photoURL | "/images/deafult_avatart.jpg"}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
          <h2 className="text-xl lg:text-2xl font-bold text-center">
            {getDisplayName(user)}
          </h2>
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
          <button
            title={`Block ${getDisplayName(user) || "User"}`}
            onClick={handleBlock}
            className="bg-[#03045e] text-[#c51c0a] font-semibold py-3 px-4 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
          >
            {isCurrentUserBlocked
              ? "You are Blocked!"
              : isReceiverBlocked
                ? "User Blocked"
                : loading
                  ? "Processing..."
                  : `Block`}
          </button>
          <button
            title="Click to Logout your account"
            onClick={handleAuthAction}
            className="bg-[#03045e] text-white font-semibold py-3 px-4 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
            disabled={loading}
          >
            {loading ? "Signing out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;
