"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import useCurrentUser from "@/hooks/useCurrentUser";

const MeetingRoom = () => {
  const { currentUser, loading } = useCurrentUser();
  const params = useParams();

  const roomID = params.roomId; // doctorId used as roomId

  // Try multiple fields if userId isn't present on currentUser
  const patientId = currentUser?.userId || currentUser?.uid || null;

  const containerRef = useRef(null);
  const hasJoined = useRef(false);

  const [patientData, setPatientData] = useState(null);
  const [isNotifying, setIsNotifying] = useState(false);
  const [notifyError, setNotifyError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [currentNote, setCurrentNote] = useState("");

  // Notify doctor & fetch patient data by calling the API route directly
  useEffect(() => {
    if (!roomID || !patientId || loading) return;

    const notifyAndFetchPatient = async () => {
      setIsNotifying(true);
      setNotifyError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/notify-doctor`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ doctorId: roomID, patientId }),
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to notify doctor");
        }

        const data = await res.json();
        setPatientData(data.patient);
      } catch (error) {
        console.error("Error notifying doctor:", error);
        setNotifyError(error.message);
      } finally {
        setIsNotifying(false);
      }
    };

    notifyAndFetchPatient();
  }, [roomID, patientId, loading]);

  // Join Zego meeting room
  useEffect(() => {
    if (
      !containerRef.current ||
      hasJoined.current ||
      loading ||
      !currentUser?.displayName ||
      !patientId
    ) {
      return;
    }

    setIsJoining(true);
    hasJoined.current = true;

    const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;

    const fullName = currentUser.displayName;

    console.log("Joining room with:", {
      appID,
      roomID,
      patientId,
      fullName,
    });

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      patientId,
      fullName,
      1800
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: containerRef.current,
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
      sharedLinks: [
        {
          name: "Copy Link",
          url:
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname +
            "?roomID=" +
            roomID,
        },
      ],
      onJoinRoom: () => {
        setIsJoining(false);
      },
    });
  }, [roomID, currentUser, loading, patientId]);

  const isDoctor = currentUser?.userId === roomID;

  const handleSaveNotes = async () => {
    const trimmedNote = currentNote.trim();
    if (!trimmedNote) return alert("Note cannot be empty");

    const newNote = {
      doctorName,
      notes: trimmedNote,
      createdAt: new Date().toISOString(),
    };

    const updatedHistory = [...(patientData.medicalHistory || []), newNote];

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/patients/update-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: patientData.id,
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

  console.log({ patientData, patientId }, "PATIENT");

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
      {notifyError && (
        <div className="bg-red-600 text-white p-2 text-center">
          {notifyError}
        </div>
      )}

      {(isNotifying || isJoining) && (
        <div className="text-center p-2 text-gray-300">
          {isNotifying
            ? "Sending notification..."
            : "Preparing Meeting Room ..."}
        </div>
      )}

      <div className="flex-grow" ref={containerRef}></div>

      {patientData && (
        <div className="p-4 bg-gray-800 max-h-60 overflow-auto rounded-md">
          <h2 className="font-bold mb-2 text-white">Patient Info</h2>

          <p>
            <strong>Name:</strong> {patientData.fullName || "Unknown"}
          </p>
          <p>
            <strong>Email:</strong> {patientData.email || "Unknown"}
          </p>
          <p>
            <strong>Phone:</strong> {patientData.phoneNumber || "Unknown"}
          </p>
          {/** TODO: TEXT EDITOR GOES HERE */}
          {isDoctor && (
            <div className="mt-4">
              <h3 className="font-semibold mb-1 text-white">
                Medical History / Notes
              </h3>

              <textarea
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Add notes here..."
                rows={4}
              />

              <button
                onClick={handleSaveNotes}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save Note
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;
