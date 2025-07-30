import { doc, getDoc, updateDoc, increment, setDoc } from "firebase/firestore";
import { db } from "@/db/client";
import { PLATFORM_FEE, STAFF_EARNING_PER_CONSULTATION } from "@/constants";

/**
 * Handles end of a meeting:
 * - Decrements the patient's consultation count
 * - Increments the staff's earnings and consultation count
 *
 * @param {string} patientId - ID of the patient
 * @param {string} doctorId - ID of the doctor/nurse (staff)
 */
async function handleMeetingEnd(patientId, doctorId) {
  if (!patientId || !doctorId) {
    console.warn("Missing patientId or doctorId.");
    return;
  }

  const doctorRef = doc(db, "doctors", doctorId);
  const nurseRef = doc(db, "nurses", doctorId);

  const [doctorSnap, nurseSnap] = await Promise.all([
    getDoc(doctorRef),
    getDoc(nurseRef),
  ]);

  let staffRef;
  let staffRole;
  let staffSnap;

  if (doctorSnap.exists()) {
    staffRef = doctorRef;
    staffSnap = doctorSnap;
    staffRole = "doctor";
  } else if (nurseSnap.exists()) {
    staffRef = nurseRef;
    staffSnap = nurseSnap;
    staffRole = "nurse";
  } else {
    console.warn(`Staff ${doctorId} not found in doctors or nurses.`);
    return;
  }

  // 1. Fetch patient document
  const patientRef = doc(db, "patients", patientId);
  const patientSnap = await getDoc(patientRef);
  if (!patientSnap.exists()) {
    console.warn(`Patient ${patientId} not found.`);
    return;
  }

  const patientData = patientSnap.data();
  const consultations = {
    doctor: patientData.consultations?.doctor || 0,
    nurse: patientData.consultations?.nurse || 0,
  };

  if (consultations[staffRole] <= 0) {
    console.warn(
      `No remaining ${staffRole} consultations for patient ${patientId}.`
    );
    return;
  }

  // 2. Decrement consultation count
  consultations[staffRole] -= 1;

  // If one role's consultations is now 0, update consultationType
  let consultationType = patientData.consultationType || "all";
  if (
    consultationType === "all" &&
    consultations.doctor === 0 &&
    consultations.nurse > 0
  ) {
    consultationType = "nurse";
  } else if (
    consultationType === "all" &&
    consultations.nurse === 0 &&
    consultations.doctor > 0
  ) {
    consultationType = "doctor";
  }

  await updateDoc(patientRef, {
    consultations,
    consultationType,
  });

  // 3. Ensure required staff fields exist before using increment
  const staffData = staffSnap.data();
  const initialData = {};

  if (typeof staffData.earnings !== "number") {
    initialData.earnings = 0;
  }
  if (typeof staffData.numberOfConsultations !== "number") {
    initialData.numberOfConsultations = 0;
  }
  if (typeof staffData.totalPlatformFees !== "number") {
    initialData.totalPlatformFees = 0;
  }

  if (Object.keys(initialData).length > 0) {
    await setDoc(staffRef, initialData, { merge: true });
  }

  const updatedData = {
    earnings: increment(STAFF_EARNING_PER_CONSULTATION),
    numberOfConsultations: increment(1),
    earningsUpdatedAt: new Date(),
    totalPlatformFees: increment(PLATFORM_FEE),
  };

  await updateDoc(staffRef, updatedData);

  console.log(
    `✅ Updated patient ${patientId} and ${staffRole} ${doctorId}: -1 consultation, +R${STAFF_EARNING_PER_CONSULTATION} earnings, +1 consultation count.`
  );

  return staffRole;
}

export default handleMeetingEnd;
