import { NextResponse } from "next/server";
import { stripe } from "../stripe-checkout/route";
import { cookies } from "next/headers";
import { auth, db } from "@/db/server";

// Price ID map
const consultationMap = {
  price_1RnETc05W53pwfR7Ypa9CnER: { consultations: 1, type: "nurse" },
  price_1RnESz05W53pwfR7DozsskCR: { consultations: 2, type: "nurse" },
  price_1RnERg05W53pwfR7HYvsbXyo: { consultations: 3, type: "nurse" },
  price_1RnEVF05W53pwfR7E3oYmlLg: { consultations: 1, type: "doctor" },
  price_1RnEUm05W53pwfR7j5WbV4jI: { consultations: 2, type: "doctor" },
  price_1RnEUG05W53pwfR7O6LMhnzv: { consultations: 3, type: "doctor" },
};

function mergeConsultations(existing = {}, incomingType, amount) {
  return {
    doctor:
      incomingType === "doctor"
        ? (existing.doctor || 0) + amount
        : existing.doctor || 0,
    nurse:
      incomingType === "nurse"
        ? (existing.nurse || 0) + amount
        : existing.nurse || 0,
  };
}

// ✅ GET Handler
export async function GET(req) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId)
    return NextResponse.json({ error: "Missing session ID" }, { status: 400 });

  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const authHeaderToken = req.headers.get("authorization")?.split("Bearer ")[1];
  const token = sessionCookie || authHeaderToken;

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decodedToken = await auth.verifySessionCookie(token, true);
    const userId = decodedToken.uid;

    const userRef = db.collection("patients").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price"],
    });

    const priceId = session?.line_items?.data?.[0]?.price?.id;
    const consultationData = consultationMap[priceId];

    if (!consultationData) {
      return NextResponse.json({ error: "Unknown price ID" }, { status: 400 });
    }

    const userData = userSnap.data();
    const existingType = userData.consultationType;
    const existingConsultations = userData.consultations || {
      doctor: 0,
      nurse: 0,
    };

    // ✅ Check if this session was already processed
    if (userData.lastProcessedSessionId === sessionId) {
      return NextResponse.json({
        success: true,
        message: "This session has already been processed.",
      });
    }

    const updatedConsultations = mergeConsultations(
      existingConsultations,
      consultationData.type,
      consultationData.consultations
    );

    let newType;
    if (updatedConsultations.doctor === 0 && updatedConsultations.nurse === 0) {
      newType = "none";
    } else if (
      !existingType ||
      existingType === consultationData.type ||
      existingType === "none"
    ) {
      newType = consultationData.type;
    } else {
      newType = "all";
    }

    const updates = {
      consultationType: newType,
      consultations: updatedConsultations,
      lastPaymentDate: new Date().toISOString(),
      priceId,
      lastProcessedSessionId: sessionId,
    };

    await userRef.set(updates, { merge: true });

    return NextResponse.json({
      message: "Consultation package applied.",
      ...updates,
    });
  } catch (error) {
    console.error("❌ GET error:", error.message);
    return NextResponse.json(
      { error: "Failed to apply package" },
      { status: 500 }
    );
  }
}

// ✅ POST Handler
export async function POST(req) {
  try {
    const { sessionId } = await req.json();

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "line_items.data.price"],
    });

    const customerEmail = session.customer_email;
    const priceId = session.line_items.data[0].price.id;
    const consultationData = consultationMap[priceId];

    if (!consultationData) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    const userSnapshot = await db
      .collection("patients")
      .where("email", "==", customerEmail)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userRef = userDoc.ref;

    // ✅ Prevent double processing
    if (userData.lastProcessedSessionId === sessionId) {
      return NextResponse.json({
        success: true,
        message: "Session already processed.",
      });
    }

    const existingType = userData.consultationType;
    const existingConsultations = userData.consultations || {
      doctor: 0,
      nurse: 0,
    };

    const updatedConsultations = mergeConsultations(
      existingConsultations,
      consultationData.type,
      consultationData.consultations
    );

    let newType;
    if (updatedConsultations.doctor === 0 && updatedConsultations.nurse === 0) {
      newType = "none";
    } else if (
      !existingType ||
      existingType === consultationData.type ||
      existingType === "none"
    ) {
      newType = consultationData.type;
    } else {
      newType = "all";
    }

    const updates = {
      consultationType: newType,
      consultations: updatedConsultations,
      lastPaymentDate: new Date().toISOString(),
      lastProcessedSessionId: sessionId, // ✅ Add this line
    };

    // ✅ Maintain priceIds array only for doctor/nurse (not 'all')
    if (newType !== "all") {
      const existingPriceIds = Array.isArray(userData.priceIds)
        ? userData.priceIds
        : [];

      if (!existingPriceIds.includes(priceId)) {
        updates.priceIds = [...existingPriceIds, priceId];
      }
    }

    await userRef.set(updates, { merge: true });

    return NextResponse.json({ success: true, ...updates });
  } catch (error) {
    console.error("❌ POST error:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
