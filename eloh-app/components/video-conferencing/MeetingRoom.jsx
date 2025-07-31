"use client";

import {
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import "@livekit/components-styles";
import { useEffect, useState, useMemo, useRef } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useRouter, useSearchParams } from "next/navigation";
import RichTextEditor from "@/components/editor/TextEditor";
import { toast } from "react-toastify";
import { ControlBar } from "@livekit/components-react";
import handleMeetingEnd from "@/lib/postMeetingUpdates";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/db/client";

const MeetingRoom = () => {
  const { currentUser, loading } = useCurrentUser();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  const doctorId = searchParams.get("staffId");

  const isDoctor = doctorId === currentUser?.uid;
  const isPatient = !isDoctor;
  const room = doctorId;

  const [token, setToken] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const router = useRouter();
  const hasAlreadyHandledEnd = useRef(false);

  // // Firestore doc to track if the consultation has ended
  // const consultationDocRef = doc(db, "consultations", room);

  // // Listen for consultation end triggered by the other party
  // useEffect(() => {
  //   const unsubscribe = onSnapshot(consultationDocRef, (docSnap) => {
  //     const data = docSnap.data();
  //     if (data?.consultationEnded && !hasAlreadyHandledEnd.current) {
  //       hasAlreadyHandledEnd.current = true;
  //       if (isDoctor) {
  //         router.push(`/dashboard/${data.staffRole || "doctor"}`);
  //       } else {
  //         router.back();
  //       }
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [room, isDoctor]);

  const [roomInstance] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      })
  );

  const isMobile = useIsMobile();

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

  useEffect(() => {
    if (!hasJoined && name && room) {
      handleJoin();
    }
  }, [hasJoined, name, room]);

  const handleClose = async () => {
    const confirmed = confirm(
      "Are you sure you want to leave the meeting? This will end the consultation and it cannot be resumed."
    );

    if (!confirmed || hasAlreadyHandledEnd.current) return;

    try {
      hasAlreadyHandledEnd.current = true;

      // Check if it's already been ended by someone else
      const existingDoc = await getDoc(consultationDocRef);
      if (existingDoc.exists() && existingDoc.data()?.consultationEnded) return;

      const staffRole = await handleMeetingEnd(patientId, doctorId);

      if (!staffRole) {
        toast.error("Failed to track meeting end. Please try again.");
        return;
      }

      // Mark the consultation as ended in Firestore
      await setDoc(consultationDocRef, {
        consultationEnded: true,
        endedAt: new Date(),
        staffRole,
      });

      if (isDoctor) {
        router.push(`/dashboard/${staffRole}`);
      } else {
        router.back();
      }
    } catch (e) {
      console.error("Meeting end error:", e);
      toast.error("Something went wrong while ending the meeting.");
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
    <div
      className={`flex ${
        isMobile && isDoctor ? "flex-col" : "flex-row"
      } h-screen w-full bg-[#f1f8ff] font-sans relative overflow-hidden`}
    >
      {!hasJoined ? (
        <div className="m-auto text-lg font-semibold text-[#0077b6]">
          Joining secure session...
        </div>
      ) : (
        <>
          {/* 🎥 Video Section */}
          <RoomContext.Provider value={roomInstance}>
            <div
              data-lk-theme="default"
              className={`${
                isDoctor ? (isMobile ? "w-full h-1/2" : "flex-[0.6]") : "flex-1"
              } bg-[#788588] border-r border-[#788588] overflow-hidden relative flex flex-col`}
            >
              {/* Top Bar */}
              <header className="bg-gray-300 text-white py-2 px-4 font-semibold text-lg shadow flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </span>
                  <span className="text-white text-base sm:text-lg">
                    Live Consultation
                  </span>
                </div>

                <button
                  onClick={handleClose}
                  className="flex items-center gap-2 bg-[#03045e] text-gray-200 py-2 px-4 text-sm sm:text-base font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
                >
                  <span>Close</span>
                </button>
              </header>

              <div className="flex-1">
                <MyVideoConference isDoctor={isDoctor} isMobile={isMobile} />
              </div>

              {/* ControlBar */}
              <div className="bg-gray-950">
                <ControlBar />
              </div>

              <RoomAudioRenderer />
            </div>
          </RoomContext.Provider>

          {/* 📝 Notes Section */}
          {typeof isDoctor === "undefined" ? (
            <div className="flex-[0.4] min-w-[400px] h-full bg-white border-l border-[#90e0ef] shadow-inner flex items-center justify-center">
              <p className="text-[#0077b6] text-lg">Preparing your editor...</p>
            </div>
          ) : isDoctor ? (
            <div
              className={`${
                isMobile
                  ? "w-full h-1/2 border-t"
                  : "flex-[0.4] min-w-[400px] border-l"
              } bg-white border-[#90e0ef] shadow-inner overflow-y-auto p-4`}
            >
              <h2 className="text-xl font-semibold text-[#0077b6] mb-4">
                Doctor’s Notes
              </h2>
              <RichTextEditor roomID={doctorId} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

// 🔍 Detect Mobile Device
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // check on load
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

// 🔁 Render Participant Tiles
function MyVideoConference({ isDoctor, isMobile }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const visibleTracks = useMemo(() => {
    // On mobile, if doctor: only show patient’s video (not self)
    if (isMobile && isDoctor) {
      return tracks.filter(
        (t) =>
          !t.participant.isLocal && t.publication?.kind === Track.Kind.Video
      );
    }

    // For patients, or on desktop: show all
    return tracks;
  }, [tracks, isDoctor, isMobile]);

  return (
    <GridLayout
      tracks={visibleTracks}
      style={{
        height: "calc(100vh - var(--lk-control-bar-height) - 48px)",
        width: "100%",
        margin: 0,
        padding: 0,
      }}
      className="w-full h-full"
    >
      <ParticipantTile />
    </GridLayout>
  );
}

export default MeetingRoom;
