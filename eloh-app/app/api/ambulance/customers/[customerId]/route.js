import { db, auth } from "@/db/server";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const cookieToken = request.cookies.get("session")?.value;
    const headerToken = request.headers
      .get("authorization")
      ?.split("Bearer ")[1];
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth?.verifySessionCookie(token, true);

    const data = await request.json();
    const { routeData } = data;
    const { customerId } = params;

    if (!customerId || decodedToken.uid !== customerId || !routeData) {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 }
      );
    }

    // Fetch customer info
    const customerDoc = await db.collection("customers").doc(customerId).get();
    const customerData = customerDoc.exists ? customerDoc.data() : null;
    const customerName = customerData?.fullName || "Unknown";

    const tripRef = db.collection("trips").doc(customerId);
    const existingDoc = await tripRef.get();
    const isNew = !existingDoc.exists;

    const now = new Date();

    const payload = {
      ...routeData,
      customerId,
      customerName,
      ...(isNew ? { createdAt: now } : {}), // only set once
      updatedAt: now, // track updates
    };

    await tripRef.set(payload, { merge: true });

    return NextResponse.json(
      {
        isNew,
        routeData: payload,
        tripId: customerId, // always stable
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
