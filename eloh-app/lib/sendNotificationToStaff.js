import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/db/client";

/**
 * Sends a push notification to a doctor and optionally creates a call record in Firestore.
 *
 * Workflow:
 * 1. Makes a POST request to the `/api/notify-doctor` endpoint with doctor and patient IDs,
 *    plus any additional payload data.
 * 2. If the response is not OK, throws an error with the returned error message.
 * 3. If the payload includes a `caller` object, creates a `calls/{doctorId}_{patientId}` document
 *    in Firestore to represent an active ringing call.
 *
 * Firestore call document structure:
 * {
 *   type: "video" | "voice",
 *   status: "ringing",
 *   doctorId: string,
 *   patientId: string,
 *   caller: {
 *     id: string,
 *     name: string,
 *     photoURL: string
 *   },
 *   token?: string, // for voice calls
 *   createdAt: serverTimestamp(),
 *   updatedAt: serverTimestamp()
 * }
 *
 * @param {string} doctorId - The ID of the doctor to notify.
 * @param {string} patientId - The ID of the patient initiating the action.
 * @param {Object} [payload={}] - Additional data to send with the notification.
 * @param {Object} [payload.caller] - Caller information (required if initiating a call).
 * @param {string} payload.caller.id - Caller user ID.
 * @param {string} payload.caller.name - Caller display name.
 * @param {string} [payload.caller.photoUrl='/images/default_avatar.jpg'] - Caller profile picture URL.
 * @param {"video"|"voice"} [payload.type] - The type of the call.
 * @param {string} [payload.token] - Token for voice calls.
 *
 * @returns {Promise<void>} Resolves when the notification is sent (and Firestore updated if applicable).
 */

export const sendNotificationToDoctor = async (
  doctorId,
  patientId,
  payload
) => {
  if (!payload) return;
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

    if (payload && payload.caller) {
      const callId = `${doctorId}_${patientId}`;
      await setDoc(doc(db, "calls", callId), {
        type: payload.type,
        token: payload.token || null,
        status: "ringing",
        doctorId,
        patientId,
        caller: {
          id: payload.caller.id,
          name: payload.caller.name,
          photoUrl: payload.caller.photoUrl || "/images/default_avatar.jpg",
        },
        duration: payload.duration,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Notification error:", error);
  }
};
