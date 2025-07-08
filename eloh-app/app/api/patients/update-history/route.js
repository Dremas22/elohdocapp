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

    // 📨 Get request data
    const body = await request.json();
    const { patientId, roomID, notes } = body;

    if (!patientId || !roomID || typeof notes !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    // 🧠 Load doctor using roomID
    const doctorRef = db?.collection("doctors").doc(roomID);
    const doctorSnap = await doctorRef.get();

    if (!doctorSnap.exists) {
      return NextResponse.json(
        { error: "Doctor not found (invalid roomID)" },
        { status: 404 }
      );
    }

    const doctorData = doctorSnap.data();

    // ✅ Match roomID with authenticated UID
    if (doctorData.userId !== uid) {
      return NextResponse.json(
        { error: "Forbidden: Doctor authentication mismatch" },
        { status: 403 }
      );
    }

    // 📁 Get patient
    const patientRef = db?.collection("patients").doc(patientId);
    const patientSnap = await patientRef.get();

    if (!patientSnap.exists) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const patientData = patientSnap.data();
    const history = Array.isArray(patientData.medicalHistory)
      ? patientData.medicalHistory
      : [];

    // 📝 Create and append new note
    const newNote = {
      doctorName: doctorData.fullName || "Doctor",
      notes,
      createdAt: new Date(),
    };

    const updatedHistory = [...history, newNote];

    await patientRef.update({
      medicalHistory: updatedHistory,
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Note saved successfully",
        updatedHistory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
