"use client";

import { useState, useEffect } from "react";
import { FiUser, FiEdit2, FiBell, FiFileText, FiClock, FiFile, FiCalendar, FiFolder } from "react-icons/fi";
import Calendar from "@/app/dashboard/doctor/calendar";
import { messaging } from "@/db/client";
import { onMessage } from "firebase/messaging";
import NotificationModal from "@/components/NotificationModal";

/**
 * Rendering a group of sidebar action buttons
 */
const ActionButtons = ({ buttons, notificationCount }) => {
  return (
    <>
      {buttons.map(({ icon, title, onClick, hasNotification }) => (
        <button
          key={title}
          title={title}
          onClick={onClick}
          className="relative bg-[#03045e] text-white w-20 h-9 flex items-center justify-center rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
          aria-label={title}
          type="button"
        >
          {/* Icon */}
          {icon}

          {/* Static notification dot & count */}
          {hasNotification && notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[11px] font-bold flex items-center justify-center rounded-full border border-white">
              {notificationCount}
            </span>
          )}
        </button>
      ))}
    </>
  );
};

/**
 * Sidebar toggle button that switches between open and collapsed states.
 */
const SidebarToggleBtn = ({ isOpen, toggle }) => (
  <button
    onClick={toggle}
    aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    className="fixed top-29 z-50 bg-[#123158] p-2 rounded text-white cursor-pointer transition-all duration-300 ease-in-out"
    style={{ left: isOpen ? "125px" : "10px", width: 40, height: 40 }}
    type="button"
  >
    {isOpen ? (
      <FiX className="w-6 h-6" />
    ) : (
      <FiMenu className="w-6 h-6" />
    )}
  </button>
);

import { FiX, FiMenu } from "react-icons/fi";

const SidebarMenu = ({ practiceNumber, isVerified, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [writeNotesOn, setWriteNotesOn] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const [notificationPayload, setNotificationPayload] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Push notification received:", payload);
      setNotificationPayload(payload);
      setHasNotification(true);
      setNotificationCount((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, []);

  const handleNotification = () => {
    setShowNotificationModal(true); // Open modal
    setHasNotification(false); // Clear red dot
    setNotificationCount(0); // Reset count
  };

  /**
   * Sidebar Action Buttons
   */
  const actionButtons = [
    {
      title: "Profile",
      icon: <FiUser className="h-5 w-5" />,
      onClick: () => alert("Create Sick Note clicked!"),
    },
    {
      title: "Patient Medical Records",
      icon: <FiFolder className="h-5 w-5" />,
      onClick: () => alert("Edit Profile clicked!"),
    },
    {
      title: "Meeting Notifications",
      hasNotification,
      icon: <FiBell className="h-5 w-5 relative" />,
      onClick: () => {
        handleNotification();
        setHasNotification(false);
      },
    },
    {
      title: "Prescription",
      icon: <FiFileText className="h-5 w-5" />,
      onClick: () => alert("Create Prescription clicked!"),
    },
    {
      title: "Sick Note",
      icon: <FiFile className="h-5 w-5" />,
      onClick: () => setWriteNotesOn(!writeNotesOn),
    },
    {
      title: "Schedule Availability",
      icon: <FiCalendar className="h-5 w-5" />,
      onClick: () => setCalendarOpen(true),
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
      <SidebarToggleBtn isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} />

      <div
        className={`fixed top-24 left-0 h-[calc(100vh-6rem)] bg-[#123158] dark:bg-[#123158] text-gray-800 dark:text-gray-100 shadow-lg z-40 transition-all duration-300 ease-in-out ${isOpen ? "w-44" : "w-0 overflow-hidden"
          }`}
        style={{ minWidth: isOpen ? 176 : 0 }}
      >
        <div className="flex flex-col items-center px-2 pb-6 pt-16 space-y-4 h-full">
          {/* Verification Alerts */}
          {isVerified !== true && isVerified === false && (
            <div className="bg-yellow-100 text-yellow-800 border border-yellow-800 text-xs p-2 rounded text-center w-full">
              Verification Pending
            </div>
          )}
          {isVerified === null && (
            <div className="bg-red-100 text-red-800 border border-red-800 text-xs p-2 rounded text-center w-full">
              Verification Declined
            </div>
          )}

          {/* Only render below if verified */}
          {isVerified === true && (
            <>
              {/* Practice Number Display */}
              <div className="w-full text-left text-sm text-white">
                <div>Practice Number:</div>
                <div className="break-words">{practiceNumber || "N/A"}</div>
              </div>

              {/* Removed Online/Offline Toggle */}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 overflow-auto items-center flex-grow">
                <ActionButtons
                  buttons={actionButtons}
                  notificationCount={notificationCount}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Calendar Drawer */}
      <div
        className={`fixed top-26 right-0 h-[calc(100vh-6rem)] w-full max-w-md bg-white text-black z-50 shadow-lg transition-transform duration-300 ease-in-out ${calendarOpen ? "translate-x-0" : "translate-x-full"
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

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? "ml-44" : "ml-0"}`}>
        {children}
      </div>
    </>
  );
};

export default SidebarMenu;