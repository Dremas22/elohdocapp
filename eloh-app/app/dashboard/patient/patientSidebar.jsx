"use client";

import { useState, useEffect } from "react";
import {
    FiUser,
    FiFileText,
    FiFile,
    FiFolder,
    FiX,
    FiMenu,
} from "react-icons/fi";
import { messaging } from "@/db/client";
import { onMessage } from "firebase/messaging";
import NotificationModal from "@/components/NotificationModal";
import ProfileModal from "@/components/ProfileModal";

const ActionButtons = ({ buttons, notificationCount, payload, compact }) => {
    const layout = compact
        ? "grid grid-cols-3 gap-6 justify-around"
        : "flex flex-col gap-6 items-center";

    return (
        <div className={`${layout} w-full`}>
            {buttons.map(({ icon, title, onClick, hasNotification, customClass }) => {
                const isDisabled = title === "Appointment Alerts" && !payload;

                return (
                    <button
                        key={title}
                        title={title}
                        onClick={onClick}
                        disabled={isDisabled}
                        className={`relative flex items-center justify-center rounded-xl text-sm font-semibold shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 transition-all duration-200 ease-in-out cursor-pointer
              ${compact ? "h-14 w-14" : "w-24 h-12"}
              bg-[#03045e] hover:bg-[#023e8a] text-white
              ${isDisabled ? "!cursor-not-allowed" : ""}
              ${customClass || ""}
            `}
                        aria-label={title}
                        type="button"
                    >
                        <span className={`${isDisabled ? "text-gray-600" : "text-white"}`}>
                            {icon}
                        </span>

                        {hasNotification && notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[11px] font-bold flex items-center justify-center rounded-full border border-white">
                                {notificationCount}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

const PatientSidebarMenu = ({
    userDoc,
    mode,
    setMode,
    noteOpen,
    setNoteOpen,
    compact = false,
}) => {
    const [hasNotification, setHasNotification] = useState(false);
    const [notificationPayload, setNotificationPayload] = useState(null);
    const [notificationCount, setNotificationCount] = useState(0);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const unsubscribe = onMessage(messaging, (payload) => {
            setNotificationPayload(payload);
            setHasNotification(true);
            setNotificationCount((prev) => prev + 1);
        });

        return () => unsubscribe();
    }, []);

    const handleProfileSave = async (updatedData) => {
        setProfileLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/users/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: userDoc.role, data: updatedData }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Update failed");

            console.log("✅ User updated:", result);
        } catch (err) {
            console.error("❌ Update error:", err.message);
        } finally {
            setProfileLoading(false);
            setProfileOpen(false);
        }
    };

    const actionButtons = [
        {
            title: "Profile",
            icon: <FiUser className="h-6 w-6" />,
            onClick: () => setProfileOpen(true),
        },
        {
            title: "View Prescriptions",
            icon: <FiFileText className="h-6 w-6" />,
            onClick: () => {
                if (setMode) setMode("prescriptions");
                if (setNoteOpen) setNoteOpen((prev) => !prev);
            },
        },
        {
            title: "View Medical Records",
            icon: <FiFolder className="h-6 w-6" />,
            onClick: () => {
                if (setMode) setMode("general-notes");
                if (setNoteOpen) setNoteOpen((prev) => !prev);
            },
        },
        {
            title: "View Sick Notes",
            icon: <FiFile className="h-6 w-6" />,
            onClick: () => {
                if (setMode) setMode("sick-notes");
                if (setNoteOpen) setNoteOpen((prev) => !prev);
            },
            customClass: compact ? "ml-[50px]" : "sm:ml-[0px]",
        },
        {
            title: "Request Ambulance",
            icon: <span className={`${compact ? "text-3xl" : "text-2xl"}`}>🚑</span>,
            onClick: () => alert("Ambulance request initiated..."),
            customClass: compact ? "ml-[50px]" : "sm:ml-[0px]",
        },
    ];

    return (
        <>
            {showNotificationModal && (
                <NotificationModal
                    payload={notificationPayload}
                    onClose={() => setShowNotificationModal(false)}
                />
            )}

            {profileOpen && (
                <ProfileModal
                    userDoc={userDoc}
                    onSave={handleProfileSave}
                    onClose={() => setProfileOpen(false)}
                    loading={profileLoading}
                />
            )}

            {/* Desktop Toggle Button */}
            {!compact && (
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute top-6 right-[-2.2rem] bg-[#123158] hover:bg-[#0e2a4b] text-white p-2 rounded-l z-30 hidden lg:block"
                    aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                    type="button"
                >
                    {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                </button>
            )}

            {/* Sidebar for Desktop */}
            <div
                className={`hidden lg:flex flex-col transition-transform duration-300 z-20 bg-[#123158] pt-20 px-4 w-64 h-[calc(100vh-5rem)] fixed top-20 left-0
          ${!isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
        `}
            >

                <ActionButtons
                    buttons={actionButtons}
                    notificationCount={notificationCount}
                    payload={notificationPayload}
                    compact={false}
                />
            </div>

            {/* Floating Bar for Mobile */}
            <div className="lg:hidden fixed bottom-0 left-3.5 right-0 z-40 h-[30vh] bg-gray-950 px-6 py-6 overflow-auto">
                <ActionButtons
                    buttons={actionButtons}
                    notificationCount={notificationCount}
                    payload={notificationPayload}
                    compact={true}
                />
            </div>
        </>
    );
};

export default PatientSidebarMenu;
