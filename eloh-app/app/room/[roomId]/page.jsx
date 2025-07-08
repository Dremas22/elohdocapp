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
    <div className="flex h-screen">
      <div className="flex-1 bg-black text-white">
        <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
          <div className="flex-grow" ref={containerRef}></div>
        </div>
      </div>

      <RichTextEditor roomID={roomID} />
    </div>
  );
};

export default Room;
