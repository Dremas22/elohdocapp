"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth, db } from "@/db/client";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { FiLogOut } from "react-icons/fi";

const DoctorDashboardNavbar = () => {
  const router = useRouter();
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDoc = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const docSnap = await getDoc(doc(db, "doctors", user.uid));
        if (docSnap.exists()) setUserDoc(docSnap.data());
        else console.warn("Doctor document not found.");
      } catch (error) {
        console.error("Error fetching doctor document:", error);
      }
      setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged(fetchUserDoc);
    return () => unsubscribe();
  }, []);

  const handleAuthAction = async () => {
    try {
      await signOut(auth);
      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
        method: "DELETE",
      });
      router.push("/sign-in?role=doctor"); // Redirect after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const { photoUrl, fullName, email } = userDoc || {};

  const buttonStyle =
    "bg-[#03045e] text-white py-3 px-5 text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center gap-2";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#123158] py-3 px-6 flex justify-between items-center">
      {/* User Info */}
      <div className="flex items-center gap-4">
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
        <div className="leading-tight text-sm text-[#E4E9EE]">
          <p className="font-semibold">{fullName || email || "Doctor"}</p>
        </div>
      </div>

      {/* Centered Logo */}
      <div className="transform scale-300">
        <Image
          src="/images/elohdoc.png"
          alt="Eloh Logo"
          width={80}
          height={30}
          className="object-contain"
        />
      </div>

      {/* Right-side Button */}
      <div className="flex items-center gap-3 relative">
        <button
          onClick={handleAuthAction}
          aria-label="Sign Out"
          title="Sign Out"
          className={buttonStyle}
        >
          <FiLogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default DoctorDashboardNavbar;
