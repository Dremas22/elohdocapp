"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { v4 as uuid } from "uuid";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import useCurrentUser from "@/hooks/useCurrentUser";

const MeetingRoom = () => {
  const { currentUser, loading } = useCurrentUser();
  const params = useParams();
  const roomID = params.roomId;
  const patientId = currentUser?.uid;

  console.log("Doctor ID:", roomID);
  console.log("Patient ID:", patientId);

  const containerRef = useRef(null);
  const hasJoined = useRef(false);
  const fullName = currentUser?.displayName || `Unknown user-${Date.now()}`;

  useEffect(() => {
    const myMeeting = async () => {
      if (!containerRef.current || hasJoined.current) return;

      hasJoined.current = true; // ✅ mark as joined

      const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        uuid(), // doctorId
        fullName, // user name
        1800 // expiration time
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: "Shareable Link",
            url:
              window.location.protocol +
              "//" +
              window.location.host +
              window.location.pathname +
              "?roomID=" +
              roomID,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
      });
    };

    myMeeting();
  }, [roomID, fullName]);

  return <div className="w-full h-screen" ref={containerRef}></div>;
};

export default MeetingRoom;
