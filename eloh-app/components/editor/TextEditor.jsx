"use client";

const RichTextEditor = ({
  doctorId,
  isDoctor,
  patientData,
  currentNote,
  setCurrentNote,
  setPatientData,
  currentUser,
}) => {
  const handleSaveNotes = async () => {
    const trimmedNote = currentNote.trim();
    if (!trimmedNote) return alert("Note cannot be empty");

    const newNote = {
      doctorName: currentUser?.displayName || "Doctor",
      notes: trimmedNote,
      createdAt: new Date().toISOString(),
    };

    const updatedHistory = [...(patientData?.medicalHistory || []), newNote];

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/patients/update-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: patientData?.id,
            medicalHistory: updatedHistory,
          }),
        }
      );

      if (!res.ok) {
        alert("Failed to save note");
        return;
      }

      setPatientData((prev) => ({
        ...prev,
        medicalHistory: updatedHistory,
      }));
      setCurrentNote("");
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Something went wrong");
    }
  };

  if (!patientData || !isDoctor) return null;

  return (
    <div className="w-[400px] p-4 bg-gray-800 text-white border-l border-gray-700 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold mb-2">Patient Info</h2>
        <p>
          <strong>Name:</strong> {patientData.fullName || "Unknown"}
        </p>
        <p>
          <strong>Patient ID:</strong> {patientData.id || "Unknown"}
        </p>

        {isDoctor && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
