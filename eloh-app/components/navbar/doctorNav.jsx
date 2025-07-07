"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth, db } from "@/db/client";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

const DoctorDashboardNavbar = () => {
    const router = useRouter();
    const [userDoc, setUserDoc] = useState(null);
    const [loading, setLoading] = useState(true);

    // Calendar dropdown state
    const [calendarOpen, setCalendarOpen] = useState(false);
    const calendarRef = useRef(null);

    // Calendar state
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState(null);

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

    // Close calendar dropdown if clicked outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setCalendarOpen(false);
            }
        }
        if (calendarOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [calendarOpen]);

    // Calendar controls
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentYear(currentYear - 1);
            setCurrentMonth(11);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentYear(currentYear + 1);
            setCurrentMonth(0);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
        setSelectedDate(null);
    };

    const handleDateClick = (day) => {
        setSelectedDate(new Date(currentYear, currentMonth, day));
    };

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
        "bg-[#03045e] text-white py-3 px-5 text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center";

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

            {/* Right-side Icon Buttons */}
            <div className="flex items-center gap-3 relative">
                {/* Notes Icon */}
                <button className={buttonStyle} aria-label="Notes">
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
                            d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"
                        />
                    </svg>
                </button>

                {/* Notifications Icon */}
                <button className={buttonStyle} aria-label="Notifications">
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
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11c0-2.485-1.355-4.675-3.5-5.745V5a1.5 1.5 0 00-3 0v.255C7.355 6.325 6 8.515 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>
                </button>

                {/* Calendar dropdown button */}
                <div ref={calendarRef} className="relative">
                    <button
                        onClick={() => setCalendarOpen(!calendarOpen)}
                        aria-label="Calendar"
                        className={buttonStyle}
                    >
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </button>

                    {/* Dropdown calendar */}
                    {calendarOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded shadow-lg p-4 z-50 text-black">
                            <div className="flex justify-between items-center mb-2">
                                <button
                                    onClick={handlePrevMonth}
                                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    aria-label="Previous month"
                                >
                                    &lt;
                                </button>
                                <h3 className="text-lg font-semibold">
                                    {new Date(currentYear, currentMonth).toLocaleString(
                                        "default",
                                        { month: "long", year: "numeric" }
                                    )}
                                </h3>
                                <button
                                    onClick={handleNextMonth}
                                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    aria-label="Next month"
                                >
                                    &gt;
                                </button>
                            </div>

                            <div className="grid grid-cols-7 text-center font-semibold text-gray-600 mb-2">
                                {daysOfWeek.map((day) => (
                                    <div key={day}>{day}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center">
                                {[...Array(firstDayOfMonth)].map((_, i) => (
                                    <div key={"blank-" + i} />
                                ))}

                                {[...Array(daysInMonth)].map((_, i) => {
                                    const day = i + 1;
                                    const isSelected =
                                        selectedDate &&
                                        selectedDate.getFullYear() === currentYear &&
                                        selectedDate.getMonth() === currentMonth &&
                                        selectedDate.getDate() === day;

                                    const isToday =
                                        today.getFullYear() === currentYear &&
                                        today.getMonth() === currentMonth &&
                                        today.getDate() === day;

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => handleDateClick(day)}
                                            className={`py-2 rounded ${isSelected
                                                ? "bg-blue-600 text-white"
                                                : isToday
                                                    ? "border border-blue-600"
                                                    : "hover:bg-gray-200"
                                                }`}
                                            aria-pressed={isSelected}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedDate && (
                                <div className="mt-4 p-2 border rounded bg-gray-100">
                                    <p>
                                        Selected date:{" "}
                                        <strong>{selectedDate.toDateString()}</strong>
                                    </p>
                                    {/* Add scheduling form or actions here if needed */}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sign In/Out Icon */}
                <button
                    onClick={isLoggedIn ? handleSignOut : handleSignIn}
                    aria-label={isLoggedIn ? "Sign Out" : "Sign In"}
                    className={buttonStyle}
                >
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
        </header>
    );
};

export default DoctorDashboardNavbar;
