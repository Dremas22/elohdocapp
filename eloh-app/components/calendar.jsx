"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useUserStore } from "@/hooks/useUserStore";
import { useRouter } from "next/navigation";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

const roleTargets = {
  doctor: "patient",
  nurse: "patient",
  patient: "doctor/nurse",
  driver: "customer",
  customer: "driver",
};

const Calendar = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [scheduledAppointments, setScheduledAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { currentUser } = useUserStore();
  const router = useRouter();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Fetch appointments & patients
  const fetchAppointments = async () => {
    if (!currentUser) return;
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
        setPatients(data.patients || []);
        // auto-select first patient if available
        if (data.patients?.length) setSelectedPatient(data.patients[0]);
      } else {
        toast.error("Failed to load appointments.");
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      toast.error("Error loading appointments.");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentUser?.userId]);

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
      toast.error("Please select a date and enter a time.");
      return;
    }

    if (["doctor", "nurse"].includes(currentUser.role) && !selectedPatient) {
      toast.error("Please select a patient.");
      return;
    }

    try {
      const newAppointment = {
        date: selectedDate.toDateString(),
        staffName: currentUser?.fullName,
        patientName: selectedPatient?.fullName,
        time,
        note,
        targetRole: roleTargets[currentUser?.role],
        role: currentUser?.role,
        patientId: selectedPatient?.userId || undefined,
        link: `/room?staffId=${currentUser?.userId}&patientId=${selectedPatient?.userId}`,
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
        toast.success(
          `Appointment set for ${selectedDate.toDateString()} at ${time}.`
        );
        setSelectedDate(null);
        setTime("");
        setNote("");
        fetchAppointments(); // refresh
      } else {
        toast.error(data.error || "Failed to save appointment.");
      }
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      toast.error("Failed to save appointment.");
    }
  };

  console.log(currentUser, "CURRENT_USER");

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
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

          {/* Patient Dropdown for doctor/nurse */}
          {["doctor", "nurse"].includes(currentUser?.role) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient
              </label>
              <select
                value={selectedPatient?.userId}
                onChange={(e) =>
                  setSelectedPatient(
                    patients.find((p) => p.userId === e.target.value) || null
                  )
                }
                disabled={patients?.length === 0}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
              >
                {patients?.length === 0 && (
                  <option value="">No patients available</option>
                )}
                {patients?.map((p) => (
                  <option key={p.userId} value={p.userId}>
                    {p.fullName || p.email || "Unnamed Patient"}
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

          <div className="text-right">
            <button
              onClick={handleSchedule}
              className="bg-[#03045e] hover:bg-[#023e8a] text-white font-semibold px-6 py-2 rounded-lg"
            >
              Save Appointment
            </button>
          </div>
        </div>
      )}

      {/* Appointments List */}
      {scheduledAppointments.length > 0 && (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-y-auto">
          <h3 className="text-lg font-bold text-[#03045e] mb-4">
            Scheduled Appointments
          </h3>
          <ul className="space-y-4 text-gray-700">
            {scheduledAppointments.map((appt) => (
              <li
                key={appt.id}
                className="pl-4 border-l-4 border-[#0d6efd] bg-gray-50 p-3 rounded-md cursor-pointer hover:border-[#527cbb]"
                onClick={() => router.push(appt?.link)}
              >
                <div className="text-sm">
                  <span className="font-semibold">{appt.date}</span> at{" "}
                  <span className="font-semibold">{appt.time}</span> (
                  {appt.targetRole})
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
