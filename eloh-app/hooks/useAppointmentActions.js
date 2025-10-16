import { toastError, toastSuccess } from "@/helpers/toastHelper";
import { useCallback } from "react";

/**
 * Custom hook for appointment CRUD actions (update & delete)
 * Works seamlessly with your existing API routes.
 */
export const useAppointmentActions = () => {
  // 🔹 Update appointment
  const updateAppointment = useCallback(async (appointmentId, updates) => {
    if (!appointmentId) {
      toastError("Missing appointment ID.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/appointments/${appointmentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toastError(data.message || "Failed to update appointment.");
        return null;
      }

      toastSuccess("Appointment updated successfully!");
      return data.updatedAppointment;
    } catch (err) {
      console.error("Error updating appointment:", err);
      toastError("Error updating appointment.");
      return null;
    }
  }, []);

  // 🔹 Delete appointment
  const deleteAppointment = useCallback(async (appointmentId) => {
    if (!appointmentId) {
      toastError("Missing appointment ID.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/appointments/${appointmentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toastError(data.message || "Failed to delete appointment.");
        return false;
      }

      toastSuccess("Appointment deleted successfully!");
      return true;
    } catch (err) {
      console.error("Error deleting appointment:", err);
      toastError("Error deleting appointment.");
      return false;
    }
  }, []);

  return {
    updateAppointment,
    deleteAppointment,
  };
};
