"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth, db } from "@/db/client";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

const DoctorDashboardNavbar = () => {
    const router = useRouter();
    const [userDoc, setUserDoc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserDoc = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const docRef = doc(db, "doctors", currentUser.uid);
                const docSnap = await getDoc(docRef);

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

        const unsubscribe = auth.onAuthStateChanged(() => {
            fetchUserDoc();
        });

        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            window.location.href = "/";
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };

    const handleSignIn = () => {
        router.push("/sign-in?role=doctor");
    };

    const { photoUrl, fullName, email } = userDoc || {};

    return (
        <header className="w-full bg-[#90e0ef] py-3 px-6 shadow-md flex justify-between items-center">
            {/* Left: User Info */}
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
                <div className="leading-tight text-sm text-[#03045e]">
                    <p className="font-semibold">
                        {fullName || email || "Doctor"}
                    </p>
                </div>
            </div>

            {/* Center: Logo */}
            <div className="transform scale-150">
                <Image
                    src="/images/elohdoc.png"
                    alt="Eloh Logo"
                    width={80}
                    height={30}
                    className="object-contain"
                />
            </div>

            {/* Right: Auth Button */}
            <div>
                {auth.currentUser ? (
                    <button
                        onClick={handleSignOut}
                        className="bg-[#03045e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition"
                    >
                        Sign Out
                    </button>
                ) : (
                    <button
                        onClick={handleSignIn}
                        className="bg-[#03045e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition"
                    >
                        Sign In
                    </button>
                )}
            </div>
        </header>
    );
};

export default DoctorDashboardNavbar;
