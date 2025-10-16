import { NextResponse } from "next/server";
import { db, auth } from "@/db/server";
import { ROLE_COLLECTION_MAP } from "@/constants";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

// Map user role to Firestore collection
function getUserCollection(role) {
  return ROLE_COLLECTION_MAP[role];
}

// GET: Fetch appointments and related users (patients or staff)
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

    let relatedUsers = [];

    if (["doctor", "nurse"].includes(role)) {
      // Fetch all patients for doctors/nurses
      const patientsSnapshot = await db.collection("patients").get();
      relatedUsers = patientsSnapshot.docs.map((doc) => ({
        userId: doc.id,
        ...doc.data(),
      }));
    } else if (role === "patient") {
      // Fetch all doctors & nurses for patients
      const doctorsSnapshot = await db.collection("doctors").get();
      const nursesSnapshot = await db.collection("nurses").get();

      const doctors = doctorsSnapshot.docs.map((doc) => ({
        userId: doc.id,
        ...doc.data(),
      }));

      const nurses = nursesSnapshot.docs.map((doc) => ({
        userId: doc.id,
        ...doc.data(),
      }));

      relatedUsers = [...doctors, ...nurses];
    }

    return NextResponse.json(
      {
        authenticated: true,
        appointments,
        relatedUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /appointments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new appointment
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
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
      meetingLink,
      staffName,
      patientName,
      staffId,
    } = body;

    if (!date || !time || !patientName || !patientId || !staffId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: date, time, patientId, staffId, or names",
        },
        { status: 400 }
      );
    }

    const appointmentId = uuidv4();

    const newAppointment = {
      id: appointmentId,
      date,
      time,
      note: note || "",
      targetRole,
      createdAt: new Date(),
      patientId,
      staffId,
      meetingLink,
      staffName,
      patientName,
      createdBy: uid,
    };

    // Save appointment under current user
    await db
      .collection(userCollection)
      .doc(uid)
      .collection("appointments")
      .doc(appointmentId)
      .set(newAppointment);
    // Save appointment under the other participant
    if (role === "patient") {
      // Try doctor first, fallback to nurse
      const staffCollection = await db.collection("doctors").doc(staffId).get();
      if (staffCollection.exists) {
        await db
          .collection("doctors")
          .doc(staffId)
          .collection("appointments")
          .doc(appointmentId)
          .set(newAppointment);
      } else {
        await db
          .collection("nurses")
          .doc(staffId)
          .collection("appointments")
          .doc(appointmentId)
          .set(newAppointment);
      }
    } else {
      await db
        .collection("patients")
        .doc(patientId)
        .collection("appointments")
        .doc(appointmentId)
        .set(newAppointment);
    }

    return NextResponse.json(
      { success: true, appointment: newAppointment },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /appointments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
