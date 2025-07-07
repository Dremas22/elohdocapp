"use client";

import React, { useState } from "react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year, month) {
    // month is 0-based: 0=Jan, 11=Dec
    return new Date(year, month + 1, 0).getDate();
}

const Calendar = () => {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState(null);

    // Scheduling form state
    const [time, setTime] = useState("");
    const [note, setNote] = useState("");
    const [scheduledAppointments, setScheduledAppointments] = useState([]);

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentYear(currentYear - 1);
            setCurrentMonth(11);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentYear(currentYear + 1);
            setCurrentMonth(0);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
        setSelectedDate(null);
    };

    const handleDateClick = (day) => {
        setSelectedDate(new Date(currentYear, currentMonth, day));
        setTime("");
        setNote("");
    };

    const handleSchedule = () => {
        if (!selectedDate || !time) {
            alert("Please select a date and enter a time.");
            return;
        }
        const newAppointment = {
            date: selectedDate.toDateString(),
            time,
            note,
        };
        setScheduledAppointments([...scheduledAppointments, newAppointment]);
        alert("Appointment scheduled!");
        setSelectedDate(null);
        setTime("");
        setNote("");
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    aria-label="Previous month"
                >
                    &lt;
                </button>
                <h2 className="text-lg font-semibold">
                    {new Date(currentYear, currentMonth).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                    })}
                </h2>
                <button
                    onClick={handleNextMonth}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    aria-label="Next month"
                >
                    &gt;
                </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 text-center font-semibold text-gray-600 mb-2">
                {daysOfWeek.map((day) => (
                    <div key={day}>{day}</div>
                ))}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {/* Blank cells for offset */}
                {[...Array(firstDayOfMonth)].map((_, i) => (
                    <div key={"blank-" + i} />
                ))}

                {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const isSelected =
                        selectedDate &&
                        selectedDate.getFullYear() === currentYear &&
                        selectedDate.getMonth() === currentMonth &&
                        selectedDate.getDate() === day;

                    const isToday =
                        today.getFullYear() === currentYear &&
                        today.getMonth() === currentMonth &&
                        today.getDate() === day;

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={`py-2 rounded ${isSelected
                                ? "bg-blue-600 text-white"
                                : isToday
                                    ? "border border-blue-600"
                                    : "hover:bg-gray-200"
                                }`}
                            aria-pressed={isSelected}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {/* Scheduling form */}
            {selectedDate && (
                <div className="mt-4 p-4 border rounded bg-gray-50">
                    <h3 className="font-semibold mb-2">
                        Schedule for {selectedDate.toDateString()}
                    </h3>
                    <label className="block mb-2">
                        Time:
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="ml-2 border rounded px-2 py-1"
                        />
                    </label>
                    <label className="block mb-2">
                        Note:
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Optional notes"
                            className="w-full border rounded px-2 py-1 mt-1"
                            rows={3}
                        />
                    </label>
                    <button
                        onClick={handleSchedule}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Save Appointment
                    </button>
                </div>
            )}

            {/* Scheduled appointments */}
            {scheduledAppointments.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Scheduled Appointments:</h3>
                    <ul className="list-disc list-inside text-gray-700">
                        {scheduledAppointments.map((appt, idx) => (
                            <li key={idx}>
                                <strong>{appt.date}</strong> at <strong>{appt.time}</strong>{" "}
                                {appt.note && `- ${appt.note}`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Calendar;
