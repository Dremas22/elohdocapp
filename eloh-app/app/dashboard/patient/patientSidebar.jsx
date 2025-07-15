"use client";

import { useState, useEffect } from "react";
import { FiUser, FiFileText, FiFile, FiFolder } from "react-icons/fi";
import { messaging } from "@/db/client";
import { onMessage } from "firebase/messaging";
import NotificationModal from "@/components/NotificationModal";
import ProfileModal from "@/components/ProfileModal";
import useSaveMedicalHistory from "@/hooks/useSaveMedicalHistory";

/**
 * ActionButtons for patient dashboard.
 */
const ActionButtons = ({ buttons, notificationCount, payload, compact }) => {
  const layout = compact
    ? "grid grid-cols-2 gap-9"
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
              ${compact ? "h-15 w-18" : "w-24 h-12"}
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

const PatientSidebarMenu = ({ userDoc, compact = false }) => {
  const [hasNotification, setHasNotification] = useState(false);
  const [notificationPayload, setNotificationPayload] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

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

      if (!res.ok) throw new Error(result.error || "Update failed");
      const result = await res.json();

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
      onClick: () => setMode("prescriptions"),
    },
    {
      title: "View Medical Records",
      icon: <FiFolder className="h-6 w-6" />,
      onClick: () => setMode("general-notes"),
    },
    {
      title: "View Sick Notes",
      icon: <FiFile className="h-6 w-6" />,
      onClick: () => setMode("sick-notes"),
    },
    {
      title: "Request Ambulance",
      icon: <span className={`${compact ? "text-3xl" : "text-2xl"}`}>🚑</span>,
      onClick: () => alert("Ambulance request initiated..."),
      customClass: "sm:ml-0 ml-13.5",
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

      <div
        className={`p-6 text-white z-10 ${
          compact
            ? "bg-gray-950 pt-11 pr-25 pl-17 w-[45vh] h-[60vh]"
            : "bg-[#123158] pt-30 w-64 h-full"
        }`}
      >
        <div className="flex text-center w-full pl-5 font-bold text-[#66e4ff] text-lg mb-5">
          Welcome, {userDoc?.displayName?.split(" ")[0] || "Patient"}!
        </div>

        <ActionButtons
          buttons={actionButtons}
          notificationCount={notificationCount}
          payload={notificationPayload}
          compact={compact}
        />
      </div>
    </>
  );
};

export default PatientSidebarMenu;
