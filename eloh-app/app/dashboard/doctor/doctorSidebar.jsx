"use client";

import { useState, useEffect } from "react";
import { FiUser, FiBell, FiFileText, FiFile, FiCalendar, FiFolder, } from "react-icons/fi";
import Calendar from "@/app/dashboard/doctor/calendar";
import { messaging } from "@/db/client";
import { onMessage } from "firebase/messaging";
import NotificationModal from "@/components/NotificationModal";
import ProfileModal from "@/components/ProfileModal";

/**
 * Renders a grid or column of action buttons with optional notification indicators.
 * @param {Array} buttons - The list of button config objects.
 * @param {number} notificationCount - The number of unread notifications.
 * @param {Object|null} payload - The current notification payload.
 * @param {boolean} compact - Whether the layout is in compact/mobile mode.
 */
const ActionButtons = ({ buttons, notificationCount, payload, compact }) => {
  // Determining layout based on compact mode
  const layout = compact
    ? "grid grid-cols-2 gap-9" // increased spacing on mobile
    : "flex flex-col gap-6 items-center"; // vertical on desktop

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
            className={`relative flex items-center justify-center rounded-xl text-sm font-semibold shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 transition-all duration-200 ease-in-out cursor-pointer
              ${compact ? "h-15 w-18" : "w-24 h-12"}
              bg-[#03045e] hover:bg-[#023e8a] text-white
              ${isDisabled ? "!cursor-not-allowed" : ""}
            `}
            aria-label={title}
            type="button"
          >
            <span className={`${isDisabled ? "text-gray-600" : "text-white"}`}>
              {icon}
            </span>
            {/* Notification badge */}
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

/**
 * SidebarMenu component for doctor's dashboard.
 * Displays verification status, doctor's practice number, action buttons, and a sliding calendar.
 * @param {string} practiceNumber - Doctor's practice number.
 * @param {boolean|null} isVerified - Verification status (true, false, null).
 * @param {Object} userDoc - Firebase user document data.
 * @param {boolean} [compact=false] - Whether the layout is compact (mobile view).
 */
const SidebarMenu = ({ practiceNumber, isVerified, userDoc, compact = false }) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const [notificationPayload, setNotificationPayload] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Listen for real-time notifications
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      setNotificationPayload(payload);
      setHasNotification(true);
      setNotificationCount((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, []);

  // Open notification modal and clear count
  const handleNotification = () => {
    setShowNotificationModal(true);
    setHasNotification(false);
    setNotificationCount(0);
  };

  // Define the list of action buttons to render
  const actionButtons = [
    {
      title: "Profile",
      icon: <FiUser className="h-6 w-6" />,
      onClick: () => setProfileOpen(true),
    },
    {
      title: "Patient Medical Records",
      icon: <FiFolder className="h-6 w-6" />,
      onClick: () => alert("Accessing patient medical records..."),
    },
    {
      title: "Meeting Notifications",
      hasNotification,
      icon: <FiBell className="h-6 w-6" />,
      onClick: () => handleNotification(),
    },
    {
      title: "Prescription",
      icon: <FiFileText className="h-6 w-6" />,
      onClick: () => alert("Opening prescription module..."),
    },
    {
      title: "Sick Note",
      icon: <FiFile className="h-6 w-6" />,
      onClick: () => alert("Opening sick note editor..."),
    },
    {
      title: "Schedule Availability",
      icon: <FiCalendar className="h-6 w-6" />,
      onClick: () => setCalendarOpen(true),
    },
  ];

  // Save updated profile info to the database
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
      setProfileOpen(false);
    }
  };

  return (
    <>
      {/* Notification Modal */}
      {showNotificationModal && (
        <NotificationModal
          payload={notificationPayload}
          onClose={() => setShowNotificationModal(false)}
        />
      )}

      {/* Profile Editing Modal */}
      {profileOpen && (
        <ProfileModal
          userDoc={userDoc}
          onSave={handleProfileSave}
          onClose={() => setProfileOpen(false)}
          loading={profileLoading}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`p-6 text-white z-10 ${compact
          ? "bg-gray-950 pt-11 pr-19 pl-18 w-[full] h-[65vh]"
          : "bg-[#123158] pt-30 w-64 h-full shadow-lg"
          }`}
      >
        {/* Verification Status Message */}
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

        {/* If verified, content will be displayed */}
        {isVerified === true && (
          <>
            {/* Doctor's Practice Number */}
            <div className={`text-center font-bold ${compact ? "text-lg" : "text-sm"} text-[#66e4ff] mb-15`}>
              <div>Practice Number</div>
              <div>{practiceNumber || "N/A"}</div>
            </div>

            {/* Action Buttons */}
            <ActionButtons
              buttons={actionButtons}
              notificationCount={notificationCount}
              payload={notificationPayload}
              compact={compact}
            />
          </>
        )}
      </div>

      {/* Sliding Calendar Drawer */}
      <div
        className={`fixed top-24 right-0 h-[calc(100vh-6rem)] w-full max-w-md bg-white text-black z-50 shadow-lg transition-transform duration-300 ease-in-out ${calendarOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <button
          onClick={() => setCalendarOpen(false)}
          className="absolute right-2 text-red-600 text-sm hover:underline z-50"
        >
          Close
        </button>
        <Calendar />
      </div>
    </>
  );
};

export default SidebarMenu;
