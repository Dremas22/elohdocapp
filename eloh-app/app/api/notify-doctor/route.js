import { NextResponse } from "next/server";
import { getMessaging } from "firebase-admin/messaging";
import { db } from "@/db/server";
import { getFCMToken } from "@/lib/getFCMToken";

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
    const nurseDoc = await db.collection("nurses").doc(doctorId).get();

    if (!doctorDoc.exists && !nurseDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use whichever one exists
    const userDoc = doctorDoc.exists ? doctorDoc : nurseDoc;
    const { fcmToken } = userDoc.data();

    if (!fcmToken) {
      return NextResponse.json(
        { error: "User has no FCM token" },
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

    const patientName = patientData?.fullName || "A patient";

    try {
      await getMessaging().send({
        token: fcmToken,
        notification: {
          title: "New Consultation Request",
          body: `${patientName} wants to start a video consultation.\nJoin here: ${process.env.NEXT_PUBLIC_URL}/room?staffId=${doctorId}&patientId=${patientId}`,
        },
        data: {
          roomId: doctorId,
          patientId,
        },
        webpush: {
          fcmOptions: {
            link: `${process.env.NEXT_PUBLIC_URL}/room?staffId=${doctorId}&patientId=${patientId}`,
          },
        },
      });
    } catch (error) {
      console.error("Error sending notification:", error);

      // Remove invalid tokens to prevent future errors
      if (
        error.code === "messaging/registration-token-not-registered" ||
        error.code === "messaging/invalid-registration-token"
      ) {
        // Step 1: Clear the old token in Firestore
        await driverDoc.ref.update({ fcmToken: null });

        // Step 2: Attempt to get a fresh token
        const newToken = await getFCMToken();

        // Step 3: Only update Firestore if we actually got a valid token
        if (newToken) {
          await driverDoc.ref.update({ fcmToken: newToken });
        } else {
          console.warn("Unable to retrieve a new FCM token.");
        }
      } else {
        throw error;
      }
    }

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
