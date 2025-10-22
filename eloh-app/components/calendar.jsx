"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/hooks/useUserStore";
import { daysOfWeek, roleTargets } from "@/constants";
import { getDaysInMonth } from "@/lib/timeUntil";
import AppointmentCard from "./appointment/Appointment";
import { toastError, toastSuccess } from "@/helpers/toastHelper";

/**
 * Calendar component for scheduling and viewing appointments.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.userDoc - Optional user document to use as context
 * @returns {JSX.Element} Calendar UI with appointment scheduling
 */
const Calendar = ({ userDoc }) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [scheduledAppointments, setScheduledAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [relatedUsers, setRelatedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { currentUser } = useUserStore();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Fetch appointments & related users (patients or staff)
  const fetchAppointments = async () => {
    if (!currentUser || !userDoc) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/appointments`,
        {
          method: "GET",
        }
      );
      const data = await res.json();

      if (res.ok && data.authenticated) {
        setScheduledAppointments(data.appointments || []);
        setRelatedUsers(data.relatedUsers || []);

        // auto-select first related user if available
        if (data.relatedUsers?.length) setSelectedUser(data.relatedUsers[0]);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentUser?.userId, userDoc?.userId]);

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

  const handleSchedule = async () => {
    if (!selectedDate || !time) {
      toastError("Please select a date and enter a time.");
      return;
    }

    if (
      ["doctor", "nurse", "patient"].includes(currentUser.role) &&
      !selectedUser
    ) {
      toastError("Please select a user to schedule with.");
      return;
    }

    try {
      const isStaff = ["doctor", "nurse"].includes(currentUser.role);
      const isPatient = currentUser.role === "patient";

      const staffId = isStaff ? currentUser.userId : selectedUser?.userId;
      const patientId = isPatient ? currentUser.userId : selectedUser?.userId;

      // Only construct meeting link if both IDs exist
      const meetingLink =
        staffId && patientId
          ? `/room?staffId=${staffId}&patientId=${patientId}`
          : null;

      const targetRole =
        roleTargets[currentUser.role]?.[selectedUser?.role] ||
        `${currentUser.role.toUpperCase()} → ${selectedUser?.role?.toUpperCase()}`;

      const newAppointment = {
        date: selectedDate.toDateString(),
        time,
        note: note || "",
        targetRole: targetRole,
        role: currentUser.role,

        staffName: isStaff
          ? currentUser.fullName
          : selectedUser?.fullName || "",
        patientName: isPatient
          ? currentUser.fullName
          : selectedUser?.fullName || "",

        staffId: staffId || "",
        patientId: patientId || "",
        meetingLink,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/appointments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAppointment),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toastSuccess(
          `Appointment set for ${selectedDate.toDateString()} at ${time}.`
        );
        setSelectedDate(null);
        setTime("");
        setNote("");
        fetchAppointments(); // refresh
      }
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      toastError(`Error scheduling appointment:, ${error}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow h-[90vh] flex flex-col overflow-y-auto">
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        >
          &gt;
        </button>
      </div>

      {/* Days of the Week */}
      <div className="grid grid-cols-7 text-center font-semibold text-gray-600 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Dates */}
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

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`py-2 rounded ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : isToday
                  ? "border border-blue-600"
                  : "hover:bg-gray-200"
              }`}
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

          {/* User Dropdown */}
          {["doctor", "nurse", "patient"].includes(currentUser?.role) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {["doctor", "nurse"].includes(currentUser.role)
                  ? "Select Patient"
                  : "Select Doctor/Nurse"}
              </label>
              <select
                value={selectedUser?.userId}
                onChange={(e) =>
                  setSelectedUser(
                    relatedUsers.find((u) => u.userId === e.target.value) ||
                      null
                  )
                }
                disabled={relatedUsers?.length === 0}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
              >
                {relatedUsers?.length === 0 && (
                  <option value="">No users available</option>
                )}

                {/* Group users by their roles */}
                {currentUser?.role === "patient" && (
                  <>
                    {/* Doctors Group */}
                    <optgroup label="Doctors">
                      {relatedUsers
                        .filter((u) => u.role === "doctor")
                        .map((u) => (
                          <option key={u.userId} value={u.userId}>
                            {u.fullName || u.email || "Unnamed"}
                          </option>
                        ))}
                    </optgroup>

                    {/* Nurses Group */}
                    <optgroup label="Nurses">
                      {relatedUsers
                        .filter((u) => u.role === "nurse")
                        .map((u) => (
                          <option key={u.userId} value={u.userId}>
                            {u.fullName || u.email || "Unnamed"}
                          </option>
                        ))}
                    </optgroup>
                  </>
                )}

                {/* Default behavior for other roles */}
                {currentUser?.role !== "patient" &&
                  relatedUsers.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.fullName || u.email || "Unnamed"}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Time Input */}
          <div className="mb-4">
            <label
              htmlFor="appointment-time"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Time
            </label>
            <input
              id="appointment-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
            />
          </div>

          {/* Notes Input */}
          <div className="mb-4">
            <label
              htmlFor="appointment-note"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              id="appointment-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional notes"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
              rows={3}
            />
          </div>

          <div className="text-right mt-4">
            <button
              onClick={handleSchedule}
              disabled={loading}
              className={`relative flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold text-white shadow-[0_4px_#999] transition-all duration-200 ease-in-out 
                  ${
                    loading
                      ? "bg-[#023e8a] cursor-not-allowed opacity-80"
                      : "bg-[#03045e] hover:bg-[#023e8a] active:shadow-[0_2px_#666] active:translate-y-1"
                  }`}
            >
              {loading && (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Saving..." : "Save Appointment"}
            </button>
          </div>
        </div>
      )}

      {/* Appointments List */}
      {scheduledAppointments.length > 0 && (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#03045e] mb-4">
            Scheduled Appointments
          </h3>
          <ul className="space-y-4 text-gray-700">
            {scheduledAppointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                onUpdated={() => fetchAppointments()}
                onDeleted={() => fetchAppointments()}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Calendar;
