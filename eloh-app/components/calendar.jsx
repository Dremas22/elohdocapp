"use client";

import { useState } from "react";
import { toast } from "react-toastify";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

const Calendar = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
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
          title="Previous Month"
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
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
          title="Next Month"
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
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

          const dateLabel = new Date(
            currentYear,
            currentMonth,
            day
          ).toDateString();

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              title={`Select ${dateLabel}`}
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
        <div className="mt-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-[#03045e] mb-4">
            Schedule for {selectedDate.toDateString()}
          </h3>

          {/* Time Input */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="appointment-time"
            >
              Time
            </label>
            <input
              id="appointment-time"
              title="Pick a suitable time for this appointment"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0d6efd] cursor-pointer text-gray-700"
            />
          </div>

          {/* Notes Input */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="appointment-note"
            >
              Notes <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              id="appointment-note"
              title="Add notes related to this appointment"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Follow-up on blood test results"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0d6efd] text-gray-700"
              rows={3}
            />
          </div>

          {/* Save Button */}
          <div className="text-right">
            <button
              onClick={handleSchedule}
              title="Save this appointment"
              className="bg-[#03045e] hover:bg-[#023e8a] text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all duration-200 ease-in-out active:shadow-sm active:translate-y-1"
            >
              Save Appointment
            </button>
          </div>
        </div>
      )}

      {/* Improved Appointment List */}
      {scheduledAppointments.length > 0 && (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#03045e] mb-4">Scheduled Appointments</h3>
          <ul className="space-y-4 text-gray-700">
            {scheduledAppointments.map((appt, idx) => (
              <li key={idx} className="pl-4 border-l-4 border-[#0d6efd] bg-gray-50 p-3 rounded-md">
                <div className="text-sm">
                  <span className="font-semibold">{appt.date}</span> at{" "}
                  <span className="font-semibold">{appt.time}</span>
                </div>
                {appt.note && (
                  <div className="text-xs text-gray-500 mt-1">
                    Note: {appt.note}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};

export default Calendar;
