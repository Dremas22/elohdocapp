import { db } from "@/db/server";
import { stripe } from "../stripe-checkout/route";
import { NextResponse } from "next/server";
import { findNearestAvailableDriverServer } from "@/lib/server-actions";

export async function POST(req) {
  try {
    const { sessionId, tripData, userId } = await req.json();

    if (!sessionId || !tripData || !userId) {
      return NextResponse.json(
        { error: "Missing sessionId, tripData, or userId" },
        { status: 400 }
      );
    }

    if (!tripData.customerId) {
      return NextResponse.json(
        { error: "Missing tripData.customerId" },
        { status: 400 }
      );
    }

    // 1️⃣ Verify Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // 2️⃣ Find nearest driver
    const { pickupLocation } = tripData;
    const nearestDriver = await findNearestAvailableDriverServer(
      pickupLocation
    );

    console.log(nearestDriver, "NEAREST_DRIVER", pickupLocation);

    // 3️⃣ Save trip with driverId
    const tripRef = db?.collection("trips").doc(tripData.customerId);
    await tripRef.set(
      {
        ...tripData,
        userId,
        driverId: nearestDriver?.userId || nearestDriver?.id || null,
        status: "paid",
        isPaid: true,
        paymentIntentId: session.payment_intent,
        paidAt: new Date(),
        createdAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({
      message: "Payment verified, trip saved, driver notified.",
      tripId: tripData.customerId,
      driver: nearestDriver,
    });
  } catch (err) {
    console.error("Confirm ambulance payment error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
