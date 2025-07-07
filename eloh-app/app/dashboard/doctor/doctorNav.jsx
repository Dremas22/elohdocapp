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

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            window.location.href = "/";
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };

    const handleSignIn = () => router.push("/sign-in?role=doctor");

    const { photoUrl, fullName, email } = userDoc || {};
    const isLoggedIn = !!auth.currentUser;

    const buttonStyle =
        "relative bg-[#03045e] text-white py-3 px-5 text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center";

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
            <div className="transform scale-150">
                <Image
                    src="/images/elohdoc.png"
                    alt="Eloh Logo"
                    width={80}
                    height={30}
                    className="object-contain"
                />
            </div>

            {/* Right-side Sign In/Out Button with Tooltip */}
            <div className="flex items-center gap-3">
                <button
                    onClick={isLoggedIn ? handleSignOut : handleSignIn}
                    aria-label={isLoggedIn ? "Sign Out" : "Sign In"}
                    className={buttonStyle}
                >
                    {/* Tooltip */}
                    <span className="absolute bottom-full mb-2 hidden whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white group-hover:block pointer-events-none z-50" id="tooltip">
                        {isLoggedIn ? "Sign Out" : "Sign In"}
                    </span>

                    {/* Icon */}
                    {isLoggedIn ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16l-4-4m0 0l4-4m-4 4h14m-6 4v1a2 2 0 002 2h4a2 2 0 002-2V7a2 2 0 00-2-2h-4a2 2 0 00-2 2v1"
                            />
                        </svg>
                    )}
                </button>
            </div>

            {/* CSS for tooltip */}
            <style jsx>{`
                button:hover span#tooltip {
                    display: block;
                }
            `}</style>
        </header>
    );
};

export default DoctorDashboardNavbar;
