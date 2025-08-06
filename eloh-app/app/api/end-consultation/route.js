import { STAFF_EARNING_PER_CONSULTATION } from "@/constants";
import { auth, db } from "@/db/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { token, staffId, patientId } = await req.json();

    if (!token || !staffId || !patientId) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const decodedToken = await auth?.verifyIdToken(token);

    if (decodedToken.role !== "patient") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    // doc(db, , staffId)
    // Staff doc refs for doctors and nurses
    let staffRef = db?.collection("doctors").doc(staffId);
    let staffSnap = await staffRef.get();

    let staffRole = "doctor";

    if (!staffSnap.exists) {
      staffRef = db?.collection("nurses").doc(staffId);
      staffSnap = await staffRef.get();
      staffRole = "nurse";
    }

    if (!staffSnap.exists) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const staffData = staffSnap?.data();

    // Update staff earnings and consultations
    await staffRef?.update({
      earnings: (staffData.earnings || 0) + STAFF_EARNING_PER_CONSULTATION,
      numberOfConsultations: (staffData.numberOfConsultations || 0) + 1,
      earningsUpdatedAt: new Date(),
    });

    // Fetch patient doc
    const patientRef = db?.collection("patients").doc(patientId);
    const patientSnap = await patientRef.get();

    if (!patientSnap.exists) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const patientData = patientSnap.data();

    const consultations = {
      doctor: patientData.consultations?.doctor || 0,
      nurse: patientData.consultations?.nurse || 0,
    };

    if (consultations[staffRole] <= 0) {
      return NextResponse.json(
        { error: `No remaining ${staffRole} consultations for patient.` },
        { status: 400 }
      );
    }

    // Decrement consultation count for relevant role
    consultations[staffRole] -= 1;

    // Adjust consultationType if needed
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

    // Update patient consultations & consultationType
    await patientRef.update({
      consultations,
      consultationType,
      lastConsultationDecrementedAt: new Date(),
    });

    return NextResponse.json({ success: true, staffRole });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
