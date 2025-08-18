"use client";

import { useState } from "react";
import { FiUser, FiCalendar, FiChevronUp, FiChevronDown, FiDollarSign } from "react-icons/fi";
import { IoCloseCircleSharp } from "react-icons/io5";
import Calendar from "@/components/calendar";
import ProfileModal from "@/components/ProfileModal";
import DriverAvailabilityButton from "@/components/ambulance/DriverAvailabilityButton";
import { useRouter } from "next/navigation";

/**
 * Action Buttons component
 */
const ActionButtons = ({ buttons, notificationCount, compact }) => {
    const layout = compact
        ? "grid grid-cols-3 gap-8 justify-around"
        : "flex flex-col gap-5 items-center";

    return (
        <div className={`${layout} w-full`}>
            {buttons.map(({ icon, title, onClick }) => (
                <button
                    key={title}
                    title={title}
                    onClick={onClick}
                    className={`relative flex flex-col items-center justify-center gap-1
            rounded-xl text-xs font-semibold shadow-[0_4px_#999]
            active:shadow-[0_2px_#666] active:translate-y-1
            transition-all duration-200 ease-in-out cursor-pointer 
            ${compact
                            ? "h-20 w-20 sm:w-24 md:w-30"
                            : "w-36 h-20"}
            bg-[#03045e]/90 hover:bg-[#023e8a] text-white`}
                >
                    <span>{icon}</span>
                    <span className="text-white text-[11px] text-center leading-tight">
                        {title}
                    </span>
                    {title === "Notifications" && notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[11px] font-bold flex items-center justify-center rounded-full border border-white">
                            {notificationCount}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};


/**
 * DriverSidebarMenu - Local state version
 */
const DriverSidebarMenu = ({ userDoc, setShowEarnings, compact = false }) => {
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [isSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Local toggle state
    const [fetching, setFetching] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);

    const router = useRouter();

    const handleToggle = () => {
        setFetching(true);
        setTimeout(() => {
            setIsAvailable((prev) => !prev);
            setFetching(false);
        }, 500); // Simulate short delay
    };

    const handleProfileSave = (updatedData) => {
        setProfileLoading(true);
        setTimeout(() => {
            console.log("Profile saved locally:", updatedData);
            setProfileLoading(false);
            setProfileOpen(false);
        }, 500);
    };

    const actionButtons = [
        {
            title: "Profile",
            icon: <FiUser className="h-6 w-6" />,
            onClick: () => setProfileOpen(true),
        },
        {
            title: "Earnings",
            icon: <FiDollarSign className="h-6 w-6" />,
            onClick: () => setShowEarnings((pre) => !pre),
        },
        {
            title: "Schedule",
            icon: <FiCalendar className="h-6 w-6" />,
            onClick: () => setCalendarOpen(true),
        },
    ];

    return (
        <>
            {/* Profile Modal */}
            {profileOpen && (
                <ProfileModal
                    userDoc={userDoc}
                    onSave={handleProfileSave}
                    onClose={() => setProfileOpen(false)}
                    loading={profileLoading}
                />
            )}

            {/* Desktop Sidebar */}
            <div
                className={`hidden lg:flex flex-col  z-20  bg-[#123158] pt-40 px-4 w-64 h-[calc(110vh-5rem)] fixed top-18 left-0 cursor-pointer ${!isSidebarOpen ? "-translate-x-full" : "translate-x-0"

                    }`}
            >
                <ActionButtons
                    buttons={actionButtons}
                    notificationCount={0}
                    compact={false}
                />

                {/* Availability Toggle */}
                <div className="flex flex-col items-center">
                    <DriverAvailabilityButton
                        isAvailable={isAvailable}
                        onChange={handleToggle}
                        fetching={fetching}
                    />
                </div>
            </div>

            {/* Mobile Toggle Button */}
            <div className="lg:hidden fixed bottom-1 -right-1 z-50 flex items-center space-x-2 text-white rounded-full px-2 py-2 backdrop-blur-sm bg-[#03045e]">
                <button
                    onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    title={mobileSidebarOpen ? "Hide menu" : "Show menu"}
                    className="flex items-center gap-1 focus:outline-none"
                >
                    {mobileSidebarOpen ? (
                        <>
                            <FiChevronDown className="h-6 w-6" />
                            <span className="text-sm font-semibold">Hide menu</span>
                        </>
                    ) : (
                        <>
                            <FiChevronUp className="h-6 w-6" />
                            <span className="text-sm font-semibold ">Show menu</span>
                        </>
                    )}
                </button>
            </div>

            {/* Mobile Sidebar */}
            <div
                className={`lg:hidden fixed bottom-0 right-0 left-0 z-40 h-[25vh] px-8 py-6 overflow-auto
          bg-gray-900/20 backdrop-blur-md flex flex-col md:pl-29 sm:pr-29 md:px-29 sm:px-29 items-center gap-5
          transition-transform duration-500 ease-in-out
          ${mobileSidebarOpen
                        ? "translate-y-0 opacity-100"
                        : "translate-y-full opacity-0 pointer-events-none"
                    }`}
            >
                <ActionButtons
                    buttons={actionButtons}
                    notificationCount={0}
                    compact={true}
                />
                <DriverAvailabilityButton
                    isAvailable={isAvailable}
                    onChange={handleToggle}
                    fetching={fetching}
                />
            </div>

            {/* Slide-in Calendar */}
            <div
                className={`fixed top-19 right-0 h-[calc(100vh-5rem)] w-full max-w-md bg-white text-black z-50 shadow-lg transition-transform duration-300 ease-in-out ${calendarOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <button
                    title="Close Calendar"
                    onClick={() => setCalendarOpen(false)}
                    className="absolute bottom-75 scale-150 right-2 text-red-600 z-50 cursor-pointer"
                >
                    <IoCloseCircleSharp />
                </button>
                <Calendar />
            </div>
        </>
    );
};

export default DriverSidebarMenu;
