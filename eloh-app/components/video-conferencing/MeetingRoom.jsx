"use client";

import { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const MeetingRoom = ({
  doctorId,
  patientId,
  isDoctor,
  userId,
  currentUser,
  loading,
  patientData,
  setPatientData,
}) => {
  const containerRef = useRef(null);
  const hasJoined = useRef(false);

  const [isNotifying, setIsNotifying] = useState(false);
  const [notifyError, setNotifyError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [participants, setParticipants] = useState([]);

  // Notify doctor and fetch patient data
  useEffect(() => {
    if (!doctorId || !patientId || loading) return;

    const notifyAndFetchPatient = async () => {
      setIsNotifying(true);
      setNotifyError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/notify-doctor`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ doctorId, patientId }),
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
  }, [doctorId, patientId, loading]);

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

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      doctorId,
      patientId,
      currentUser.displayName,
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
            doctorId,
        },
      ],
      onJoinRoom: () => {
        setIsJoining(false);
      },
    });
  }, [doctorId, patientId, currentUser?.displayName, loading]);

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
    </div>
  );
};

export default MeetingRoom;
