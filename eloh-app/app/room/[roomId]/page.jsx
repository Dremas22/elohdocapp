"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import useCurrentUser from "@/hooks/useCurrentUser";
import RichTextEditor from "@/components/editor/TextEditor";

const Room = () => {
  const { currentUser, loading } = useCurrentUser();
  const params = useParams();
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get("patientId");

  const roomID = params.roomId;
  const doctorId = roomID;
  const userId = currentUser?.uid || currentUser?.userId || null;
  const userName = currentUser?.displayName || `Guest-${Date.now()}`;
  const isDoctor = userId === doctorId;
  const patientId = patientIdFromQuery || (isDoctor ? null : userId);

  const containerRef = useRef(null);
  const hasJoined = useRef(false);

  useEffect(() => {
    const myMeeting = async () => {
      if (!containerRef.current || hasJoined.current || !currentUser || loading)
        return;

      hasJoined.current = true;

      const { ZegoUIKitPrebuilt } = await import(
        "@zegocloud/zego-uikit-prebuilt"
      );

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

      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: "Copy Link",
            url: `${window.location.origin}/room/${roomID}?patientId=${patientId}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
      });
    };

    myMeeting();
  }, [roomID, userId, userName, currentUser, loading]);

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Video Area */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-black">
        <div className="w-full h-full flex flex-col bg-gray-900 text-white">
          <div className="flex-grow" ref={containerRef}></div>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full pd-5 bg-white p-4 overflow-auto">
        <RichTextEditor roomID={roomID} />
      </div>
    </div>
  );
};

export default Room;
