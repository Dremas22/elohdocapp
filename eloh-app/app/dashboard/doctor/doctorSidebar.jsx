"use client";

import { useState } from "react";
import Calendar from "@/app/dashboard/doctor/calendar";

/**
 * Renders a group of sidebar action buttons (prescriptions, notes, etc.)
 */
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
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-6 h-6">
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


const SidebarMenu = ({ practiceNumber, isVerified, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [writeNotesOn, setWriteNotesOn] = useState(false);

  const actionButtons = [
    {
      title: "Edit Profile",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 10v1m-6 0a6 6 0 1112 0v1a2 2 0 01-2 2H8a2 2 0 01-2-2v-1z" />
        </svg>
      ),
      onClick: () => alert("Edit Profile clicked!"),
    },
    {
      title: "View Notifications",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a7 7 0 00-14 0v3.2c0 .5-.2 1.1-.6 1.4L2 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      onClick: () => alert("View Notifications clicked!"),
    },
    {
      title: "Create Prescription",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12h6m-3-3v6m7-13H5a2 2 0 00-2 2v16l4-4h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
        </svg>
      ),
      onClick: () => alert("Create Prescription clicked!"),
    },
    {
      title: "Create Sick Note",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12h6m2 0a9 9 0 10-18 0 9 9 0 0018 0zm-9 4h.01" />
        </svg>
      ),
      onClick: () => alert("Create Sick Note clicked!"),
    },
    {
      title: "Write Notes",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      onClick: () => setWriteNotesOn(!writeNotesOn),
    },
    {
      title: "Schedule Availability",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => setCalendarOpen(true),
    },
  ];

  return (
    <>
      <SidebarToggleBtn isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} />

      <div
        className={`fixed top-24 left-0 h-[calc(100vh-6rem)] bg-white dark:bg-[#123158] text-gray-800 dark:text-gray-100 shadow-lg z-40 transition-all duration-300 ease-in-out ${isOpen ? "w-44" : "w-0 overflow-hidden"}`}
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

              {/* Availability Toggle */}
              <div className="flex items-center gap-3">
                <label className="relative inline-block w-12 h-7">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={() => setIsAvailable(!isAvailable)}
                    className="sr-only peer"
                  />
                  <span className="block bg-gray-300 peer-checked:bg-green-500 rounded-full h-7 w-12 transition-colors"></span>
                  <span className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform peer-checked:translate-x-5" />
                </label>
                <span className={`text-sm font-semibold ${isAvailable ? "text-green-400" : "text-gray-400"}`}>
                  {isAvailable ? "Online" : "Offline"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 overflow-auto items-center flex-grow">
                <ActionButtons buttons={actionButtons} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Calendar Drawer */}
      <div
        className={`fixed top-26 right-0 h-[calc(100vh-6rem)] w-full max-w-md bg-white text-black z-50 shadow-lg transition-transform duration-300 ease-in-out ${calendarOpen ? "translate-x-0" : "translate-x-full"}`}
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
