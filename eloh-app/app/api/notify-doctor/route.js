import { NextResponse } from "next/server";
import { getMessaging } from "firebase-admin/messaging";
import { db } from "@/db/server";

export async function POST(req) {
  try {
    const { doctorId, patientId } = await req.json();

    if (!doctorId || !patientId) {
      return NextResponse.json(
        { error: "Missing doctorId or patientId" },
        { status: 400 }
      );
    }

    const doctorDoc = await db.collection("doctors").doc(doctorId).get();
    if (!doctorDoc.exists) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const { fcmToken } = doctorDoc.data();
    if (!fcmToken) {
      return NextResponse.json(
        { error: "Doctor has no FCM token" },
        { status: 400 }
      );
    }

    const patientDoc = await db.collection("patients").doc(patientId).get();
    if (!patientDoc.exists) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const rawPatientData = patientDoc.data();
    const patientData = {
      ...rawPatientData,
      createdAt: rawPatientData.createdAt?.toDate().toISOString() || null,
      updatedAt: rawPatientData.updatedAt?.toDate().toISOString() || null,
    };

    const patientName = patientData.fullName || "A patient";

    await getMessaging().send({
      token: fcmToken,
      notification: {
        title: "New Consultation Request",
        body: `${patientName} wants to start a video consultation.`,
      },
      data: {
        roomId: doctorId,
        patientId,
      },
      webpush: {
        fcmOptions: {
          link: `${process.env.NEXT_PUBLIC_URL}/room/${doctorId}`,
        },
      },
    });

    return NextResponse.json(
      { message: "Notification sent", patient: patientData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
