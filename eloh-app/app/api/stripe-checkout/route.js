import { NextResponse } from "next/server";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(req) {
  try {
    const { priceId, customerEmail } = await req.json();

    if (!priceId || !customerEmail) {
      return NextResponse.json(
        { error: "Missing price ID or email" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/patient?session_id={CHECKOUT_SESSION_ID}`,
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
