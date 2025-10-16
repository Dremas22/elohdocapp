"use client";

import { useUserStore } from "@/hooks/useUserStore";
import { useEffect, useState } from "react";
import {
  FiLoader,
  FiCalendar,
  FiClock,
  FiX,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import Link from "next/link";
import { getTimeUntil } from "@/lib/timeUntil";
import AppointmentEditModal from "./AppointmentEditModal";
import { toastError, toastSuccess } from "@/helpers/toastHelper";

/**
 * Appointments modal component with real-time Firestore updates.
 * Patients can edit or delete their appointments.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Callback to close the modal
 * @returns {JSX.Element} Appointments modal
 */
const Appointments = ({ onClose }) => {
  const { currentUser } = useUserStore();
  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);

  const fetchAppointments = async () => {
    if (!currentUser) return;
    try {
      setApptLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/appointments`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setAppointments(data.appointments || []);
      } else {
        console.error("Failed to load appointments.");
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setApptLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentUser?.userId]);

  // --- DELETE Appointment ---
  const handleDelete = async (appointmentId) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/appointments/${appointmentId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setAppointments((prev) =>
          prev.filter((appt) => appt.id !== appointmentId)
        );
        toastSuccess(data.message || "Appointment deleted successfully");
      } else {
        toastError(data.message || "Failed to delete appointment.");
      }
    } catch (err) {
      toastError(`Error deleting appointment:, ${err}`);
    }
  };

  // --- UPDATE Appointment (simple prompt version) ---
  const handleEdit = async (appt, updatedData) => {
    if (!appt?.id) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/appointments/${appt.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toastSuccess(data.message || "Appointment updated successfully");
        fetchAppointments();
      } else {
        toastError(data.message || "Failed to update appointment.");
      }
    } catch (err) {
      toastError(`Error updating appointment:, ${err}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[6px] z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full p-6 relative">
        {/* Close Button */}
        <div className="absolute right-3 top-3">
          <button
            onClick={() => onClose(false)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 
               text-gray-600 dark:text-gray-300 
               hover:text-gray-900 hover:cursor-pointer dark:hover:text-white 
               transition-colors duration-200"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Header */}
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 text-center">
          Appointments
        </h2>

        {/* Loading State */}
        {apptLoading ? (
          <div className="flex justify-center items-center h-40">
            <FiLoader className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-300">
              Loading appointments...
            </span>
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {appointments.map((appt, idx) => (
              <div
                key={idx}
                className="relative bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition-all duration-200"
              >
                <Link href={appt?.meetingLink} className="block">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {appt.patientName} with {appt.staffName}
                    </h3>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {getTimeUntil(appt.date, appt.time)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center space-x-4 text-gray-600 dark:text-gray-300 text-sm">
                    <span className="flex items-center">
                      <FiCalendar className="mr-1" /> {appt.date}
                    </span>
                    <span className="flex items-center">
                      <FiClock className="mr-1" /> {appt.time}
                    </span>
                  </div>

                  {appt.note && (
                    <p className="mt-2 text-gray-700 dark:text-gray-400 text-sm">
                      <span className="font-medium">Note:</span> {appt.note}
                    </p>
                  )}
                </Link>

                {currentUser?.role === "patient" && (
                  <div className="absolute right-3 bottom-3 flex space-x-2">
                    <button
                      onClick={() => setEditingAppt(appt)}
                      className="p-2 rounded-full hover:bg-gray-200 hover:cursor-pointer dark:hover:bg-gray-700"
                    >
                      <FiEdit2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => handleDelete(appt)}
                      disabled={true}
                      className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {editingAppt && (
              <AppointmentEditModal
                appointment={editingAppt}
                onClose={() => setEditingAppt(null)}
                onSave={(updatedData) => {
                  handleEdit(editingAppt, updatedData);
                  setEditingAppt(null);
                }}
              />
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No appointments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
