"use client";

import { useState, useEffect } from "react";
import { FiUser, FiCalendar, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { IoCloseCircleSharp } from "react-icons/io5";
import { FaMoneyCheckAlt } from "react-icons/fa";
import Calendar from "@/components/calendar";
import NotificationModal from "@/components/NotificationModal";
import ProfileModal from "@/components/ProfileModal";
import DoctorToggleButton from "./doctorToggleBtn";
import { messagingPromise } from "@/db/client";
import Earnings from "../doctor/doctorEarnings";
import { onMessage } from "firebase/messaging";

const ActionButtons = ({ buttons, notificationCount, payload, compact }) => {
  const layout = compact
    ? "grid grid-cols-3 gap-x-15 w-[110vh] md:w-[110vh] md:pl-15 pr-6 gap-y-8 justify-around" // mobile/tablet
    : "flex flex-col gap-7 items-center "; // desktop matches patient sidebar

  return (
    <div className={`${layout} w-full`}>
      {buttons.map(({ icon, title, onClick, hasNotification, customClass, showTitle = true }) => {
        const isDisabled = title === "Meeting Notifications" && !payload;

        return (
          <button
            key={title}
            title={title}
            onClick={onClick}
            disabled={isDisabled}
            className={`relative flex flex-col items-center justify-center gap-1
              rounded-xl text-xs font-semibold shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1
              transition-all duration-200 ease-in-out cursor-pointer
              ${compact ? "h-20 w-20" : "w-35 h-20"}  /* Slightly narrower desktop buttons */
              bg-[#03045e]/90 hover:bg-[#023e8a] text-white
              ${isDisabled ? "!cursor-not-allowed" : ""}
              ${customClass || ""}
            `}
            aria-label={title}
            type="button"
          >
            <span className={`${isDisabled ? "text-gray-600" : "text-white"}`}>
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
      })}
    </div>
  );
};

const DoctorSidebarMenu = ({ practiceNumber, isVerified, userDoc, compact = false }) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showEarnings, setShowEarnings] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [notificationPayload, setNotificationPayload] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Firebase messaging listener
  useEffect(() => {
    let unsubscribe = () => { };

    const setupMessaging = async () => {
      const messaging = await messagingPromise;
      if (!messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        setNotificationPayload(payload);
        setNotificationCount((prev) => prev + 1);
      });
    };

    setupMessaging();

    return () => {
      if (unsubscribe) unsubscribe();
    };
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

      {/* Earnings Modal */}
      {showEarnings && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl text-black p-8 w-full max-w-4xl shadow-lg relative border-t-8 border-[#0d6efd]">
            <button
              onClick={() => setShowEarnings(false)}
              className="absolute top-3 right-4 text-gray-600 hover:text-red-600 text-xl"
              aria-label="Close Earnings Modal"
            >
              <IoCloseCircleSharp />
            </button>
            <h2 className="text-2xl font-bold mb-5 text-[#0d6efd] text-center">
              Earnings
            </h2>
            <Earnings role="doctor" data={userDoc} />
          </div>
        </div>
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
            <div className="text-center font-bold text-sm text-gray-300 mb-10">
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
              <DoctorToggleButton />
            </div>
          </>
        )}
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed bottom-1 -right-1 z-50 group cursor-pointer flex items-center space-x-2 text-white rounded-full px-2 py-2 shadow-sm select-none scale-80 backdrop-blur-sm bg-blue-800/40">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          title={mobileSidebarOpen ? "Hide menu options" : "Show menu options"}
          className="flex items-center gap-1 focus:outline-none"
          aria-expanded={mobileSidebarOpen}
          aria-controls="mobile-sidebar-actions"
          type="button"
        >
          {mobileSidebarOpen ? (
            <>
              <FiChevronDown className="h-6 w-6" />
              <span className="text-sm font-semibold">Hide menu</span>
            </>
          ) : (
            <>
              <FiChevronUp className="h-6 w-6" />
              <span className="text-sm font-semibold">Show menu</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed bottom-0 right-0 left-0 z-40 md:h-[24vh] sm:h-[38vh] h-[24vh] md:px-5 px-6 py-4 overflow-auto backdrop-blur-md flex flex-col items-center gap-5 transition-transform duration-500 ease-in-out bg-gray-900/20 ${mobileSidebarOpen
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
          }`}
      >
        <ActionButtons
          buttons={actionButtons}
          notificationCount={notificationCount}
          payload={notificationPayload}
          compact={true}
        />
        <div className="pr-8"> <DoctorToggleButton /></div>

      </div>

      {/* Calendar Drawer */}
      <div
        className={`fixed top-19 right-0 h-[calc(100vh-5rem)] w-full max-w-md bg-white text-black z-50 shadow-lg transition-transform duration-300 ease-in-out ${calendarOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <button
          title="Close Calendar"
          onClick={() => setCalendarOpen(false)}
          className="absolute pt-51.5 scale-200 right-1.5 text-red-600 text-sm hover:underline z-50"
        >
          <IoCloseCircleSharp />
        </button>
        <Calendar userDoc={userDoc} />
      </div>
    </>
  );
};

export default DoctorSidebarMenu;
