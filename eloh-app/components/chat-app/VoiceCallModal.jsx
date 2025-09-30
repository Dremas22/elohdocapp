"use client";

import { getDisplayName } from "@/lib/getDisplayName";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { useEffect, useState, useRef } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/db/client";
import { useUserStore } from "@/hooks/useUserStore";

const VoiceCallModal = ({ user }) => {
  const { currentUser } = useUserStore();
  const [incomingCall, setIncomingCall] = useState(null);
  const [voiceCalling, setVoiceCalling] = useState(false);
  const [voiceToken, setVoiceToken] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const ringtoneRef = useRef(null);

  // Determine staff vs patient
  const staffId = ["doctor", "nurse"].includes(currentUser?.role)
    ? currentUser.userId
    : ["doctor", "nurse"].includes(user?.role)
    ? user.userId
    : null;

  const patientId =
    staffId === currentUser.userId ? user?.userId : currentUser?.userId;

  // Generate callId
  const callId = staffId && patientId ? `${staffId}_${patientId}` : null;

  // Play/stop ringtone helpers
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
      try {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      } catch {}
      ringtoneRef.current = null;
    }
  };

  // Listen to call updates
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

      // Voice call logic
      if (data.type === "voice") {
        setVoiceToken(data.token || null);

        if (["ringing", "accepted"].includes(data.status)) {
          setVoiceCalling(true);
          if (data.status === "ringing" && !isCaller) {
            playRingtone();
          } else {
            stopRingtone();
          }
        } else if (["declined", "ended"].includes(data.status)) {
          setVoiceCalling(false);
          stopRingtone();
        }
      }
    });

    return () => {
      unsubscribe();
      stopRingtone();
    };
  }, [callId, currentUser, user]);

  const isCaller = incomingCall?.caller?.id === currentUser.userId;

  const showAcceptButton = incomingCall?.status === "ringing" && !isCaller;

  // Call timer
  useEffect(() => {
    clearInterval(timerRef.current);
    if (incomingCall?.status === "accepted") {
      timerRef.current = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [incomingCall?.status]);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

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

  // Decline/hangup call
  const handleDeclineCall = async () => {
    if (!callId) return;

    await updateDoc(doc(db, "calls", callId), {
      status: "ended",
      updatedAt: serverTimestamp(),
      duration: elapsedTime || 0,
      token: null,
    });

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

  const roomName = `voice_${staffId}_${patientId}`;

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
            {formatTime(elapsedTime)}
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
          onConnected={(room) => {
            room?.localParticipant?.setMicrophoneEnabled(true);
          }}
          roomName={roomName}
        >
          <RoomAudioRenderer />
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
