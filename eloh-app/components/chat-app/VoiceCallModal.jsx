"use client";

import { getDisplayName } from "@/lib/getDisplayName";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from "@livekit/components-react";
import { useEffect, useState, useRef } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/db/client";
import { useUserStore } from "@/hooks/useUserStore";

/* -------- Local mic publisher inside LiveKitRoom -------- */
function LocalAudioPublisher({ enabled }) {
  const room = useRoomContext();

  useEffect(() => {
    if (!room || !enabled) return;

    let mounted = true;

    const enableMic = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted || !room.localParticipant) return;

        await room.localParticipant.setMicrophoneEnabled(true);
        console.log(
          "Local mic published:",
          room.localParticipant.audioTrackPublications
        );
      } catch (err) {
        console.error("Failed to publish mic:", err);
      }
    };

    if (room.state === "connected") {
      enableMic();
    } else {
      room.once("connected", enableMic);
    }

    return () => {
      mounted = false;
      if (room?.localParticipant) {
        room.localParticipant.setMicrophoneEnabled(false).catch(() => {});
      }
    };
  }, [room, enabled]);

  return null;
}

/* -------- Logger for remote tracks -------- */
function RemoteTrackLogger() {
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;

    const onSub = (pub, track) => {
      console.log("trackSubscribed:", {
        participant: pub?.publisher,
        publicationSid: pub?.sid,
        kind: pub?.kind,
        trackId: track?.id,
      });
    };

    const onUnsub = (pub) => {
      console.log("trackUnsubscribed:", { publicationSid: pub?.sid });
    };

    const onParticipantLeave = (participant) => {
      console.log("participant left:", participant.identity);
    };

    room.on("trackSubscribed", onSub);
    room.on("trackUnsubscribed", onUnsub);
    room.on("participantDisconnected", onParticipantLeave);

    return () => {
      room.off("trackSubscribed", onSub);
      room.off("trackUnsubscribed", onUnsub);
      room.off("participantDisconnected", onParticipantLeave);
    };
  }, [room]);

  return null;
}

/* -------- Main VoiceCallModal -------- */
const VoiceCallModal = ({ user }) => {
  const { currentUser, isLoading } = useUserStore();
  const [incomingCall, setIncomingCall] = useState(null);
  const [voiceCalling, setVoiceCalling] = useState(false);
  const [voiceToken, setVoiceToken] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const ringtoneRef = useRef(null);

  const staffId = ["doctor", "nurse"].includes(currentUser?.role)
    ? currentUser.userId
    : ["doctor", "nurse"].includes(user?.role)
    ? user.userId
    : null;

  const patientId =
    staffId === currentUser.userId ? user?.userId : currentUser?.userId;
  const callId = staffId && patientId ? `${staffId}_${patientId}` : null;

  const isCaller = incomingCall?.caller?.id === currentUser?.userId;
  const showAcceptButton = incomingCall?.status === "ringing" && !isCaller;

  // Ringtone only for receiver
  const playRingtone = () => {
    if (!ringtoneRef.current) {
      const audio = new Audio("/ringtones/ringtone.mp3");
      audio.loop = true;
      audio.play().catch(() => {});
      ringtoneRef.current = audio;
    }
  };
  const stopRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current = null;
    }
  };

  // Listen to call updates in Firestore
  useEffect(() => {
    if (!callId) return;
    const unsubscribe = onSnapshot(doc(db, "calls", callId), (snap) => {
      const data = snap.exists() ? snap.data() : null;
      if (!data) {
        setIncomingCall(null);
        setVoiceCalling(false);
        stopRingtone();
        return;
      }
      setIncomingCall(data);
      setVoiceToken(data.token || null);

      if (data.type === "voice") {
        const active = ["ringing", "accepted"].includes(data.status);
        setVoiceCalling(active);

        if (data.status === "ringing" && !isCaller) playRingtone();
        else stopRingtone();

        if (["declined", "ended"].includes(data.status)) {
          setVoiceCalling(false);
          stopRingtone();
        }
      }
    });

    return () => {
      unsubscribe();
      stopRingtone();
    };
  }, [callId, currentUser, user, isCaller]);

  // Call timer
  useEffect(() => {
    clearInterval(timerRef.current);
    if (incomingCall?.status === "accepted") {
      timerRef.current = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [incomingCall?.status]);

  // Accept call
  const handleAcceptCall = async () => {
    if (!callId) return;
    await updateDoc(doc(db, "calls", callId), {
      status: "accepted",
      updatedAt: serverTimestamp(),
      duration: 0,
    });
    stopRingtone();
  };

  // Decline / hangup
  const handleDeclineCall = async () => {
    if (!callId) return;
    await updateDoc(doc(db, "calls", callId), {
      status: "ended",
      updatedAt: serverTimestamp(),
      duration: elapsedTime || 0,
      token: null,
    });
    setVoiceToken(null);
    stopRingtone();
    setVoiceCalling(false);
    setElapsedTime(0);
  };

  if (!voiceCalling || !incomingCall) return null;

  const statusText =
    incomingCall.status === "ringing"
      ? isCaller
        ? "Calling..."
        : "Incoming Voice Call"
      : "Voice Call in Progress...";

  const room = `${staffId}_${patientId}`;

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
      <div className="text-white flex flex-col items-center gap-4">
        <img
          src={user?.photoUrl || "/images/default_avatar.jpg"}
          alt="avatar"
          className="w-24 h-24 rounded-full border-4 border-white"
        />
        <h2 className="text-xl font-semibold">{getDisplayName(user)}</h2>
        <p className="text-gray-400">{statusText}</p>
        {incomingCall.status === "accepted" && (
          <p className="text-green-400 text-lg font-medium">
            {Math.floor(elapsedTime / 60)
              .toString()
              .padStart(2, "0")}
            :{(elapsedTime % 60).toString().padStart(2, "0")}
          </p>
        )}
      </div>

      {voiceToken && (
        <LiveKitRoom
          token={voiceToken}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          audio
          video={false}
          connectOptions={{ autoSubscribe: true }}
          roomName={room}
        >
          <LocalAudioPublisher
            enabled={
              incomingCall?.status === "accepted" ||
              (isCaller && incomingCall?.status === "ringing")
            }
          />
          <RemoteTrackLogger />
          <RoomAudioRenderer volume={1.0} />
        </LiveKitRoom>
      )}

      <div className="flex gap-6 mt-8">
        {showAcceptButton && (
          <button
            className="bg-green-600 px-6 py-3 rounded-full text-white font-semibold"
            onClick={handleAcceptCall}
          >
            Accept
          </button>
        )}
        <button
          className="bg-red-600 px-6 py-3 rounded-full text-white font-semibold"
          onClick={handleDeclineCall}
        >
          Hang Up
        </button>
      </div>
    </div>
  );
};

export default VoiceCallModal;
