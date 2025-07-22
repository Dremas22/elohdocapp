"use client";

import { useState, useEffect } from "react";
import { FiUser, FiCalendar, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { IoCloseCircleSharp } from "react-icons/io5";
import { FaMoneyCheckAlt } from "react-icons/fa";
import Calendar from "@/app/dashboard/doctor/calendar";
import { messaging } from "@/db/client";
import { onMessage } from "firebase/messaging";
import NotificationModal from "@/components/NotificationModal";
import ProfileModal from "@/components/ProfileModal";
import ToggleButton from "./availabilityBtn"; // ✅ Check this path

const ActionButtons = ({ buttons, notificationCount, payload, compact }) => {
  const layout = compact
    ? "grid grid-cols-3 gap-6 justify-around"
    : "flex flex-col gap-5 items-center";

  return (
    <div className={`${layout} w-full`}>
      {buttons.map(
        ({
          icon,
          title,
          onClick,
          hasNotification,
          customClass,
          showTitle = true,
        }) => {
          const isMeetingNotifications = title === "Meeting Notifications";
          const isDisabled = isMeetingNotifications && !payload;

          return (
            <button
              key={title}
              title={title}
              onClick={onClick}
              disabled={isDisabled}
              className={`relative flex flex-col items-center justify-center gap-1
                rounded-xl text-xs font-semibold shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1
                transition-all duration-200 ease-in-out cursor-pointer
                ${compact ? "h-20 w-20" : "w-36 h-20"}
                bg-[#03045e]/90 hover:bg-[#023e8a] text-white
                ${isDisabled ? "!cursor-not-allowed" : ""}
                ${customClass || ""}
              `}
              aria-label={title}
              type="button"
            >
              <span className={`flex items-center justify-center ${isDisabled ? "text-gray-600" : "text-white"}`}>
                {icon}
              </span>
              {showTitle && (
                <span className="text-white text-[11px] text-center leading-tight">
                  {title}
                </span>
              )}
              {hasNotification && notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[11px] font-bold flex items-center justify-center rounded-full border border-white">
                  {notificationCount}
                </span>
              )}
            </button>
          );
        }
      )}
    </div>
  );
};

const DoctorSidebarMenu = ({
  practiceNumber,
  isVerified,
  userDoc,
  compact = false,
  showEarnings,
  setShowEarnings,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const [notificationPayload, setNotificationPayload] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop sidebar
  const [isAvailable, setIsAvailable] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Mobile toggle

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
      title: "Earnings",
      icon: <FaMoneyCheckAlt className="h-6 w-6" />,
      onClick: () => setShowEarnings(true),
    },
    {
      title: "Schedule",
      icon: <FiCalendar className="h-6 w-6" />,
      onClick: () => setCalendarOpen(true),
    },
  ];

  return (
    <>
      {/* Notification Modal */}
      {showNotificationModal && (
        <NotificationModal
          payload={notificationPayload}
          onClose={() => setShowNotificationModal(false)}
        />
      )}

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
        className={`hidden lg:flex flex-col transition-transform duration-300 z-20 bg-[#123158] pt-20 px-4 w-64 h-[calc(110vh-5rem)] fixed top-18 left-0 ${!isSidebarOpen ? "-translate-x-full" : "translate-x-0"
          }`}
      >
        {isVerified === false && (
          <div className="bg-yellow-100 text-yellow-800 border border-yellow-800 text-xs p-2 rounded text-center mb-3">
            Verification Pending
          </div>
        )}
        {isVerified === null && (
          <div className="bg-red-100 text-red-800 border border-red-800 text-xs p-2 rounded text-center mb-3">
            Verification Declined
          </div>
        )}

        {isVerified === true && (
          <>
            <div className="text-center font-bold text-sm text-[#66e4ff] mb-10">
              <div>Practice Number</div>
              <div>{practiceNumber || "N/A"}</div>
            </div>

            <ActionButtons
              buttons={actionButtons}
              notificationCount={notificationCount}
              payload={notificationPayload}
              compact={false}
            />

            <div className="mt-6 flex flex-col items-center">
              <label className="mb-2 text-sm text-[#a0cfff] select-none">
                {isAvailable ? "Available" : "Unavailable"}
              </label>
              <ToggleButton
                checked={isAvailable}
                onChange={() => setIsAvailable(!isAvailable)}
              />
            </div>
          </>
        )}
      </div>

      {/* ✅ Floating Mobile Toggle Button with Arrow */}
      <button
        className="lg:hidden fixed bottom-3 right-4 z-50 bg-[#03045e] text-white rounded-full p-1 shadow-lg"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      >
        {mobileSidebarOpen ? (
          <FiChevronDown className="h-6 w-6" />
        ) : (
          <FiChevronUp className="h-6 w-6" />
        )}
      </button>

      {/* ✅ Mobile Sidebar with Slide Animation */}
      <div
        className={`
          lg:hidden fixed bottom-0 right-0 left-0 z-40 sm:h-[38vh] h-[24vh]
          px-6 py-4 overflow-auto backdrop-blur-md flex flex-col items-center gap-5
          transition-transform duration-500 ease-in-out bg-gray-900/20
          ${mobileSidebarOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}
        `}
      >
        <ActionButtons
          buttons={actionButtons}
          notificationCount={notificationCount}
          payload={notificationPayload}
          compact={true}
        />

        <div className="flex items-center gap-3">
          <label className="text-sm text-[#a0cfff] select-none">
            {isAvailable ? "Available" : "Unavailable"}
          </label>
          <ToggleButton
            checked={isAvailable}
            onChange={() => setIsAvailable(!isAvailable)}
          />
        </div>
      </div>

      {/* Calendar Drawer */}
      <div
        className={`fixed top-24 right-0 h-[calc(100vh-6rem)] w-full max-w-md bg-white text-black z-50 shadow-lg transition-transform duration-300 ease-in-out ${calendarOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <button
          onClick={() => setCalendarOpen(false)}
          className="absolute pt-51.5 scale-200 right-1.5 text-red-600 text-sm hover:underline z-50"
        >
          <IoCloseCircleSharp />
        </button>
        <Calendar />
      </div>
    </>
  );
};

export default DoctorSidebarMenu;
