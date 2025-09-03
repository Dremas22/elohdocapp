import { db } from "@/db/server";
import { stripe } from "../stripe-checkout/route";
import { findNearestAvailableDriver } from "@/helpers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { sessionId, tripData, userId } = body;

    if (!sessionId || !tripData || !userId) {
      return NextResponse.json(
        { error: "Missing sessionId, tripData, or userId" },
        { status: 400 }
      );
    }

    // 1️⃣ Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // 2️⃣ Save/Update trip in Firestore (trips/{userId})
    const tripRef = db.collection("trips").doc(userId);
    await tripRef.set(
      {
        ...tripData,
        status: "paid",
        paymentIntentId: session.payment_intent,
        paidAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // 3️⃣ Find & notify nearest driver
    const { pickupLocation } = tripData;
    await findNearestAvailableDriver(pickupLocation);

    return NextResponse.json({
      message: "Payment verified, trip saved, driver notified.",
    });
  } catch (err) {
    console.error("Confirm ambulance payment error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
