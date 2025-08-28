import { NextResponse } from "next/server";
import { db, auth } from "@/db/server";
import { ROLE_COLLECTION_MAP } from "@/constants";

// Map user role to Firestore collection
function getUserCollection(role) {
  return ROLE_COLLECTION_MAP[role];
}

export async function GET(request) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;
    const role = decoded.role;
    const userCollection = getUserCollection(role);

    if (!userCollection) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get current user's appointments
    const appointmentsRef = db
      .collection(userCollection)
      .doc(uid)
      .collection("appointments");
    const snapshot = await appointmentsRef.orderBy("date", "asc").get();

    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    let patients = [];
    // If doctor/nurse, fetch all patients
    if (["doctor", "nurse"].includes(role)) {
      const patientsRef = db?.collection("patients");
      const patientsSnapshot = await patientsRef.get();
      patients = patientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    return NextResponse.json(
      { authenticated: true, appointments, patients },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /appointments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST a new appointment for the current user
export async function POST(request) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;
    const role = decoded.role;
    const userCollection = getUserCollection(role);
    if (!userCollection) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const body = await request.json();
    const {
      date,
      time,
      note,
      targetRole,
      patientId,
      link,
      staffName,
      patientName,
    } = body;

    if (!date || !time || !patientName || !patientId) {
      return NextResponse.json(
        { error: "Date , time , PatientId & patientName are required" },
        { status: 400 }
      );
    }

    const newAppointment = {
      date,
      time,
      note: note || "",
      targetRole,
      createdAt: new Date(),
      patientId,
      meetingLink: link,
      userId: uid,
      staffName,
      patientName,
    };

    await db
      .collection(userCollection)
      .doc(uid)
      .collection("appointments")
      .add(newAppointment);

    await db
      ?.collection("patients")
      .doc(patientId)
      .collection("appointments")
      .add(newAppointment);

    return NextResponse.json(
      { success: true, appointment: newAppointment },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /appointments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
