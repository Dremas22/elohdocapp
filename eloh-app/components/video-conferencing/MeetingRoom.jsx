"use client";

import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import "@livekit/components-styles";
import { useEffect, useState, useMemo } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useRouter, useSearchParams } from "next/navigation";
import RichTextEditor from "@/components/editor/TextEditor";
import { toast } from "react-toastify";

const MeetingRoom = () => {
  const { currentUser, loading } = useCurrentUser();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  const doctorId = searchParams.get("doctorId");
  const isDoctor = doctorId === currentUser?.uid;

  const room = doctorId;
  const [token, setToken] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const router = useRouter();

  const [roomInstance] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      })
  );

  // Compute userName when ready
  const name = useMemo(() => {
    if (loading) return null;
    return currentUser?.displayName || `Guest_${Date.now()}`;
  }, [currentUser, loading]);

  const encodedName = encodeURIComponent(name || "");

  const handleJoin = async () => {
    if (!name || !room || !currentUser?.uid) {
      toast.error("You must be logged in to continue.");
      return;
    }

    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/token?room=${room}&username=${encodedName}`
      );
      const data = await resp.json();

      if (data.token) {
        setToken(data.token);
        await roomInstance.connect(
          process.env.NEXT_PUBLIC_LIVEKIT_URL,
          data.token
        );
        setHasJoined(true);
      } else {
        console.error("Token not returned:", data);
      }
    } catch (e) {
      console.error("Error joining room:", e);
    }
  };

  useEffect(() => {
    return () => {
      roomInstance.disconnect();
    };
  }, [roomInstance]);

  // Auto-join once everything is ready
  useEffect(() => {
    if (!hasJoined && name && room) {
      handleJoin();
    }
  }, [hasJoined, name, room]);

  const handleGoBack = () => {
    if (isDoctor) {
      router.push("/dashboard/doctor");
    } else {
      router.back();
    }
  };

  if (loading || !name) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-700">
        <div className="text-lg font-semibold">Loading user info...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-100 relative">
      {/* Back Button */}
      {hasJoined && (
        <button
          onClick={handleGoBack}
          className="absolute top-6 left-6 z-50 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-200 transition duration-200"
        >
          ← Back
        </button>
      )}
      {/* Loading State */}
      {!hasJoined ? (
        <div className="m-auto text-lg font-semibold text-gray-700">
          Joining meeting...
        </div>
      ) : (
        <>
          {/* Left: Video Conference */}
          <RoomContext.Provider value={roomInstance}>
            <div
              data-lk-theme="default"
              className={`${
                isDoctor ? "flex-[0.6]" : "flex-1"
              } bg-gray-900 border-r border-gray-700 overflow-hidden`}
            >
              <MyVideoConference roomID={room} />
              <RoomAudioRenderer />
              <ControlBar />
            </div>
          </RoomContext.Provider>

          {/* Right: Text Editor for Doctor Only */}
          {typeof isDoctor === "undefined" ? (
            // Still determining if user is doctor
            <div className="flex-[0.4] min-w-[400px] h-full bg-white border-l border-gray-300 shadow-inner flex items-center justify-center">
              <p className="text-gray-600 text-lg">Loading editor...</p>
            </div>
          ) : isDoctor ? (
            // Doctor confirmed
            <div className="flex-[0.4] min-w-[400px] h-full bg-white border-l border-gray-300 shadow-inner overflow-y-auto">
              <RichTextEditor roomID={doctorId} />
            </div>
          ) : null}
        </>
      )}
      <>
        {/* Left: Video Conference */}
        <RoomContext.Provider value={roomInstance}>
          <div
            data-lk-theme="default"
            className={`${
              isDoctor ? "flex-[0.6]" : "flex-1"
            } bg-gray-900 border-r border-gray-700 overflow-hidden`}
          >
            <MyVideoConference roomID={room} />
            <RoomAudioRenderer />
            <ControlBar />
          </div>
        </RoomContext.Provider>

        {/* Right: Text Editor for Doctor Only */}
        {typeof isDoctor === "undefined" ? (
          // Still determining if user is doctor
          <div className="flex-[0.4] min-w-[400px] h-full bg-white border-l border-gray-300 shadow-inner flex items-center justify-center">
            <p className="text-gray-600 text-lg">Loading editor...</p>
          </div>
        ) : isDoctor ? (
          // Doctor confirmed
          <div className="flex-[0.4] min-w-[400px] h-full bg-white border-l border-gray-300 shadow-inner overflow-y-auto">
            <RichTextEditor roomID={doctorId} />
          </div>
        ) : null}
      </>
      )}
    </div>
  );
};

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}

export default MeetingRoom;
