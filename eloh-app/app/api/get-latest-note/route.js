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

    // For example, check if the user is a doctor
    if (decodedToken.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const { patientId, noteType } = await req.json();

    if (!patientId || !noteType) {
      return NextResponse.json(
        { error: "Missing patientId or noteType" },
        { status: 400 }
      );
    }

    // Get patient document
    const patientDoc = await db.collection("patients").doc(patientId).get();

    if (!patientDoc.exists) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const medicalHistory = patientDoc.data().medicalHistory;

    if (!medicalHistory || !Array.isArray(medicalHistory[noteType])) {
      return NextResponse.json(
        { error: `No ${noteType} found` },
        { status: 404 }
      );
    }

    const notes = medicalHistory[noteType];

    if (notes.length === 0) {
      return NextResponse.json(
        { message: `No ${noteType} found` },
        { status: 404 }
      );
    }

    // Sort by createdAt (descending) and get the latest
    const latest = notes
      .filter((n) => n.createdAt)
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0];

    return NextResponse.json({ note: latest }, { status: 200 });
  } catch (error) {
    console.error("Error fetching latest note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
