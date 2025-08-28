"use client";

import { create } from "zustand";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/db/client";

export const useCallStore = create((set, get) => ({
  incomingCall: null,
  ringtone: null,
  router: null,

  setRouter: (router) => set({ router }),

  initCallListener: (currentUser) => {
    if (!currentUser) return;

    const callsQuery = query(
      collection(db, "calls"),
      where("status", "==", "ringing")
    );

    const unsubscribe = onSnapshot(callsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        const callId = change.doc.id;

        // Ignore calls made by this user
        if (
          data.caller?.patientId === currentUser.userId ||
          data.caller?.staffId === currentUser.userId
        )
          return;

        // Only trigger if currentUser is a participant
        const { staffId, patientId } = data;
        if (staffId !== currentUser.userId && patientId !== currentUser.userId)
          return;

        // Determine the other party
        const otherUserId =
          staffId === currentUser.userId ? patientId : staffId;

        // Play ringtone if not already
        if (!get().ringtone) {
          const audio = new Audio("/ringtones/ringtone.mp3");
          audio.loop = true;
          audio.play().catch(() => console.error("Autoplay blocked"));
          set({ ringtone: audio });
        }

        set({
          incomingCall: { ...data, id: callId, otherUserId },
        });
      });
    });

    return unsubscribe;
  },

  acceptCall: async (call) => {
    if (!call) return;

    await updateDoc(doc(db, "calls", call.id), {
      status: "accepted",
      updatedAt: serverTimestamp(),
    });

    if (get().ringtone) {
      get().ringtone.pause();
      get().ringtone.currentTime = 0;
      set({ ringtone: null });
    }

    const { router } = get();
    if (router) {
      router.push(`/room?staffId=${call.staffId}&patientId=${call.patientId}`);
    }

    set({ incomingCall: null });
  },

  declineCall: async (call) => {
    if (!call) return;

    await updateDoc(doc(db, "calls", call.id), {
      status: "declined",
      updatedAt: serverTimestamp(),
    });

    if (get().ringtone) {
      get().ringtone.pause();
      get().ringtone.currentTime = 0;
      set({ ringtone: null });
    }

    set({ incomingCall: null });
  },
}));
