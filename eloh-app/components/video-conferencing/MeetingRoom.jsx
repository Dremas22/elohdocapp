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

  // Display name once user is loaded
  const name = useMemo(() => {
    if (loading) return null;
    return currentUser?.displayName || `Guest_${Date.now()}`;
  }, [currentUser, loading]);

  const encodedName = encodeURIComponent(name || "");

  // Join room logic
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

  // Disconnect when component unmounts
  useEffect(() => {
    return () => {
      roomInstance.disconnect();
    };
  }, [roomInstance]);

  // Trigger joining when ready
  useEffect(() => {
    if (!hasJoined && name && room) {
      handleJoin();
    }
  }, [hasJoined, name, room]);

  // Handle exit
  const handleClose = () => {
    if (isDoctor) {
      router.push("/dashboard/doctor");
    } else {
      router.back();
    }
  };

  if (loading || !name) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#edf6f9] text-[#03045e]">
        <div className="text-lg font-semibold">Loading user info...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f1f8ff] font-sans relative overflow-hidden">
      {!hasJoined ? (
        // Loading state before joining room
        <div className="m-auto text-lg font-semibold text-[#0077b6]">
          Joining secure session...
        </div>
      ) : (
        <>
          {/* 🎥 LEFT: Video Conference Section */}
          <RoomContext.Provider value={roomInstance}>
            <div
              data-lk-theme="default"
              className={`${isDoctor ? "flex-[0.6]" : "flex-1"
                } bg-[#caf0f8] border-r border-[#90e0ef] overflow-hidden relative flex flex-col`}
            >
              {/* 🔴 Top Navbar with "Live" Ping + Close */}
              <header className="bg-gray-300 w-full text-white py-2 px-4 font-semibold text-lg shadow flex items-center justify-between">
                {/* Live Ping Indicator and Title */}
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </span>
                  <span className="text-white text-base sm:text-lg">Live Consultation</span>
                </div>

                {/* ❌ Close Button with Icon */}
                <button
                  onClick={handleClose}
                  className="flex items-center gap-2 bg-[#03045e] text-gray-200 py-2 px-4 text-sm sm:text-base font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
                >
                  <span>Close</span>
                </button>
              </header>

              {/* LiveKit Video Grid */}
              <div className="flex-1">
                <MyVideoConference />
              </div>

              {/* Media Control Bar */}
              <div className="bg-gray-950">
                <ControlBar />
              </div>

              {/* Audio Output Renderer */}
              <RoomAudioRenderer />
            </div>
          </RoomContext.Provider>

          {/* 📝 RIGHT: Doctor's Notes */}
          {typeof isDoctor === "undefined" ? (
            <div className="flex-[0.4] min-w-[400px] h-full bg-white border-l border-[#90e0ef] shadow-inner flex items-center justify-center">
              <p className="text-[#0077b6] text-lg">Preparing your editor...</p>
            </div>
          ) : isDoctor ? (
            <div className="flex-[0.4] min-w-[400px] h-full bg-white border-l border-[#90e0ef] shadow-inner overflow-y-auto p-4">
              <h2 className="text-xl font-semibold text-[#0077b6] mb-4">Doctor’s Notes</h2>
              <RichTextEditor roomID={doctorId} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

// 🔁 Renders the video tiles in grid layout
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
      style={{
        height: "calc(100vh - var(--lk-control-bar-height) - 48px)", // navbar + control bar height
      }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}

export default MeetingRoom;