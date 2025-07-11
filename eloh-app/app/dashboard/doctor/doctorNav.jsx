"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth, db } from "@/db/client";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { FiLogOut } from "react-icons/fi";

/**
 * DoctorDashboardNavbar
 * 
 * This component renders the fixed top navigation bar for doctors which shows:
 * - The doctor's avatar
 * - Name on desktop
 * - A centered logo
 * - A logout button
 *
 * On mobile, it simplifies to just the avatar, logo, and a logout button.
 */
const DoctorDashboardNavbar = () => {
  const router = useRouter();
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch authenticated doctor's Firestore document.
   */
  useEffect(() => {
    const fetchUserDoc = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const docSnap = await getDoc(doc(db, "doctors", user.uid));
        if (docSnap.exists()) {
          setUserDoc(docSnap.data());
        } else {
          console.warn("Doctor document not found.");
        }
      } catch (error) {
        console.error("Error fetching doctor document:", error);
      }
      setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged(fetchUserDoc);
    return () => unsubscribe();
  }, []);

  /**
   * Handle user logout: Signs out user from Firebase, removes session on server then redirect to sign-in page
   */
  const handleAuthAction = async () => {
    try {
      await signOut(auth);
      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
        method: "DELETE",
      });
      router.push("/sign-in?role=doctor");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Extract user info for display
  const { photoUrl, fullName } = userDoc || {};

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#123158] py-6 px-6 flex justify-between items-center">

      {/* Left Section: Avatar + Name  on desktop */}
      <div className="flex items-center gap-4">
        {/* Avatar Image or Placeholder */}
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt="User Avatar"
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300" />
        )}

        {/* Name only visible on medium+ screens */}
        <div className="leading-tight text-sm text-[#E4E9EE] hidden md:block">
          <p className="font-semibold">{fullName || "Doctor"}</p>
        </div>
      </div>

      {/* Center Section: Logo */}
      <div className="absolute left-1/2 transform -translate-x-1/2 scale-250 md:scale-350">
        <Image
          src="/images/elohdoc.png"
          alt="Eloh Logo"
          width={80}
          height={80}
        />
      </div>

      {/* Right Section: Logout Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleAuthAction}
          aria-label="Sign Out"
          title="Sign Out"
          className="bg-[#03045e] text-white py-2 px-3 text-xs md:text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer"
        >
          <FiLogOut className="w-7 h-5 md:w-10 md:h-6" />
        </button>
      </div>
    </header>
  );
};

export default DoctorDashboardNavbar;
