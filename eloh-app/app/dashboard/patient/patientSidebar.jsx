"use client";

import { useState, useEffect } from "react";
import {
  FiUser,
  FiFile,
  FiChevronUp,
  FiChevronDown,
  FiCalendar,
  FiBell,
} from "react-icons/fi";
import { FaFilePrescription, FaMoneyCheckAlt } from "react-icons/fa";
import { CiMedicalClipboard } from "react-icons/ci";
import { onMessage } from "firebase/messaging";
import NotificationModal from "@/components/NotificationModal";
import ProfileModal from "@/components/ProfileModal";
import { useRouter } from "next/navigation";
import { messagingPromise } from "@/db/client";
import Appointments from "@/components/Appointments";

const ActionButtons = ({ buttons, notificationCount, payload, compact }) => {
  const layout = compact
    ? "grid grid-cols-3 gap-x-5 gap-y-8 justify-around"
    : "flex flex-col gap-7 items-center";
  return (
    <div className={`${layout} w-full`}>
      {buttons.map(
        ({ icon, title, onClick, hasNotification, customClass, showTitle }) => {
          const isDisabled = title === "Appointment Alerts" && !payload;

          return (
            <button
              key={title}
              title={title}
              onClick={onClick}
              disabled={isDisabled}
              className={`relative flex flex-col items-center justify-center gap-1
                rounded-xl text-xs font-semibold shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 transition-all duration-200 ease-in-out cursor-pointer
                ${compact ? "h-15 w-24 p-5" : "w-36 h-20"}
                bg-[#03045e]/90 hover:bg-[#023e8a] text-white
                ${isDisabled ? "!cursor-not-allowed" : ""}
                ${customClass || ""}
              `}
              aria-label={title}
              type="button"
            >
              <span
                className={`${isDisabled ? "text-gray-600" : "text-white"}`}
              >
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
  const [showPayButton, setShowPayButton] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe = () => { };

    const setupMessaging = async () => {
      const messaging = await messagingPromise;
      if (!messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        setNotificationPayload(payload);
        setHasNotification(true);
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/users/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: userDoc.role, data: updatedData }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Update failed");
      router.refresh();
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
      showTitle: true,
    },
    {
      title: "Prescriptions",
      icon: <FaFilePrescription className="h-6 w-6" />,
      onClick: () => {
        if (setMode) setMode("prescriptions");
        if (setNoteOpen) setNoteOpen((prev) => !prev);
      },
      showTitle: true,
    },
    {
      title: "Patient Files",
      icon: <CiMedicalClipboard className="h-6 w-6" />,
      onClick: () => {
        if (setMode) setMode("general-notes");
        if (setNoteOpen) setNoteOpen((prev) => !prev);
      },
      showTitle: true,
    },
    {
      title: "Sick Notes",
      icon: <FiFile className="h-6 w-6" />,
      onClick: () => {
        if (setMode) setMode("sick-notes");
        if (setNoteOpen) setNoteOpen((prev) => !prev);
      },
      customClass: compact ? "ml-[50px]" : "sm:ml-[0px]",
      showTitle: true,
    },
    {
      title: "Appointments",
      icon: <FiBell className="h-6 w-6" />,
      onClick: () => {
        if (setMode) setMode("appointments");
        if (setAppointmentOpen) setAppointmentOpen((prev) => !prev);
      },
      customClass: compact ? "ml-[50px]" : "sm:ml-[0px]",
      showTitle: true,
    },
    {
      title: "Payments",
      icon: <FaMoneyCheckAlt className="h-6 w-6" />,
      onClick: () => router.push("/payment"),
      //  customClass: compact ? "ml-[50px]" : "sm:ml-[0px]",
      showTitle: true,
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

      {appointmentOpen && <Appointments onClose={setAppointmentOpen} />}

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col transition-transform duration-300 z-20 bg-[#123158] pt-25 px-4 w-64 h-[calc(110vh-5rem)] fixed top-1 left-0
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

      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden fixed bottom-1 -right-2 z-50 group cursor-pointer flex items-center space-x-2 bg-blue-300/20 text-white rounded-full px-2 py-2 shadow-sm select-none scale-80 backdrop-blur-sm">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          title={mobileSidebarOpen ? "Hide menu options" : "Show menu options"}
          className="flex items-center gap-2 focus:outline-none"
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

      {/* Slide-up Mobile Sidebar */}
      <div
        className={`lg:hidden fixed bottom-0 right-0 left-0 z-40
          sm:h-[38vh] h-[26vh] px-4 py-3 overflow-auto backdrop-blur-md flex flex-col items-center gap-7
          transition-transform duration-500 ease-in-out bg-gray-900/20
          ${mobileSidebarOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
          }
        `}
      >
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
