import { db, auth } from "@/db/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    // ✅ Get session cookie from Next.js cookies()
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Verify Firebase session cookie
    let decodedToken;
    try {
      decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    } catch (err) {
      console.error("Session verification failed:", err);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Explicit role whitelist (hard guard)
    const allowedRoles = ["doctor", "nurse"];
    if (!allowedRoles.includes(decodedToken.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Parse request body
    const { patientId, noteType } = await req.json();

    if (!patientId || !noteType) {
      return NextResponse.json(
        { error: "Missing patientId or noteType" },
        { status: 400 }
      );
    }

    // ✅ Fetch patient doc
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

    // ✅ Sort and return latest
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
}
