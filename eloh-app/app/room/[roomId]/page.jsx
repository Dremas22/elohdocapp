"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useCurrentUser from "@/hooks/useCurrentUser";
import RichTextEditor from "@/components/editor/TextEditor";
import MeetingRoom from "@/components/video-conferencing/MeetingRoom";

const Room = () => {
  const { currentUser, loading } = useCurrentUser();
  const params = useParams();

  const roomID = params.roomId;
  const doctorId = roomID;
  const userId = currentUser?.userId || currentUser?.uid || null;
  const isDoctor = userId === doctorId;
  const patientId = isDoctor ? null : userId;

  const [patientData, setPatientData] = useState(null);
  const [currentNote, setCurrentNote] = useState("");

  console.log({ patientData, patientId }, "PATIENT");
  console.log({ isDoctor, currentNote }, "DOCTOR");

  return (
    <div className="flex h-screen">
      {/* Video Meeting Section */}
      <div className="flex-1 relative">
        <MeetingRoom
          doctorId={doctorId}
          patientId={patientId}
          isDoctor={isDoctor}
          userId={userId}
          currentUser={currentUser}
          loading={loading}
          patientData={patientData}
          setPatientData={setPatientData}
        />
      </div>

      <RichTextEditor
        doctorId={doctorId}
        isDoctor={isDoctor}
        patientData={patientData}
        currentNote={currentNote}
        setCurrentNote={setCurrentNote}
        setPatientData={setPatientData}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Room;
