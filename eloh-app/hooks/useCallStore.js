"use client";
import { create } from "zustand";
import { doc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/db/client";

export const useCallStore = create((set, get) => {
  let router;

  return {
    incomingCall: null,
    ringtone: null,

    setRouter: (r) => {
      router = r; // set router from component
    },

    initCallListener: (currentUser, peerUser) => {
      if (!currentUser || !peerUser) return;

      let staffId, patientId;
      if (["doctor", "nurse"].includes(currentUser.role)) {
        staffId = currentUser.userId;
        patientId = peerUser.userId;
      } else {
        staffId = peerUser.userId;
        patientId = currentUser.userId;
      }

      const callId = `${staffId}_${patientId}`;
      const callDocRef = doc(db, "calls", callId);

      return onSnapshot(callDocRef, (snap) => {
        if (!snap.exists()) {
          set({ incomingCall: null });
          return;
        }

        const data = snap.data();

        // Only trigger ringtone if currentUser is the receiver
        if (
          data?.status === "ringing" &&
          data?.caller?.id !== currentUser.userId
        ) {
          if (!get().ringtone) {
            const audio = new Audio("/ringtones/ringtone.mp3");
            audio.loop = true;
            audio.play().catch(() => console.error("Autoplay blocked"));
            set({ ringtone: audio });
          }
          set({ incomingCall: { ...data, id: callId, staffId, patientId } });
        } else {
          if (get().ringtone) {
            get().ringtone.pause();
            get().ringtone.currentTime = 0;
            set({ ringtone: null });
          }
          set({ incomingCall: null });
        }
      });
    },

    acceptCall: async (callData) => {
      try {
        if (!callData?.id) return;
        const callRef = doc(db, "calls", callData.id);
        await updateDoc(callRef, { status: "accepted" });

        if (get().ringtone) {
          get().ringtone.pause();
          get().ringtone.currentTime = 0;
          set({ ringtone: null });
        }

        if (router) {
          router.push(
            `/room?staffId=${callData.staffId}&patientId=${callData.patientId}`
          );
        }
      } catch (err) {
        console.error("Error accepting call:", err);
      }
    },

    declineCall: async (callData) => {
      try {
        if (!callData?.id) return;
        const callRef = doc(db, "calls", callData.id);
        await updateDoc(callRef, { status: "declined" });
        await deleteDoc(callRef);

        if (get().ringtone) {
          get().ringtone.pause();
          get().ringtone.currentTime = 0;
          set({ ringtone: null });
        }
        set({ incomingCall: null });
      } catch (err) {
        console.error("Error declining call:", err);
      }
    },
  };
});
