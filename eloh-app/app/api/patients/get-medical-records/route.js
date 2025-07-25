import { auth, db } from "@/db/server";
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
      decodedToken = await auth?.verifySessionCookie(token, true);
    } catch (err) {
      console.error("Session verification failed:", err);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { patientId } = await req.json();

    if (!patientId) {
      return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
    }

    // Get full patient document
    const patientDoc = await db?.collection("patients").doc(patientId).get();

    if (!patientDoc.exists) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const medicalHistory = patientDoc.data().medicalHistory || {};

    return NextResponse.json({ medicalHistory }, { status: 200 });
  } catch (error) {
    console.error("Error fetching full medical history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
