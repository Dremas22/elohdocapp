"use client";

import { useState } from "react";
import Link from "next/link";

/* Action Buttons with optional links */
const ActionButtons = ({ buttons }) => (
    <>
        {buttons.map((label) => (
            <button
                key={label}
                className="bg-[#03045e] text-white py-3 px-5 text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
            >
                {label}
            </button>
        ))}
    </>
);

/* Dropdown for Patients */
const PatientsDropdown = ({ isOpen, toggleDropdown }) => {
    const links = ["Chronic Patients", "Acute Patients", "Routine Checkups"];

    return (
        <nav className="mt-2">
            <div className="relative">
                <button
                    onClick={toggleDropdown}
                    className="flex items-center w-full px-4 py-2 text-sm font-semibold text-left bg-transparent rounded-lg hover:bg-gray-200 focus:outline-none focus:shadow-outline dark:text-gray-200 dark:hover:bg-[#023e8a] cursor-pointer"
                >
                    <span>Patients</span>
                    <svg
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        className={`inline w-4 h-4 ml-1 transition-transform ${isOpen ? "rotate-180" : "rotate-0"
                            }`}
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>

                {isOpen && (
                    <div className="mt-2 rounded-md shadow-lg bg-white dark:bg-[#123158] z-10 max-h-40 overflow-auto">
                        {links.map((link, idx) => (
                            <Link
                                key={idx}
                                href="#"
                                className="block px-4 py-2 text-sm font-semibold rounded-lg hover:bg-[#023e8a] dark:text-gray-200 dark:hover:bg-[#023e8a] cursor-pointer"
                            >
                                {link}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};

/* Toggle Button */
const SidebarToggleBtn = ({ isOpen, toggle, leftPosition }) => (
    <button
        onClick={toggle}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        className={`fixed active:translate-y-1 top-27 left-1 z-50 bg-[#123158] shadow p-2 rounded text-white transition-left duration-300 ease-in-out ${leftPosition} cursor-pointer`}
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
                    <line
                        x1="18"
                        y1="6"
                        x2="6"
                        y2="18"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <line
                        x1="6"
                        y1="6"
                        x2="18"
                        y2="18"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </>
            ) : (
                <>
                    <line
                        x1="4"
                        y1="6"
                        x2="20"
                        y2="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <line
                        x1="4"
                        y1="12"
                        x2="20"
                        y2="12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <line
                        x1="4"
                        y1="18"
                        x2="20"
                        y2="18"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </>
            )}
        </svg>
    </button>
);

/* Sidebar Component */
const SidebarMenu = ({ practiceNumber, isVerified }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Main navigation buttons
    const actionButtons = [
        "Start Consultation",
        "Create Prescription",
        "Create Sick Note",
        "View Patient History",
    ];

    // Button positioning changes depending on sidebar state
    const toggleBtnLeft = isOpen ? "left-[200px]" : "left-1";

    return (
        <>
            {/* Sidebar toggle (hamburger) */}
            <SidebarToggleBtn
                isOpen={isOpen}
                toggle={() => setIsOpen(!isOpen)}
                leftPosition={toggleBtnLeft}
            />

            {/* Sidebar container */}
            <div
                className={`fixed top-24 left-0 h-[calc(100vh-6rem)] w-64 bg-white dark:bg-[#123158] text-gray-700 dark:text-gray-200 z-40 shadow transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="px-4 pb-6 pt-2.5 space-y-4 h-full flex flex-col">
                    {/* Practice number display */}
                    <div className="text-left pl-2 mt-2 text-sm text-white font-medium">
                        Practice No: {practiceNumber || "N/A"}
                    </div>

                    {/* Verification alert */}
                    {isVerified === false && (
                        <div className="max-w-xl mx-auto mb-4">
                            <div className="bg-yellow-100 text-yellow-800 border border-yellow-800 text-sm p-2 rounded">
                                Your account is pending verification.
                            </div>
                        </div>
                    )}

                    {isVerified === null && (
                        <div className="max-w-xl mx-auto mb-4">
                            <div className="bg-red-100 text-red-800 border border-red-800 text-sm p-2 rounded">
                                Your account verification was declined. Please check your
                                practice number or contact support.
                            </div>
                        </div>
                    )}

                    {/* Main button and dropdown area */}
                    {isVerified && (
                        <div className="flex flex-col gap-4 flex-grow overflow-auto">
                            <ActionButtons buttons={actionButtons} />
                            <PatientsDropdown
                                isOpen={dropdownOpen}
                                toggleDropdown={() => setDropdownOpen(!dropdownOpen)}
                            />
                        </div>
                    )}
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
                    Save
                </button>
            </section>
        </>
    );
};

export default SidebarMenu;
