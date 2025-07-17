"use client";

import { useState, useEffect } from "react";
import { FiUser, FiFolder, FiCalendar, FiX, FiMenu } from "react-icons/fi";
import { IoCloseCircleSharp } from "react-icons/io5";
import { onMessage } from "firebase/messaging";
import { messaging } from "@/db/client";
import Calendar from "@/app/dashboard/doctor/calendar";
import NotificationModal from "@/components/NotificationModal";
import ProfileModal from "@/components/ProfileModal";

const ActionButtons = ({ buttons, notificationCount, payload, compact }) => {
  const layout = compact
    ? "grid grid-cols-3 gap-6 justify-around" // 3 buttons side-by-side on mobile
    : "flex flex-col gap-5 items-center";     // stacked on desktop

  return (
    <div className={`${layout} w-full`}>
      {buttons.map(({ icon, title, onClick, hasNotification }) => {
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
            `}
            aria-label={title}
            type="button"
          >
            <span className={`flex items-center justify-center ${isDisabled ? "text-gray-600" : "text-white"}`}>
              {icon}
            </span>

            <span className="text-white text-[11px] text-center leading-tight">{title}</span>

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

const NurseSidebarMenu = ({ practiceNumber, isVerified, userDoc, compact = false }) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
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

  const handleNotification = () => {
    setShowNotificationModal(true);
    setHasNotification(false);
    setNotificationCount(0);
  };

  const handleProfileSave = async (updatedData) => {
    setProfileLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/users/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "nurse", data: updatedData }),
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
      title: "Patient Records",
      icon: <FiFolder className="h-6 w-6" />,
      onClick: () => alert("Opening patient medical records..."),
    },
    {
      title: "Schedule",
      icon: <FiCalendar className="h-6 w-6" />,
      onClick: () => setCalendarOpen(true),
    },
  ];

  return (
    <>
      {showNotificationModal && (
        <NotificationModal payload={notificationPayload} onClose={() => setShowNotificationModal(false)} />
      )}

      {profileOpen && (
        <ProfileModal userDoc={userDoc} onSave={handleProfileSave} onClose={() => setProfileOpen(false)} loading={profileLoading} />
      )}

      {/* Toggle Button */}
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

      {/* Sidebar */}
      <div
        className={`hidden lg:flex flex-col transition-transform duration-300 z-20 bg-[#123158] pt-20 px-4 w-60 h-[calc(110vh-5rem)] fixed top-18 left-0
          ${!isSidebarOpen ? "-translate-x-full" : "translate-x-0"}`}
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
          </>
        )}
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 right-0 left-0 z-40 sm:h-[35vh] h-[25vh] px-8 py-6 overflow-auto bg-gray-900/20 backdrop-blur-md">
        <ActionButtons
          buttons={actionButtons}
          notificationCount={notificationCount}
          payload={notificationPayload}
          compact={true}
        />
      </div>

      {/* Sliding Calendar Drawer */}
      <div
        className={`fixed top-24 right-0 h-[calc(100vh-6rem)] w-full max-w-md bg-white text-black z-50 shadow-lg transition-transform duration-300 ease-in-out ${calendarOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <button
          onClick={() => setCalendarOpen(false)}
          className="absolute top-2 right-2 text-red-600 text-sm hover:underline z-50"
        >
          <IoCloseCircleSharp />
        </button>
        <Calendar />
      </div>
    </>
  );
};

export default NurseSidebarMenu;
