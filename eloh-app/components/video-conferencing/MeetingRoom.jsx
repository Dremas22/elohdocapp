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

  // Compute userName when ready
  const name = useMemo(() => {
    if (loading) return null;
    return currentUser?.displayName || `Guest_${Date.now()}`;
  }, [currentUser, loading]);

  const encodedName = encodeURIComponent(name || "");

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

  // Auto-join once everything is ready
  useEffect(() => {
    if (!hasJoined && name && room) {
      handleJoin();
    }
  }, [hasJoined, name, room]);

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
        <div className="text-lg font-medium text-gray-700">
          Joining meeting...
        </div>
      ) : (
        <RoomContext.Provider value={roomInstance}>
          <div
            data-lk-theme="default"
            style={{ height: "100dvh" }}
            className="bg-gray-500 border border-gray-900"
          >
            <MyVideoConference roomID={room} />
            <RoomAudioRenderer />
            <ControlBar />
          </div>
        </RoomContext.Provider>
      )}
      <RichTextEditor roomID={room} />
    </div>
  );
};

function MyVideoConference() {

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  return (
    <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>

      <ParticipantTile />
    </GridLayout>
  );
}

export default MeetingRoom;
