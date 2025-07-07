"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function CalendarPage() {
    const [selectedDays, setSelectedDays] = useState([]);

    const handleSave = () => {
        console.log("Availability saved:", selectedDays);
        alert("Availability saved!");
    };

    return (
        <>
            <style jsx>{`
                /* Month title */
                .rdp-caption_label {
                    color: #000000 !important;
                    font-weight: 700 !important;
                }
                /* Weekday headers */
                .rdp-head_cell {
                    color: #000000 !important;
                    font-weight: 600 !important;
                }
            `}</style>

            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
                    <h1 className="text-2xl font-bold text-center text-[#03045e] mb-6">
                        Schedule Your Availability
                    </h1>

                    <div className="bg-gray-100 rounded p-4">
                        <DayPicker
                            mode="multiple"
                            selected={selectedDays}
                            onSelect={setSelectedDays}
                            className="mx-auto"
                            styles={{
                                day: {
                                    color: "#000000",
                                },
                                day_selected: {
                                    backgroundColor: "#70c1e6", // darker light blue
                                    color: "#f8f9fa",
                                    borderRadius: "9999px",
                                },
                                day_today: {
                                    backgroundColor: "#90e0ef",
                                    color: "#03045e",
                                    borderRadius: "9999px",
                                    fontWeight: "700",
                                },
                                day_hover: {
                                    backgroundColor: "#90e0ef",
                                    color: "#000000",
                                    cursor: "pointer",
                                },
                            }}
                            modifiersClassNames={{
                                selected: "bg-[#70c1e6] text-[#f8f9fa] rounded-full",
                                today: "bg-[#90e0ef] text-[#03045e] font-bold rounded-full",
                                disabled: "text-gray-300",
                            }}
                            dayContent={(day) => (
                                <span className="text-[#000000] font-medium">{day.getDate()}</span>
                            )}
                        />
                    </div>

                    {selectedDays.length > 0 && (
                        <p className="text-center mt-4 text-[#03045e]">
                            Selected <strong>{selectedDays.length}</strong> day(s).
                        </p>
                    )}

                    <div className="text-center mt-6">
                        <button
                            onClick={handleSave}
                            className="bg-[#03045e] hover:bg-[#023e8a] text-[#f8f9fa] px-6 py-2 rounded shadow transition-all"
                        >
                            Save Availability
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
