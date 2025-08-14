import { NextResponse } from "next/server";
import { getMessaging } from "firebase-admin/messaging";
import { db } from "@/db/server";
import { getFCMToken } from "@/lib/getFCMToken";

export async function POST(req) {
  try {
    const { driverId, tripDetails, customerId } = await req.json();

    if (!driverId || !tripDetails) {
      return NextResponse.json(
        { error: "Missing driverId or tripDetails" },
        { status: 400 }
      );
    }

    const driverDoc = await db.collection("drivers").doc(driverId).get();
    if (!driverDoc.exists) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const { fcmToken } = driverDoc.data();
    if (!fcmToken) {
      return NextResponse.json(
        { error: "Driver has no FCM token" },
        { status: 400 }
      );
    }

    let customerName = "A customer";
    if (customerId) {
      const customerDoc = await db
        .collection("customers")
        .doc(customerId)
        .get();
      if (customerDoc.exists) {
        customerName = customerDoc.data()?.fullName || customerName;
      }
    }

    // Send FCM notification
    try {
      await getMessaging().send({
        token: fcmToken,
        data: {
          customerName,
          type: "ambulance_request",
          title: `New Ambulance Request from ${customerName}`,
          body: `Pickup: ${tripDetails.pickupAddress || "Unknown"}`,
          pickupAddress: tripDetails.pickupAddress || "Unknown",
          fare: String(tripDetails.fare || 0),
          distance: String(tripDetails.distance || "0"),
          duration: String(tripDetails.duration || "0"),
          pickupLat: String(tripDetails.pickupLocation.lat || ""),
          pickupLng: String(tripDetails.pickupLocation.lng || ""),
          tripId: tripDetails.tripId || "",
          link: `${process.env.NEXT_PUBLIC_URL}/dashboard/driver`,
        },
        webpush: {
          fcmOptions: {
            link: `${process.env.NEXT_PUBLIC_URL}/dashboard/driver`,
          },
        },
      });
    } catch (error) {
      console.error("Error sending driver notification:", error);

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
      { message: "Notification sent to driver", tripDetails },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/send-ambulance-notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
