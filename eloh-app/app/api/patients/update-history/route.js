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

    const body = await request.json();
    const { patientId, roomID, noteType, noteContent } = body;

    // ✅ Basic field validation
    if (!patientId || !roomID || !noteType || !noteContent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Optional: Validate type
    const isValidContent =
      typeof noteContent === "string"
        ? noteContent.trim() !== ""
        : typeof noteContent === "object" &&
          Object.keys(noteContent).length > 0;

    if (!isValidContent) {
      return NextResponse.json(
        { error: "Invalid or empty note content" },
        { status: 400 }
      );
    }

    // 🔍 Verify doctor
    const doctorRef = db?.collection("doctors").doc(roomID);
    const doctorSnap = await doctorRef.get();

    if (!doctorSnap.exists) {
      return NextResponse.json(
        { error: "Doctor not found (invalid roomID)" },
        { status: 404 }
      );
    }

    const doctorData = doctorSnap.data();

    if (doctorData.userId !== uid) {
      return NextResponse.json(
        { error: "Forbidden: Doctor authentication mismatch" },
        { status: 403 }
      );
    }

    // 🔍 Verify patient
    const patientRef = db?.collection("patients").doc(patientId);
    const patientSnap = await patientRef.get();

    if (!patientSnap.exists) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const patientData = patientSnap.data();
    const history =
      typeof patientData.medicalHistory === "object" &&
      patientData.medicalHistory !== null
        ? patientData.medicalHistory
        : {};

    // 📝 Build new note (string or object)
    const newNote = {
      doctorName: doctorData.fullName,
      doctorEmail: doctorData.email,
      phoneNumber: doctorData.phoneNumber,
      content: noteContent,
      createdAt: new Date(),
    };

    // 📁 Append note to proper category
    const category = Array.isArray(history[noteType]) ? history[noteType] : [];

    const updatedCategory = [...category, newNote];

    const updatedHistory = {
      ...history,
      [noteType]: updatedCategory,
    };

    // 🔄 Save update
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
