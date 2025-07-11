"use client";

import useCurrentUser from "@/hooks/useCurrentUser";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MeetingRoomNavbar from "./MeetingRoomNavbar";
import PrescriptionForm from "./PrescriptionForm";
import SickNoteForm from "./SickNoteForm";
import useSaveMedicalHistory from "@/hooks/useSaveMedicalHistory";
const RichTextEditor = ({ roomID }) => {
  const { loading, currentUser } = useCurrentUser();
  const { handleSaveNote, error, submitting, successMessage } =
    useSaveMedicalHistory();
  const [currentNote, setCurrentNote] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [mode, setMode] = useState("note"); // "note", "prescription", "sick-note"
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get("patientId");
  const patientId = patientIdFromQuery;

  const isDoctor = roomID === currentUser?.uid;

  //  Fetch patient data on mount
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/patients/${patientId}`
        );
        if (!res.ok) throw new Error("Failed to fetch patient data");
        const data = await res.json();
        setPatientData(data);
      } catch (error) {
        console.error("Error fetching patient:", error);
      }
    };

    fetchPatientData();
  }, [patientId]);

  if (loading || !currentUser) return <p>Loading...</p>;

  return (
    <>
      {isDoctor && patientData ? (
        <div className="w-full p-4 bg-white text-black border-l border-gray-700 flex flex-col justify-between">
          {/** Error */}
          {error && <p className="text-red-500">{error}</p>}
          {/** Success message */}
          {successMessage && <p className="text-green-500">{successMessage}</p>}
          {/* Pass patientData, mode, and setMode to Navbar - Dont forget to fetch doctor's Info */}
          <MeetingRoomNavbar mode={mode} setMode={setMode} doctorId={roomID} />

          {/* Render content based on selected mode */}
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
    </>
  );
};

export default RichTextEditor;
