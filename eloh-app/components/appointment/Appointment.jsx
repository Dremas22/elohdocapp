"use client";

import { useState } from "react";
import { useAppointmentActions } from "@/hooks/useAppointmentActions";
import Link from "next/link";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import AppointmentEditModal from "../AppointmentEditModal";
import { toastError, toastSuccess } from "@/helpers/toastHelper";

/**
 * AppointmentCard – displays appointment info with edit/delete controls.
 */
const AppointmentCard = ({ appt, onUpdated, onDeleted }) => {
  const { updateAppointment, deleteAppointment } = useAppointmentActions();
  const [editing, setEditing] = useState(false);

  const handleSave = async (updatedData) => {
    const updated = await updateAppointment(appt.id, updatedData);
    if (updated) {
      onUpdated?.(updated);
      setEditing(false);
      toastSuccess("Appointment updated successfully");
    } else {
      toastError("Failed to update appointment.");
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmDelete = confirm(
      "Are you sure you want to delete this appointment?"
    );
    if (!confirmDelete) return;

    const success = await deleteAppointment(appt.id);
    if (success) onDeleted?.(appt.id);
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);
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

        {/* ✅ Buttons visible by default on mobile, hover-only on desktop */}
        <div className="absolute right-3 bottom-3 -translate-y-1/2 flex space-x-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEditClick}
            className="text-blue-600 hover:text-blue-800 p-1 rounded cursor-pointer"
            title="Edit appointment"
          >
            <FiEdit size={16} />
          </button>

          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 p-1 rounded cursor-pointer"
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
