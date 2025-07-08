"use client";

import useCurrentUser from "@/hooks/useCurrentUser";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const RichTextEditor = ({ roomID }) => {
  const { loading, currentUser } = useCurrentUser();
  const [currentNote, setCurrentNote] = useState("");
  const [patientData, setPatientData] = useState(null);
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get("patientId");
  const patientId = patientIdFromQuery;

  const isDoctor = roomID === currentUser?.uid;

  // 🔁 Fetch patient data on mount
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

  const handleSaveNotes = async () => {
    const trimmedNote = currentNote.trim();
    if (!trimmedNote) return alert("Note cannot be empty");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/patients/update-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId,
            roomID,
            notes: trimmedNote,
          }),
        }
      );

      if (!res.ok) {
        alert("Failed to save note");
        return;
      }

      // ✅ Optionally refetch patient data or just clear the note
      setCurrentNote("");
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Something went wrong");
    }
  };

  if (loading || !currentUser) return <p>Loading...</p>;

  return (
    <>
      {isDoctor && patientData ? (
        <div className="w-[400px] p-4 bg-gray-800 text-white border-l border-gray-700 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Patient Info</h2>
            <p>
              <strong>Name:</strong> {patientData.fullName || "Unknown"}
            </p>
            <p>
              <strong>Patient ID:</strong> {patientData.id || patientId}
            </p>

            <h3 className="mt-4 font-semibold">Add Notes</h3>
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Write notes here..."
              rows={5}
              className="w-full mt-2 p-2 rounded bg-gray-700 border border-gray-600 text-white resize-none focus:outline-none focus:ring focus:ring-blue-500"
            />

            <button
              onClick={handleSaveNotes}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition text-white"
            >
              Save Note
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default RichTextEditor;
