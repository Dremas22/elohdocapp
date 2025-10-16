import { NextResponse } from "next/server";
import { db, auth } from "@/db/server";
import { ROLE_COLLECTION_MAP } from "@/constants";
import { cookies } from "next/headers";

// Helper to map role → collection name
function getUserCollection(role) {
  return ROLE_COLLECTION_MAP[role];
}

/**
 * PUT /api/appointments/[appointmentId]
 * Update appointment in both user's and other participant's subcollection
 */
export async function PUT(request, { params }) {
  try {
    const { appointmentId } = await params;

    // 🔹 Check session
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

    const updates = await request.json();
    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update." },
        { status: 400 }
      );
    }

    // 🔹 Reference to user's appointment doc
    const userDocRef = db
      .collection(userCollection)
      .doc(uid)
      .collection("appointments")
      .doc(appointmentId);

    const snapshot = await userDocRef.get();
    if (!snapshot.exists) {
      return NextResponse.json(
        { success: false, message: "Appointment not found." },
        { status: 404 }
      );
    }

    const appointmentData = snapshot.data();

    // 🔹 Update user's copy
    await userDocRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    // 🔹 Update mirrored appointment in the other participant's collection
    const { staffId, patientId } = appointmentData;

    try {
      if (role === "patient" && staffId) {
        // Patient editing -> update in staff’s collection
        const staffRefDoctor = db
          .collection("doctors")
          .doc(staffId)
          .collection("appointments")
          .where("patientId", "==", patientId)
          .where("date", "==", appointmentData.date);

        const staffRefNurse = db
          .collection("nurses")
          .doc(staffId)
          .collection("appointments")
          .where("patientId", "==", patientId)
          .where("date", "==", appointmentData.date);

        // try doctors first
        const staffSnapDoctor = await staffRefDoctor.get();
        if (!staffSnapDoctor.empty) {
          for (const doc of staffSnapDoctor.docs) {
            await doc.ref.update({ ...updates, updatedAt: new Date() });
          }
        } else {
          const staffSnapNurse = await staffRefNurse.get();
          for (const doc of staffSnapNurse.docs) {
            await doc.ref.update({ ...updates, updatedAt: new Date() });
          }
        }
      } else if (["doctor", "nurse"].includes(role) && patientId) {
        // Staff editing -> update in patient’s collection
        const patientRef = db
          .collection("patients")
          .doc(patientId)
          .collection("appointments")
          .where("staffId", "==", staffId)
          .where("date", "==", appointmentData.date);

        const patientSnap = await patientRef.get();
        for (const doc of patientSnap.docs) {
          await doc.ref.update({ ...updates, updatedAt: new Date() });
        }
      }
    } catch (syncErr) {
      console.warn("⚠️ Mirror update failed:", syncErr);
    }

    // Fetch updated doc
    const updatedSnap = await userDocRef.get();
    const updatedAppointment = { id: appointmentId, ...updatedSnap.data() };

    return NextResponse.json({
      success: true,
      authenticated: true,
      updatedAppointment,
    });
  } catch (error) {
    console.error("PUT /appointments/[appointmentId] error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments/[appointmentId]
 * Deletes appointment from both participants' subcollections
 */
export async function DELETE(request, { params }) {
  try {
    const { appointmentId } = await params;

    // 🔹 Check session
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

    // 🔹 Reference to user's appointment doc
    const userDocRef = db
      .collection(userCollection)
      .doc(uid)
      .collection("appointments")
      .doc(appointmentId);

    const snapshot = await userDocRef.get();
    if (!snapshot.exists) {
      return NextResponse.json(
        { success: false, message: "Appointment not found." },
        { status: 404 }
      );
    }

    const appointmentData = snapshot.data();
    const { staffId, patientId } = appointmentData;

    // 🔹 Delete user's own appointment
    await userDocRef.delete();

    // 🔹 Delete mirrored appointment in other participant's collection
    try {
      if (role === "patient" && staffId) {
        // Patient deleting -> delete staff's copy
        const staffCollection = ["doctors", "nurses"];
        for (const col of staffCollection) {
          const staffDocRef = db
            .collection(col)
            .doc(staffId)
            .collection("appointments")
            .doc(appointmentId);
          const staffSnap = await staffDocRef.get();
          if (staffSnap.exists) {
            await staffDocRef.delete();
            break; // stop after deleting the correct one
          }
        }
      } else if (["doctor", "nurse"].includes(role) && patientId) {
        // Staff deleting -> delete patient's copy
        const patientDocRef = db
          .collection("patients")
          .doc(patientId)
          .collection("appointments")
          .doc(appointmentId);
        const patientSnap = await patientDocRef.get();
        if (patientSnap.exists) {
          await patientDocRef.delete();
        }
      }
    } catch (cleanupError) {
      console.warn("⚠️ Mirror cleanup failed:", cleanupError);
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      message: "Appointment deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /appointments/[appointmentId] error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
