import { auth } from "@/db/client";

/**
 * Handles end of a meeting:
 * - Decrements the patient's consultation count
 * - Increments the staff's earnings and consultation count
 *
 * @param {string} patientId - ID of the patient
 * @param {string} doctorId - ID of the doctor/nurse (staff)
 */
export async function handleMeetingEnd(staffId, patientId) {
  try {
    const user = auth.currentUser;
    const token = await user?.getIdToken();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/end-consultation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, staffId, patientId }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("API error:", data.error || res.statusText);
      return null;
    }

    return data.staffRole;
  } catch (err) {
    console.error("Error in handleMeetingEnd:", err);
    return null;
  }
}

export default handleMeetingEnd;
