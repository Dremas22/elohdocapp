"use client";

import {
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
  ControlBar,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import "@livekit/components-styles";
import { useEffect, useState, useMemo, useRef } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useRouter, useSearchParams } from "next/navigation";
import RichTextEditor from "@/components/editor/TextEditor";
import { toast } from "react-toastify";
import handleMeetingEnd from "@/lib/postMeetingUpdates";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/db/client";
import PatientCloseMeetingButton from "./PatientCloseMeetingButton";
import StaffCloseMeetingButton from "./StaffCloseMeetingButton";

const MeetingRoom = () => {
  const { currentUser, loading } = useCurrentUser();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  const doctorId = searchParams.get("staffId");

  const isDoctor = doctorId === currentUser?.uid;
  const isPatient = !isDoctor;
  const room = doctorId;

  const [hasJoined, setHasJoined] = useState(false);
  const [meetingClosing, setMeetingClosing] = useState(false);
  const [patientName, setPatientName] = useState("");
  const router = useRouter();
  const hasAlreadyHandledEnd = useRef(false);
  const [userRole, setUserRole] = useState("");

  const consultationDocRef = doc(db, "consultations", room);
  const patientDocRef = doc(db, "patients", patientId);

  const [roomInstance] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      })
  );

  useEffect(() => {
    const unsub = onSnapshot(consultationDocRef, (docSnap) => {
      const ended = docSnap.data()?.consultationEnded;
      if (ended && !hasAlreadyHandledEnd.current) {
        hasAlreadyHandledEnd.current = true;
        if (isDoctor) {
          console.log(userRole, "USER_ROLE_FROM_SNAPSHOT");
          router.push(router.push(`/dashboard/${userRole}`));
        } else {
          router.back();
        }
      }
    });
    return () => unsub();
  }, [consultationDocRef, isDoctor]);

  useEffect(() => {
    const getPatientName = async () => {
      const patientDoc = await getDoc(patientDocRef);
      setPatientName(patientDoc?.data().fullName);
      const idTokenResult = await currentUser?.getIdTokenResult();
      setUserRole(idTokenResult?.claims?.role);
    };
    getPatientName();
  }, [patientId, currentUser?.uid]);

  const isMobile = useIsMobile();

  const name = useMemo(() => {
    if (loading) return null;
    return currentUser?.displayName || patientName || currentUser?.email;
  }, [currentUser, loading]);

  const encodedName = encodeURIComponent(name || "");

  const handleJoin = async () => {
    if (!name || !room || !currentUser?.uid) {
      toast.error("You must be logged in to continue.");
      return;
    }

    await setDoc(
      consultationDocRef,
      {
        consultationEnded: false,
        startedAt: new Date(),
      },
      { merge: true }
    );

    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/token?room=${room}&username=${encodedName}`
      );
      const data = await resp.json();

      if (data.token) {
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

    if (!confirmed) return;

    if (hasAlreadyHandledEnd.current) return;
    hasAlreadyHandledEnd.current = true;

    try {
      setMeetingClosing(true);

      const existingDoc = await getDoc(consultationDocRef);
      if (existingDoc.exists() && existingDoc.data()?.consultationEnded) {
        return;
      }

      const staffRole = await handleMeetingEnd(doctorId, patientId);

      await setDoc(
        consultationDocRef,
        {
          consultationEnded: true,
          endedAt: new Date(),
          staffRole: staffRole,
        },
        { merge: true }
      );

      if (isDoctor) {
        router.push(`/dashboard/${staffRole || userRole}`);
      } else {
        router.back();
      }
    } catch (e) {
      console.error("Meeting end error:", e);
      toast.error("Something went wrong while ending the meeting.");
    } finally {
      setMeetingClosing(false);
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
          <RoomContext.Provider value={roomInstance}>
            <div
              data-lk-theme="default"
              className={`${
                isDoctor ? (isMobile ? "w-full h-1/2" : "flex-[0.6]") : "flex-1"
              } bg-[#788588] border-r border-[#788588] overflow-hidden relative flex flex-col`}
            >
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
              </header>

              <div className="flex-1">
                <MyVideoConference isDoctor={isDoctor} isMobile={isMobile} />
              </div>

              <div className="bg-gray-950 relative">
                <ControlBar />

                {/* 🔴 Conditional Close Buttons inside ControlBar wrapper */}
                {isPatient && (
                  <PatientCloseMeetingButton
                    onClick={handleClose}
                    disabled={meetingClosing}
                  />
                )}
                {isDoctor && (
                  <StaffCloseMeetingButton
                    onClick={handleClose}
                    disabled={meetingClosing}
                  />
                )}
              </div>

              <RoomAudioRenderer />
            </div>
          </RoomContext.Provider>

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

      {meetingClosing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-[99999] flex flex-col items-center justify-center text-white">
          <div className="text-2xl font-semibold animate-pulse mb-4">
            Ending Meeting...
          </div>
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

function MyVideoConference({ isDoctor, isMobile }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const visibleTracks = useMemo(() => {
    if (isMobile && isDoctor) {
      return tracks.filter(
        (t) =>
          !t.participant.isLocal && t.publication?.kind === Track.Kind.Video
      );
    }
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
