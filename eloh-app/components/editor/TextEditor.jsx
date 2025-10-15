"use client";

import useCurrentUser from "@/hooks/useCurrentUser";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MeetingRoomNavbar from "./MeetingRoomNavbar";
import PrescriptionForm from "./PrescriptionForm";
import SickNoteForm from "./SickNoteForm";
import useSaveMedicalHistory from "@/hooks/useSaveMedicalHistory";
import MessageBanner from "../MessageBanner";

/**
 * RichTextEditor component provides an interface for doctors to add medical notes,
 * prescriptions, or sick notes related to a patient during a meeting.
 *
 * @param {Object} props
 * @param {string} props.roomID - The unique identifier for the current meeting room (doctor's user ID).
 *
 * @returns {JSX.Element|null} The editor UI or null if user is not authorized.
 */
const RichTextEditor = ({ roomID }) => {
  const { loading, currentUser } = useCurrentUser();

  // Hook for saving notes with status/error feedback
  const { handleSaveNote, error, submitting, successMessage } =
    useSaveMedicalHistory();

  // State for the current textual note input
  const [currentNote, setCurrentNote] = useState("");

  // State to hold fetched patient data for the current patientId
  const [patientData, setPatientData] = useState(null);

  // Mode determines which form/view to show: "note", "prescription", or "sick-note"
  const [mode, setMode] = useState("note");

  // Retrieve patientId from URL query params
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get("patientId");
  const patientId = patientIdFromQuery;

  // Check if current user is the doctor associated with the roomID
  const isDoctor = roomID === currentUser?.uid;

  /**
   * Fetch patient data when component mounts or patientId changes.
   * Only runs if patientId is defined.
   */
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/patients/${patientId}`
        );
        if (!res.ok) throw new Error("Failed to fetch patient data");
        const data = await res.json();
        setPatientData(data?.patientData);
      } catch (error) {
        console.error("Error fetching patient:", error);
      }
    };

    fetchPatientData();
  }, [patientId]);

  // 🔹 Automatically clear messages after 5 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        resetError();
        resetSuccess();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Show loading message while user or auth state is loading
  if (loading || !currentUser) return <p>Loading...</p>;

  return (
    <>
      {isDoctor && patientData ? (
        <div className="w-full p-4 bg-white text-black border-l border-gray-700 flex flex-col justify-between">
          {/* Navigation bar for switching between modes */}
          <MeetingRoomNavbar mode={mode} setMode={setMode} doctorId={roomID} />

          {/* Conditional rendering of form based on selected mode */}
          <div className="mt-4 flex-grow bg-white">
            {mode === "note" && (
              <>
                <h3 className="font-semibold mb-2">Add Notes</h3>
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Write notes here..."
                  rows={5}
                  className="w-full p-2 rounded bg-white border border-gray-600 text-black resize-none focus:outline-none focus:ring focus:ring-blue-500"
                />
                <button
                  onClick={async () =>
                    await handleSaveNote({
                      mode,
                      noteContent: currentNote,
                      patientId,
                      roomID,
                    })
                  }
                  disabled={submitting}
                  className="bg-[#03045e] text-white py-3 px-5 text-sm font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? "Saving..." : "Save Note"}
                </button>
              </>
            )}

            {mode === "prescription" && (
              <PrescriptionForm
                patientData={patientData}
                doctorId={roomID}
                patientId={patientId}
                mode={mode}
                error={error}
                success={successMessage}
                submitting={submitting}
              />
            )}

            {mode === "sick-note" && (
              <SickNoteForm
                patientData={patientData}
                doctorId={roomID}
                patientId={patientId}
                mode={mode}
                error={error}
                success={successMessage}
                submitting={submitting}
              />
            )}
          </div>
        </div>
      ) : null}
      {/* Display error message if any */}
      {error && <MessageBanner type="error" message={error} />}

      {/* Display success message */}
      {successMessage && (
        <MessageBanner type="success" message={successMessage} />
      )}
    </>
  );
};

export default RichTextEditor;
