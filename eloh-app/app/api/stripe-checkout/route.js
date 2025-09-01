import { NextResponse } from "next/server";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { priceId, customerEmail, type, role } = body;

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Missing customer email" },
        { status: 400 }
      );
    }

    let line_items = [];

    if (priceId) {
      // 🔹 Mode 1: Existing flow using a saved Stripe priceId
      line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
    } else if (type === "ambulance_request") {
      // 🔹 Mode 2: Dynamic ambulance payment
      const { fare, hospital, pickupLocation, role } = body;

      if (!fare || !hospital || !pickupLocation || !role) {
        return NextResponse.json(
          { error: "Missing ambulance trip details" },
          { status: 400 }
        );
      }

      line_items = [
        {
          price_data: {
            currency: "zar",
            product_data: {
              name: `Ambulance to ${
                hospital?.destination?.address || "Hospital"
              }`,
              description: `Pickup: ${pickupLocation?.address || "Unknown"}`,
            },
            unit_amount: Math.round(fare * 100), // Stripe needs cents
          },
          quantity: 1,
        },
      ];
    } else {
      return NextResponse.json(
        { error: "Invalid payment parameters" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      customer_email: customerEmail,
      success_url: `${
        process.env.NEXT_PUBLIC_URL
      }/dashboard/${role}?session_id={CHECKOUT_SESSION_ID}&type=${
        type || "default"
      }`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}`,
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
