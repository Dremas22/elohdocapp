"use client";

import { useState } from "react";
import { toast } from "react-toastify";

// Weekday headers
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Utility function to get the number of days in a specific month and year.
 * @param {number} year - The full year (e.g., 2025).
 * @param {number} month - The month index (0-based: Jan = 0, Dec = 11).
 * @returns {number} - Number of days in the given month.
 */
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Calendar Component
 * Allows users to:
 * - Navigate between months
 * - Select a date
 * - Schedule an appointment (time + optional note)
 * - View a list of scheduled appointments
 */
const Calendar = () => {
  // Initialize today's date
  const today = new Date();

  // State for current calendar month and year
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // State to manage the selected date for scheduling
  const [selectedDate, setSelectedDate] = useState(null);

  // State for appointment form inputs
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  // Store all scheduled appointments
  const [scheduledAppointments, setScheduledAppointments] = useState([]);

  // Calculate number of days in the selected month
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  // Get which day of the week the month starts on (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  /**
   * Navigate to the previous month.
   * Adjusts the year when crossing from January to December.
   */
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  /**
   * Navigate to the next month.
   * Adjusts the year when crossing from December to January.
   */
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  /**
   * Handle selection of a day from the calendar.
   * Resets the form inputs for new selection.
   * @param {number} day - Day of the month selected.
   */
  const handleDateClick = (day) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setTime("");
    setNote("");
  };

  /**
   * Handle scheduling an appointment.
   * Validates input, updates scheduled appointments,
   * and shows toast notifications for feedback.
   */
  const handleSchedule = () => {
    if (!selectedDate || !time) {
      toast.error(
        <div className="flex items-center gap-2 min-w-[300px]">
          <span className="text-sm">
            Please select a date and enter a time.
          </span>
        </div>,
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          theme: "colored",
        }
      );
      return;
    }

    const newAppointment = {
      date: selectedDate.toDateString(),
      time,
      note,
    };

    setScheduledAppointments([...scheduledAppointments, newAppointment]);

    toast.success(
      <div className="flex items-start gap-3 max-w-[90vw] sm:max-w-[400px]">
        <div className="text-sm leading-relaxed">
          Appointment set for <strong>{selectedDate.toDateString()}</strong> at{" "}
          <strong>{time}</strong>.
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        theme: "light",
      }
    );

    setSelectedDate(null);
    setTime("");
    setNote("");
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      {/* Month Navigation Header */}
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

      {/* Days of the Week Labels */}
      <div className="grid grid-cols-7 text-center font-semibold text-gray-600 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Dates */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Offset to start the calendar on the correct weekday */}
        {[...Array(firstDayOfMonth)].map((_, i) => (
          <div key={"blank-" + i} />
        ))}

        {/* Render each day of the month */}
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

      {/* Scheduling Form */}
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

      {/* Appointment List */}
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
