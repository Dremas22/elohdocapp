"use client";

import { toastError } from "@/helpers/toastHelper";
import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

/**
 * Modal component for editing an appointment's date, time, and note.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.appointment - The appointment object to edit.
 * @param {string} props.appointment.id - The appointment ID.
 * @param {string} props.appointment.date - The appointment date (string).
 * @param {string} props.appointment.time - The appointment time (string, e.g., "14:30").
 * @param {string} [props.appointment.note] - Optional appointment note.
 * @param {function} props.onClose - Callback to close the modal.
 * @param {function} props.onSave - Callback invoked when saving, receives updated data: `{ date, time, note }`.
 *
 * @example
 * <AppointmentEditModal
 *   appointment={{ id: "123", date: "2025-10-16", time: "10:30", note: "Bring documents" , ... }}
 *   onClose={() => setEditing(false)}
 *   onSave={(updatedData) => handleSave(updatedData)}
 * />
 */
const AppointmentEditModal = ({ appointment, onClose, onSave }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState(appointment?.time || "");
  const [note, setNote] = useState(appointment?.note || "");

  // Convert appointment.date to YYYY-MM-DD for the date input
  useEffect(() => {
    if (appointment?.date) {
      const d = new Date(appointment.date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      setDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [appointment?.id]);

  const handleSave = () => {
    if (!date || !time) {
      toastError("Please fill in both date and time.");
      return;
    }
    onSave({ date, time, note });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[6px] z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          aria-label="Close edit modal"
        >
          <FiX className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 text-center">
          Edit Appointment
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentEditModal;
