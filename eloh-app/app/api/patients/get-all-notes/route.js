import { db, auth } from "@/db/server";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    // Get token from cookies or Authorization header
    const cookieToken = req.cookies.get("session")?.value;
    const headerToken = req.headers.get("authorization")?.split("Bearer ")[1];
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Firebase session
    let decodedToken;
    try {
      decodedToken = await auth.verifySessionCookie(token, true);
    } catch (err) {
      console.error("Session verification failed:", err);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: Check for doctor role
    if (decodedToken.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const { patientId } = await req.json();

    if (!patientId) {
      return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
    }

    // Get patient document
    const patientDoc = await db.collection("patients").doc(patientId).get();

    if (!patientDoc.exists) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const medicalHistory = patientDoc.data().medicalHistory || {};

    // Define allowed note types
    const noteTypes = ["sickNotes", "prescriptions", "generalNotes"];
    const allNotes = {};

    noteTypes.forEach((type) => {
      allNotes[type] = Array.isArray(medicalHistory[type])
        ? medicalHistory[type]
        : [];
    });

    return NextResponse.json({ notes: allNotes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
