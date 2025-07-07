import { db } from "@/db/server";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const context = await params;

    const patientId = context.patientId;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const patientRef = db.collection("patients").doc(patientId);
    const patientSnap = await patientRef.get();

    if (!patientSnap.exists) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const patientData = patientSnap.data();

    return NextResponse.json(patientData, { status: 200 });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
