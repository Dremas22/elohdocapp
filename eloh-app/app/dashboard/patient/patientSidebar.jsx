"use client";

import { useState, useEffect } from "react";
import {
  FiUser,
  FiFile,
  FiChevronUp,
  FiChevronDown,
  FiCalendar,
  FiBell,
  FiX,
} from "react-icons/fi";
import { FaFilePrescription, FaMoneyCheckAlt } from "react-icons/fa";
import { CiMedicalClipboard } from "react-icons/ci";
import { onMessage } from "firebase/messaging";
import NotificationModal from "@/components/NotificationModal";
import ProfileModal from "@/components/ProfileModal";
import Calendar from "@/components/calendar";
import { useRouter } from "next/navigation";
import { messagingPromise } from "@/db/client";
import Appointments from "@/components/Appointments";

const ActionButtons = ({ buttons, notificationCount, payload, compact }) => {
  const layout = compact
    ? "grid grid-cols-3 gap-x-5 gap-y-8 justify-around"
    : "flex flex-col gap-5 items-center";

  return (
    <div className={`${layout} w-full`}>
      {buttons.map(({ icon, title, onClick, hasNotification, customClass, showTitle }) => {
        const isDisabled = title === "Appointment Alerts" && !payload;

        return (
          <button
            key={title}
            title={title}
            onClick={onClick}
            disabled={isDisabled}
            className={`relative flex flex-col items-center justify-center gap-1
              rounded-xl text-xs font-semibold shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1
              transition-all duration-200 ease-in-out cursor-pointer
              ${compact ? "h-15 w-24 p-5" : "w-36 h-20"}
              bg-[#03045e]/90 hover:bg-[#023e8a] text-white
              ${isDisabled ? "!cursor-not-allowed" : ""} ${customClass || ""}`}
            type="button"
          >
            <span className={`${isDisabled ? "text-gray-600" : "text-white"}`}>{icon}</span>
            {showTitle && <span className="text-white text-[11px] text-center">{title}</span>}
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
  const [notificationPayload, setNotificationPayload] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false); // ✅ NEW
  const router = useRouter();

  useEffect(() => {
    let unsubscribe = () => { };
    const setupMessaging = async () => {
      const messaging = await messagingPromise;
      if (!messaging) return;
      unsubscribe = onMessage(messaging, (payload) => {
        setNotificationPayload(payload);
        setNotificationCount((p) => p + 1);
      });
    };
    setupMessaging();
    return () => unsubscribe();
  }, []);

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
      onClick: () => { setMode?.("prescriptions"); setNoteOpen?.((p) => !p); },
      showTitle: true,
    },
    {
      title: "Patient Files",
      icon: <CiMedicalClipboard className="h-6 w-6" />,
      onClick: () => { setMode?.("general-notes"); setNoteOpen?.((p) => !p); },
      showTitle: true,
    },
    {
      title: "Sick Notes",
      icon: <FiFile className="h-6 w-6" />,
      onClick: () => { setMode?.("sick-notes"); setNoteOpen?.((p) => !p); },
      showTitle: true,
    },
    {
      title: "Payments",
      icon: <FaMoneyCheckAlt className="h-6 w-6" />,
      onClick: () => router.push("/payment"),
      showTitle: true,
    },
    {
      title: "Appointments",
      icon: <FiBell className="h-6 w-6" />,
      onClick: () => setAppointmentOpen((p) => !p),
      showTitle: true,
    },
    {
      title: "Schedule",
      icon: <FiCalendar className="h-6 w-6" />,
      onClick: () => setCalendarOpen(true),
      showTitle: true,
    },
  ];

  return (
    <>
      {showNotificationModal && <NotificationModal payload={notificationPayload} onClose={() => setShowNotificationModal(false)} />}
      {profileOpen && <ProfileModal userDoc={userDoc} onClose={() => setProfileOpen(false)} loading={profileLoading} />}
      {appointmentOpen && <Appointments onClose={setAppointmentOpen} />}

      {/* DESKTOP SIDEBAR */}
      <div className={`hidden mb-5 lg:flex flex-col h-[150vh] bg-[#123158] pt-20 px-4 w-64 h-[calc(110vh-5rem)] fixed top-0.5 left-0 overflow-y-auto ${!isSidebarOpen ? "-translate-x-full" : "translate-x-0"} transition-transform`}>
        <ActionButtons buttons={actionButtons} notificationCount={notificationCount} payload={notificationPayload} compact={false} />
      </div>

      {/* CALENDAR MODAL */}
      <div className={`fixed top-19 right-0 h-[calc(100vh-5rem)] w-full max-w-md bg-white text-black z-50 shadow-lg transition-transform duration-300 flex flex-col ${calendarOpen ? "translate-x-0" : "translate-x-full"}`}>
        {/* Calendar fills available space */}
        <div className="flex-1 overflow-auto">
          <Calendar userDoc={userDoc} />
        </div>

        {/* Close button at top-right */}
        <div className="absolute top-75 right-0.5">
          <button
            onClick={() => setCalendarOpen(false)}
            className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
            aria-label="Close Calendar"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default PatientSidebarMenu;
