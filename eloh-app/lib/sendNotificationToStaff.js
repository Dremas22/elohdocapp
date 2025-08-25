import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/db/client";

export const sendNotificationToDoctor = async (
  doctorId,
  patientId,
  payload = {}
) => {
  try {
    // Trigger server-side push notification
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/notify-doctor`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, patientId, ...payload }),
      }
    );

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to send notification");
    }

    if (payload.caller) {
      const callId = `${doctorId}_${patientId}`;
      await setDoc(doc(db, "calls", callId), {
        type: "video-call",
        status: "ringing",
        doctorId,
        patientId,
        caller: {
          id: payload.caller.id,
          name: payload.caller.name,
          photoUrl: payload.caller.photoUrl || "/images/default_avatar.jpg",
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Notification error:", error);
  }
};
