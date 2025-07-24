"use client";

import { useState, useEffect } from "react";
import { FiUser, FiFile, FiX, FiMenu } from "react-icons/fi";
import { FaFilePrescription } from "react-icons/fa";
import { CiMedicalClipboard } from "react-icons/ci";
import { messaging } from "@/db/client";
import { onMessage } from "firebase/messaging";
import NotificationModal from "@/components/NotificationModal";
import ProfileModal from "@/components/ProfileModal";
import { useRouter } from "next/navigation";

const ActionButtons = ({ buttons, notificationCount, payload, compact }) => {
  const layout = compact
    ? "grid grid-cols-3 gap-6 justify-around"
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
                ${compact ? "h-15 w-24" : "w-36 h-20"}
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

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
      customClass: compact ? "ml-[110px]" : "sm:ml-[0px]",
      showTitle: true,
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

      {/* Toggle Button
      {!compact && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-6 right-[-2.2rem] bg-[#123158] hover:bg-[#0e2a4b] text-white p-2 rounded-l z-30 hidden lg:block"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          type="button"
        >
          {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      )} */}

      {/* Sidebar */}
      <div
        className={`hidden lg:flex flex-col transition-transform duration-300 z-20 bg-[#123158] pt-25 px-4 w-64 h-[calc(110vh-5rem)] fixed top-18 left-0
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

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 right-0 left-0 z-40 h-[25vh] px-8 py-6 overflow-auto bg-gray-900/20 backdrop-blur-md">
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
