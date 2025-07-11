import { noteTypeMap } from "@/constants";
import { useState } from "react";

const useSaveMedicalHistory = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const resetError = () => setError(null);
  const resetSuccess = () => setSuccessMessage(null);

  const handleSaveNote = async ({ mode, noteContent, patientId, roomID }) => {
    resetError();
    resetSuccess();

    const noteType = noteTypeMap?.[mode];
    if (!noteType) {
      const msg = "Invalid or missing mode type.";
      setError(msg);
      return { success: false, error: msg };
    }

    if (!patientId || !roomID) {
      const msg = "Patient ID and Room ID are required.";
      setError(msg);
      return { success: false, error: msg };
    }

    const isNoteMode = mode === "note";
    const isContentEmpty =
      (isNoteMode &&
        (typeof noteContent !== "string" || noteContent.trim() === "")) ||
      (!isNoteMode &&
        (typeof noteContent !== "object" ||
          Object.keys(noteContent).length === 0));

    if (isContentEmpty) {
      const msg = "Note content is required and must be properly formatted.";
      setError(msg);
      return { success: false, error: msg };
    }

    setSubmitting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/patients/update-history`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            roomID,
            noteType,
            noteContent,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        const msg = errData?.error || "Failed to save note.";
        setError(msg);
        return { success: false, error: msg };
      }

      const result = await res.json();
      const msg = "Note saved successfully.";
      setSuccessMessage(msg);

      return { success: true, data: result, message: msg };
    } catch (err) {
      console.error("Error saving note:", err);
      const msg = "Unexpected error occurred while saving note.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    handleSaveNote,
    submitting,
    error,
    successMessage,
    resetError,
    resetSuccess,
  };
};

export default useSaveMedicalHistory;
