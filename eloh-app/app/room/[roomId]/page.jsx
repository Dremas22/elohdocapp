"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import useCurrentUser from "@/hooks/useCurrentUser";
import RichTextEditor from "@/components/editor/TextEditor";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const Room = () => {
  const { currentUser, loading } = useCurrentUser();
  const params = useParams();
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get("patientId");

  const roomID = params.roomId;
  const doctorId = roomID;
  const userId = currentUser?.userId || currentUser?.uid || null;
  const userName = currentUser?.displayName || `Guest-${Date.now()}`;
  const isDoctor = userId === doctorId;
  const patientId = patientIdFromQuery || (isDoctor ? null : userId);

  const containerRef = useRef(null);
  const hasJoined = useRef(false);

  useEffect(() => {
    const myMeeting = async () => {
      if (!containerRef.current || hasJoined.current || !currentUser || loading)
        return;

      hasJoined.current = true; // mark before join to prevent race conditions

      const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userId,
        userName,
        1800
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      // defer to next JS tick to avoid hydration-related duplication
      setTimeout(() => {
        zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: "Copy Link",
              url:
                window.location.protocol +
                "//" +
                window.location.host +
                "/room/" +
                roomID +
                `?patientId=${patientId}`,
            },
          ],

          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
          },
        });
      }, 0);
    };

    myMeeting();
  }, [roomID, userId, userName, currentUser, loading]);

  return (
    <div className="flex h-screen">
      {/* Video Section */}
      <div className="flex-1 bg-black text-white">
        <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
          <div className="flex-grow" ref={containerRef}></div>
        </div>
      </div>

      {/* Notes Section with only patientId and roomID passed */}
      <RichTextEditor patientId={patientId} roomID={roomID} />
    </div>
  );
};

export default Room;
