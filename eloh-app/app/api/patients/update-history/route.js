import { auth, db } from "@/db/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await auth?.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    // 🔍 Check if the user is a doctor
    const doctorRef = db?.collection("doctors").doc(uid);
    const doctorSnap = await doctorRef.get();

    if (!doctorSnap.exists) {
      return NextResponse.json(
        { error: "Forbidden: Only doctors can update patient history" },
        { status: 403 }
      );
    }

    // 📦 Get and validate body
    const body = await request.json();
    const { patientId, medicalHistory } = body;

    if (!patientId || typeof medicalHistory !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    const patientRef = db?.collection("patients").doc(patientId);
    const patientSnap = await patientRef.get();

    if (!patientSnap.exists) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // 📝 Update patient
    await patientRef.update({
      medicalHistory,
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "Medical history updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
