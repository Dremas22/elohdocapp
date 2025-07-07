"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const SidebarMenu = ({ practiceNumber, isVerified, isOpen, setIsOpen }) => {
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [selectedDays, setSelectedDays] = useState([]);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const toggleCalendar = () => setCalendarOpen(!calendarOpen);
    const handleSave = () => {
        alert(`Availability saved! (${selectedDays.length} day(s))`);
        setCalendarOpen(false);
    };

    const actionButtons = [
        {
            title: "Start Consultation",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4 2v2l-4 2v-6zM4 6h10a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                </svg>
            ),
            onClick: () => { },
        },
        {
            title: "Create Prescriptions",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m7-13H5a2 2 0 00-2 2v16l4-4h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
                </svg>
            ),
        },
        {
            title: "Create Sick Notes",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a9 9 0 10-18 0 9 9 0 0018 0zm-9 4h.01" />
                </svg>
            ),
        },
        {
            title: "View Patient History",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10c0 1.1.9 2 2 2h6v-2H5V7h6V5H5a2 2 0 00-2 2zm13-2h4a2 2 0 012 2v10a2 2 0 01-2 2h-4v-2h4V7h-4V5z" />
                </svg>
            ),
        },
        {
            title: "Refer to Clinic",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V10a1 1 0 011-1h16a1 1 0 011 1v11M9 21v-6h6v6M12 12v3M10.5 13.5h3" />
                </svg>
            ),
        },
        {
            title: "View Notes",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
            ),
        },
        {
            title: "View Notifications",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a7 7 0 00-14 0v3.159c0 .538-.214 1.055-.595 1.436L2 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            ),
        },
        {
            title: calendarOpen ? "Close Calendar" : "Schedule Availability",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            onClick: toggleCalendar,
        },
    ];

    return (
        <>
            <button
                onClick={toggleSidebar}
                className={`fixed top-27 left-1 z-50 bg-[#123158] p-2 rounded text-white shadow transition-all duration-300 ${isOpen ? "left-28.5" : "left-1"}`}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-6 h-6">
                        <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                        <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-6 h-6">
                        <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
                        <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
                        <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
                    </svg>
                )}
            </button>

            <aside className={`fixed top-24 left-0 h-[calc(100vh-6rem)] w-40 bg-white dark:bg-[#123158] shadow z-40 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex flex-col px-4 pt-2.5 pb-6 space-y-4 h-full">
                    <div className="text-white text-sm font-medium pl-2 mt-2">Practice No: {practiceNumber || "N/A"}</div>

                    {!isVerified && (
                        <div className="flex items-center bg-yellow-100 text-yellow-800 border border-yellow-800 py-2 rounded text-sm whitespace-nowrap px-2 justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z" />
                            </svg>
                            <span>Verification pending</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 pl-2 text-white text-sm font-medium">
                        <span>Available</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 relative after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                    </div>

                    <div className="flex flex-col gap-4 flex-grow items-center">
                        {actionButtons.map(({ title, icon, onClick }, i) => (
                            <button
                                key={i}
                                onClick={onClick}
                                title={title}
                                className="relative bg-[#03045e] text-white py-2.5 px-5 text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center w-28"
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            <section className={`fixed top-24 right-0 h-[calc(100vh-6rem)] w-96 bg-[#f8f9fa] shadow-lg z-50 p-6 transition-transform duration-300 ease-in-out ${calendarOpen ? "translate-x-0" : "translate-x-full"}`}>
                <h2 className="text-xl font-bold mb-4 text-[#03045e]">Schedule Your Availability</h2>
                <DayPicker
                    mode="multiple"
                    selected={selectedDays}
                    onSelect={setSelectedDays}
                    styles={{
                        day: { color: "#000" },
                        day_selected: { backgroundColor: "#2a5599", color: "#f8f9fa", borderRadius: "9999px" },
                        day_today: { backgroundColor: "#90e0ef", color: "#03045e", borderRadius: "9999px", fontWeight: "700" },
                        day_hover: { backgroundColor: "#90e0ef", color: "#000", cursor: "pointer" },
                    }}
                    dayContent={(day) => <span className="text-[#000] font-medium">{day.getDate()}</span>}
                />
                {selectedDays.length > 0 && (
                    <p className="mt-4 text-[#03045e]">
                        Selected <strong>{selectedDays.length}</strong> day(s).
                    </p>
                )}
                <button
                    onClick={handleSave}
                    className="mt-6 bg-[#03045e] hover:bg-[#023e8a] text-[#f8f9fa] px-6 py-2 rounded shadow transition-all"
                >
                    Save Availability
                </button>
            </section>
        </>
    );
};

export default SidebarMenu;
