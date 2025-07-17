"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth, db } from "@/db/client";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { FiLogOut } from "react-icons/fi";

const NurseDashboardNavbar = () => {
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
                const docSnap = await getDoc(doc(db, "nurses", user.uid)); // For nurses
                if (docSnap.exists()) {
                    setUserDoc(docSnap.data());
                } else {
                    console.warn("Nurse document not found.");
                }
            } catch (error) {
                console.error("Error fetching nurse document:", error);
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
            router.push("/sign-in?role=nurse");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const { photoUrl, fullName, email } = userDoc || {};

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-19 bg-gray-300 py-6 px-6 flex justify-between items-center">

            {/* Left Section: Avatar + Name */}
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

                <div className="leading-tight text-sm text-[#123158] hidden md:block">
                    <p className="font-semibold">{fullName || email || "Nurse"}</p>
                </div>
            </div>

            {/* Center Logo (absolute center) */}
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
                    className="bg-[#03045e] text-white py-3 px-3 text-xs md:text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer"
                >
                    <p>Sign Out</p>
                </button>
            </div>
        </header>
    );
};

export default NurseDashboardNavbar;
