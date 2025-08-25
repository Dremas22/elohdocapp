/**
 * Sends a notification request to the specified doctor about a patient's consultation.
 * @param {string} doctorId - The ID of the doctor to notify
 * @param {string} patientId - The ID of the patient requesting consultation
 */
export const sendNotificationToDoctor = async (doctorId, patientId) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/notify-doctor`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, patientId }),
      }
    );

    if (!res.ok) throw new Error(data.error);
    const data = await res.json();

    const audio = new Audio("/ringtones/ringtone.mp3");
    audio.loop = true;
    audio.play().catch((err) => {
      console.log(err);
    });

    return audio;
  } catch (error) {
    console.error("Notification error:", error);
    alert("Failed to send notification.");
  }
};
