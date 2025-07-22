import { NextResponse } from "next/server";
import { stripe } from "../stripe-checkout/route";
import { cookies } from "next/headers";
import { auth, db } from "@/db/server";

// Map price ID to consultations and type
const consultationMap = {
  price_1RnETc05W53pwfR7Ypa9CnER: { consultations: 1, type: "nurse" },
  price_1RnESz05W53pwfR7DozsskCR: { consultations: 2, type: "nurse" },
  price_1RnERg05W53pwfR7HYvsbXyo: { consultations: 3, type: "nurse" },
  price_1RnEVF05W53pwfR7E3oYmlLg: { consultations: 1, type: "doctor" },
  price_1RnEUm05W53pwfR7j5WbV4jI: { consultations: 2, type: "doctor" },
  price_1RnEUG05W53pwfR7O6LMhnzv: { consultations: 3, type: "doctor" },
};

export async function GET(req) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
  }

  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const authHeaderToken = req.headers.get("authorization")?.split("Bearer ")[1];
  const token = sessionCookie || authHeaderToken;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify Firebase session token
    const decodedToken = await auth?.verifySessionCookie(token, true);
    const userId = decodedToken.uid;

    // Fetch Firestore user document
    const userRef = db?.collection("patients").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: "User not found in Firestore" },
        { status: 404 }
      );
    }

    // Retrieve Stripe checkout session and expand line items
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price"],
    });

    const priceId = session?.line_items?.data?.[0]?.price?.id;

    const consultationData = consultationMap[priceId];

    if (!consultationData) {
      return NextResponse.json(
        { error: "Unknown price ID or consultation package" },
        { status: 400 }
      );
    }

    // Update user with consultation info
    await userRef.set(
      {
        numberOfConsultations: consultationData.consultations,
        consultationType: consultationData.type,
        lastPaymentDate: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      message: "Consultation package successfully applied.",
      ...consultationData,
    });
  } catch (error) {
    console.error("❌ Error applying consultation package:", error.message);
    return NextResponse.json(
      { error: "Failed to apply consultation package" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { sessionId } = await req.json();

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "line_items.data.price"],
    });

    const customerEmail = session.customer_email;
    const priceId = session.line_items.data[0].price.id;
    const { consultations, type } = consultationMap[priceId] || {};

    if (!consultations) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    const userSnapshot = await db
      ?.collection("patients")
      .where("email", "==", customerEmail)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userRef = userSnapshot.docs[0].ref;

    await userRef.set(
      {
        numberOfConsultations: consultations,
        consultationType: type,
        lastPaymentDate: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving payment:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
