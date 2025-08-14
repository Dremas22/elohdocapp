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
    const { customerId } = await params;

    if (!customerId || decodedToken.uid !== customerId || !routeData) {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 }
      );
    }

    const routesRef = db
      ?.collection("customers")
      .doc(customerId)
      .collection("routes");

    const destinationLat = routeData.destination.lat.toFixed(5);
    const destinationLng = routeData.destination.lng.toFixed(5);

    const snapshot = await routesRef.get();

    for (const doc of snapshot.docs) {
      const existing = doc.data();
      const existingLat = existing.destination?.lat?.toFixed(5);
      const existingLng = existing.destination?.lng?.toFixed(5);

      if (existingLat === destinationLat && existingLng === destinationLng) {
        return NextResponse.json({
          isNew: false,
          routeData: existing,
          routeId: doc.id,
        });
      }
    }

    const newDocRef = await routesRef.add({
      ...routeData,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        isNew: true,
        routeData,
        routeId: newDocRef.id,
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

export async function DELETE(request, { params }) {
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
    const { routeId } = data;
    const { customerId } = await params;

    if (!customerId || !routeId || decodedToken.uid !== customerId) {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 }
      );
    }

    const routeDocRef = db
      .collection("customers")
      .doc(customerId)
      .collection("routes")
      .doc(routeId);
    await routeDocRef.delete();

    return NextResponse.json(
      { message: `Route ${routeId} successfully deleted` },
      { status: 200 }
    );
  } catch (error) {
    console.error("API DELETE Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
