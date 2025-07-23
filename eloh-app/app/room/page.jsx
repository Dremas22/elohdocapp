"use client";

import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
  ParticipantName,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import "@livekit/components-styles";
import { useEffect, useState, useMemo } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useSearchParams } from "next/navigation";
import RichTextEditor from "@/components/editor/TextEditor";

const MeetingRoom = () => {
  const { currentUser, loading } = useCurrentUser();
  const searchParams = useSearchParams();

  const doctorId = searchParams.get("doctorId");
  const patientId = searchParams.get("patientId");
  const room = doctorId;
  const [token, setToken] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  const [roomInstance] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      })
  );

  // ✅ Only compute userName once currentUser is ready
  const name = useMemo(() => {
    if (loading) return null;
    return currentUser?.displayName || `Guest_${Date.now()}`;
  }, [currentUser, loading]);

  const encodedName = encodeURIComponent(name);

  const handleJoin = async () => {
    if (!name || !room) return;

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

  // ✅ Wait until user is loaded
  if (loading || !name) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-700">
        <div className="text-lg font-semibold">Loading user info...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {!hasJoined ? (
        <button
          onClick={handleJoin}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
        >
          Join Meeting Room
        </button>
      ) : (
        <RoomContext.Provider value={roomInstance}>
          <div data-lk-theme="default" style={{ height: "100dvh" }}>
            <MyVideoConference roomID={room} />
            <RoomAudioRenderer />
            <ControlBar />
          </div>
        </RoomContext.Provider>
      )}
    </div>
  );
};

function MyVideoConference({ roomID }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <>
      <GridLayout
        tracks={tracks}
        style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
      >
        <>
          {tracks.map((trackRef) => (
            <div
              key={trackRef.participant.identity}
              className="relative rounded-lg overflow-hidden shadow"
            >
              <ParticipantTile trackRef={trackRef} />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                {trackRef.participant.identity}
              </div>
            </div>
          ))}
        </>
      </GridLayout>
      <RichTextEditor roomID={roomID} />
    </>
  );
}

export default MeetingRoom;
