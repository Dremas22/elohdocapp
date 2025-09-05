import { db, auth } from "@/db/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const cookieToken = request.cookies.get("session")?.value;
    const headerToken = request.headers
      .get("authorization")
      ?.split("Bearer ")[1];
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifySessionCookie(token, true);

    const { routeData, driverId } = await request.json();

    if (!driverId || !routeData) {
      return NextResponse.json(
        { error: "Missing driverId or routeData" },
        { status: 400 }
      );
    }

    const originLat = routeData.origin?.lat;
    const originLng = routeData.origin?.lng;
    const destLat = routeData.destination?.lat;
    const destLng = routeData.destination?.lng;

    if (
      originLat == null ||
      originLng == null ||
      destLat == null ||
      destLng == null
    ) {
      return NextResponse.json(
        { error: "Origin or destination coordinates missing" },
        { status: 400 }
      );
    }

    const originLatFixed = Number(originLat.toFixed(5));
    const originLngFixed = Number(originLng.toFixed(5));
    const destLatFixed = Number(destLat.toFixed(5));
    const destLngFixed = Number(destLng.toFixed(5));

    // 4️⃣ Check for existing trip for this driver & destination
    const snapshot = await db
      .collection("trips")
      .where("driverId", "==", driverId)
      .where("destination.lat", "==", destLatFixed)
      .where("destination.lng", "==", destLngFixed)
      .get();

    if (!snapshot.empty) {
      const existingTrip = snapshot.docs[0].data();
      return NextResponse.json({
        isNew: false,
        tripData: existingTrip,
        tripId: snapshot.docs[0].id,
      });
    }

    // 5️⃣ Create new trip
    const newDocRef = await db.collection("trips").add({
      ...routeData,
      driverId,
      customerId: decodedToken.uid,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { isNew: true, tripData: routeData, tripId: newDocRef.id },
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

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const driverId = url.searchParams.get("driverId");
    const customerId = url.searchParams.get("customerId");

    let queryRef = db.collection("trips");

    if (driverId) {
      queryRef = queryRef.where("driverId", "==", driverId);
    }

    if (customerId) {
      queryRef = queryRef.where("customerId", "==", customerId);
    }

    // order by creation date descending
    const snapshot = await queryRef.orderBy("createdAt", "desc").get();

    const trips = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ trips }, { status: 200 });
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
