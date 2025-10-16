"use client";

import { useState } from "react";
import { useAppointmentActions } from "@/hooks/useAppointmentActions";
import Link from "next/link";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import AppointmentEditModal from "../AppointmentEditModal";
import { toastError, toastSuccess } from "@/helpers/toastHelper";

/**
 * Renders a single appointment card with date, time, role, and optional note.
 * Clicking the card navigates the user to the appointment's meeting link.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.appt - Appointment details.
 * @param {string} props.appt.date - Appointment date (e.g., "2025-09-12").
 * @param {string} props.appt.time - Appointment time (e.g., "10:30 AM").
 * @param {string} props.appt.targetRole - The role the appointment is with (e.g., "Doctor" or "Nurse").
 * @param {string} props.appt.meetingLink - URL for the appointment meeting.
 * @param {string} [props.appt.note] - Optional note about the appointment.
 * @param {string} [props.appt.staffId] - ID of staff
 * @param {string} [props.appt.patientId] - ID of patient
 *
 * @example
 * const appt = {
 *   date: "2025-09-12",
 *   time: "10:30 AM",
 *   targetRole: "Doctor",
 *   meetingLink: "/meeting/123",
 *   note: "Bring medical history"
 *    .....
 * };
 *
 * <AppointmentCard appt={appt} />
 */
const AppointmentCard = ({ appt, onUpdated, onDeleted }) => {
  const { updateAppointment, deleteAppointment } = useAppointmentActions();
  const [editing, setEditing] = useState(false);

  const handleSave = async (updatedData) => {
    const updated = await updateAppointment(appt.id, updatedData);
    if (updated) {
      if (onUpdated) onUpdated(updated);
      setEditing(false);
      toastSuccess("Appointment updated successfully");
    } else {
      toastError("Failed to update appointment.");
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault(); // prevent Link navigation
    const confirmDelete = confirm(
      "Are you sure you want to delete this appointment?"
    );
    if (!confirmDelete) return;
    const success = await deleteAppointment(appt.id);
    if (success && onDeleted) onDeleted(appt.id);
  };

  return (
    <>
      <li className="relative pl-4 border-l-4 border-[#0d6efd] bg-gray-50 p-3 rounded-md hover:border-[#527cbb] transition cursor-pointer group">
        <Link href={appt.meetingLink || "#"} className="block pr-12">
          <div className="text-sm">
            <span className="font-semibold">{appt.date}</span> at{" "}
            <span className="font-semibold">{appt.time}</span> (
            {appt.targetRole})
          </div>
          {appt.note && (
            <div className="text-xs text-gray-500 mt-1">Note: {appt.note}</div>
          )}
        </Link>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              setEditing(true);
            }}
            className="text-blue-600 hover:text-blue-800 hover:cursor-pointer p-1 rounded"
            title="Edit appointment"
          >
            <FiEdit size={16} />
          </button>

          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 hover:cursor-pointer p-1 rounded"
            title="Delete appointment"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </li>

      {editing && (
        <AppointmentEditModal
          appointment={appt}
          onClose={() => setEditing(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default AppointmentCard;
