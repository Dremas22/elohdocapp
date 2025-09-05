"use client";

import { useEffect, useState } from "react";
import {
  FiUser,
  FiCalendar,
  FiChevronUp,
  FiChevronDown,
  FiDollarSign,
  FiMessageCircle,
} from "react-icons/fi";
import { IoCloseCircleSharp } from "react-icons/io5";
import Calendar from "@/components/calendar";
import ProfileModal from "@/components/ProfileModal";
import DriverAvailabilityButton from "@/components/ambulance/DriverAvailabilityButton";
import ElohDocChatApp from "@/components/chat-app/ElohDocChatApp";
import { toastSuccess } from "@/helpers/toastHelper";

/**
 * Action Buttons component
 */
const ActionButtons = ({ buttons, notificationCount, compact }) => {
  const layout = compact
    ? "grid grid-cols-3 gap-4 justify-around"
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
            transition-all duration-200 ease-in-out 
            ${compact ? "h-20 w-20 sm:w-24 md:w-28" : "w-36 h-20"}
            bg-[#03045e]/90 hover:bg-[#023e8a] text-white
            focus:outline-none`}
        >
          <span>{icon}</span>
          <span className="text-white text-[11px] text-center leading-tight">
            {title}
          </span>
        </button>
      ))}
    </div>
  );
};

/**
 * DriverSidebarMenu
 */
const DriverSidebarMenu = ({
  userDoc,
  setShowEarnings,
  compact = false,
  isVerified,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  const [fetching, setFetching] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      setFetching(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/doctor/toggle-availability`
        );
        const data = await res.json();
        if (res.ok) setIsAvailable(data.available || false);
      } catch (err) {
        console.error("Failed to fetch availability:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchAvailability();
  }, []);

  const handleToggle = async () => {
    setFetching(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/doctor/toggle-availability`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) setIsAvailable(data.available);
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleProfileSave = async (updatedData) => {
    setProfileLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/users/update`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: userDoc.role, data: updatedData }),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Update failed");
      toastSuccess(result?.message);
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
      icon: <FiDollarSign className="h-6 w-6" />,
      onClick: () => setShowEarnings((pre) => !pre),
    },
    {
      title: "Chat",
      icon: <FiMessageCircle className="h-6 w-6" />,
      onClick: () => setOpenChat(true),
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

      {/* Chat Modal */}
      {openChat && (
        <div className="fixed text-white inset-0 z-50 lg:-ml-68 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-2xl mx-auto p-4">
            <ElohDocChatApp setOpenChat={setOpenChat} role="driver" />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col z-30 bg-[#123158] pt-30 px-4 w-64 h-[calc(110vh-5rem)] fixed top-18 left-0 transition-transform duration-300 ease-in-out ${
          !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {isVerified ? (
          <>
            <ActionButtons
              buttons={actionButtons}
              notificationCount={0}
              compact={compact}
            />
            <DriverAvailabilityButton
              isAvailable={isAvailable}
              onChange={handleToggle}
              fetching={fetching}
            />
          </>
        ) : (
          <div className="text-center text-white mt-10 px-2">
            <p className="text-sm font-medium">
              {isVerified === false
                ? "Your account verification is pending."
                : "Verification status unknown."}
            </p>
          </div>
        )}
      </div>

      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed bottom-1 right-1 text-xl z-50 flex items-center space-x-2 text-white rounded-full px-2 py-2 backdrop-blur-sm bg-[#03045e]/45">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          title={mobileSidebarOpen ? "Hide menu" : "Show menu"}
          className="flex items-center gap-1 focus:outline-none"
        >
          {mobileSidebarOpen ? (
            <>
              <FiChevronDown className="h-5 w-5" />
              <span className="text-sm font-semibold">Hide menu</span>
            </>
          ) : (
            <>
              <FiChevronUp className="h-5 w-5" />
              <span className="text-sm font-semibold">Show menu</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed bottom-0 right-0 left-0 z-40 h-[33vh] px-4 py-4 overflow-auto bg-gray-900/20 backdrop-blur-md flex flex-col items-center gap-4 transition-transform duration-500 ease-in-out ${
          mobileSidebarOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {isVerified && (
          <>
            {/* Other buttons except Schedule */}
            <ActionButtons
              buttons={actionButtons.filter((btn) => btn.title !== "Schedule")}
              compact={true}
            />

            {/* Schedule + On-Duty Toggle side by side */}
            <div className="flex justify-center items-center gap-2 mt-2">
              <div className="mr-[-4px]">
                <ActionButtons
                  buttons={actionButtons.filter(
                    (btn) => btn.title === "Schedule"
                  )}
                  compact={true}
                />
              </div>
              <div className="-ml-[150px]">
                <DriverAvailabilityButton
                  isAvailable={isAvailable}
                  onChange={handleToggle}
                  fetching={fetching}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Slide-in Calendar */}
      <div
        className={`fixed top-19 right-0 h-[calc(100vh-5rem)] w-full max-w-md bg-white text-black z-50 shadow-lg transition-transform duration-300 ease-in-out ${
          calendarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          title="Close Calendar"
          onClick={() => setCalendarOpen(false)}
          className="absolute bottom-75 scale-150 right-2 text-red-600 z-50 cursor-pointer"
        >
          <IoCloseCircleSharp />
        </button>
        <Calendar userDoc={userDoc} />
      </div>
    </>
  );
};

export default DriverSidebarMenu;
