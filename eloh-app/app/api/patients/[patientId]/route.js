import { db } from "@/db/server";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { patientId } = params;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Fetch patient doc
    const patientRef = db.collection("patients").doc(patientId);
    const patientSnap = await patientRef.get();

    if (!patientSnap.exists) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const patientData = patientSnap.data();

    // Fetch appointments subcollection
    const appointmentsRef = patientRef.collection("appointments");
    const appointmentsSnap = await appointmentsRef.orderBy("date", "asc").get();

    const appointments = appointmentsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Merge into patientData
    const fullPatientData = {
      id: patientSnap.id,
      ...patientData,
      appointments,
    };

    return NextResponse.json({ patientData: fullPatientData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
