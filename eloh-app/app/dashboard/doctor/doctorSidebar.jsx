"use client";

import { useState } from "react";

const ActionButtons = ({ buttons }) => (
  <>
    {buttons.map(({ icon, title, onClick }) => (
      <button
        key={title}
        title={title}
        onClick={onClick}
        className="bg-[#03045e] text-white w-20 h-9 flex items-center justify-center rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
        aria-label={title}
        type="button"
      >
        {icon}
      </button>
    ))}
  </>
);

const SidebarToggleBtn = ({ isOpen, toggle }) => {
  const toggleBtnSize = 40; // button size in px
  const closedLeft = 8; // when sidebar closed
  const openLeft = 130; // move left when sidebar opens 

  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      className="fixed top-26.5 bg-[#123158] p-2 rounded text-white cursor-pointer z-50"
      style={{
        width: toggleBtnSize,
        height: toggleBtnSize,
        left: isOpen ? openLeft : closedLeft,
        transition: "left 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        className="w-6 h-6"
      >
        {isOpen ? (
          <>
            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
          </>
        ) : (
          <>
            <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
            <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
            <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  );
};

const SidebarMenu = ({ practiceNumber, isVerified }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [writeNotesOn, setWriteNotesOn] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const actionButtons = [
    {
      title: "View Notifications",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a7 7 0 00-14 0v3.159c0 .538-.214 1.055-.595 1.436L2 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      onClick: () => alert("View Notifications clicked!"),
    },
    {
      title: "Create Prescription",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-3-3v6m7-13H5a2 2 0 00-2 2v16l4-4h10a2 2 0 002-2V5a2 2 0 00-2-2z"
          />
        </svg>
      ),
      onClick: () => alert("Create Prescription clicked!"),
    },
    {
      title: "Create Sick Note",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m2 0a9 9 0 10-18 0 9 9 0 0018 0zm-9 4h.01"
          />
        </svg>
      ),
      onClick: () => alert("Create Sick Note clicked!"),
    },
    {
      title: "View Patient History",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10c0 1.1.9 2 2 2h6v-2H5V7h6V5H5a2 2 0 00-2 2zm13-2h4a2 2 0 012 2v10a2 2 0 01-2 2h-4v-2h4V7h-4V5z"
          />
        </svg>
      ),
      onClick: () => alert("View Patient History clicked!"),
    },
    {
      title: "Write Notes",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"
          />
        </svg>
      ),
      onClick: () => setWriteNotesOn(!writeNotesOn),
    },
    {
      title: "Schedule Availability",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      onClick: () => setCalendarOpen(!calendarOpen),
    },
  ];

  return (
    <>
      {/* Toggle Button */}
      <SidebarToggleBtn isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} />

      {/* Sidebar */}
      <div
        className={`flex flex-col h-[calc(100vh-6rem)] bg-white dark:bg-[#123158] text-gray-700 dark:text-gray-200 shadow transition-all duration-300 ease-in-out ${isOpen ? "w-44" : "w-0 overflow-hidden"
          }`}
        style={{ minWidth: isOpen ? 176 : 0 }}
      >
        <div className="px-2 pb-6 pt-2.5 space-y-4 h-full flex flex-col items-center">
          <div className="text-left mt-3 text-white font-small text-sm w-full px-2">
            <div>Practice Number:</div>
            <div className="break-words">{practiceNumber || "N/A"}</div>
          </div>

          {/* Verification Alerts */}
          {isVerified === false && (
            <div className="max-w-xl mx-auto mb-3 px-2">
              <div className="bg-yellow-100 text-yellow-800 border border-yellow-800 text-s p-2 rounded text-center">
                Verification Pending.
              </div>
            </div>
          )}
          {isVerified === null && (
            <div className="max-w-xl mx-auto mb-4 px-2">
              <div className="bg-red-100 text-red-800 border border-red-800 text-xs p-2 rounded text-center">
                Verification declined. Check practice no or support.
              </div>
            </div>
          )}

          {/* Availability toggle */}
          <div className="flex items-center gap-3 mt-2">
            <label className="relative inline-block w-12 h-7 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={() => setIsAvailable(!isAvailable)}
                className="sr-only peer"
              />
              <span className="block bg-gray-300 peer-checked:bg-green-500 rounded-full h-7 w-12 transition-colors duration-300"></span>
              <span className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 peer-checked:translate-x-5"></span>
            </label>
            <span
              className={`text-sm font-semibold ${isAvailable ? "text-green-400" : "text-gray-400"
                }`}
            >
              {isAvailable ? "Online" : "Offline"}
            </span>
          </div>

          {/* Sidebar Actions */}
          <div className="flex flex-col gap-3 flex-grow overflow-auto items-center">
            <ActionButtons buttons={actionButtons} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
