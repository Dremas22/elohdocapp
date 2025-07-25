import { auth, db } from "@/db/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Step 1: Get session token
    const cookieToken = req.cookies.get("session")?.value;
    const headerToken = req.headers.get("authorization")?.split("Bearer ")[1];
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Verify Firebase session token
    let decodedToken;
    try {
      decodedToken = await auth?.verifySessionCookie(token, true);
    } catch (err) {
      console.error("Session verification failed:", err);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = decodedToken.uid;

    // Step 3: Check if user is in doctors collection
    const doctorRef = db?.collection("doctors").doc(userId);
    const doctorSnap = await doctorRef.get();

    if (!doctorSnap.exists) {
      return NextResponse.json(
        { error: "Doctor record not found" },
        { status: 404 }
      );
    }

    const doctorData = doctorSnap.data();

    // Step 4: Check role
    if (doctorData.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Determine new availability
    const currentAvailability = doctorData.available ?? false;
    const newAvailability = !currentAvailability;

    // Update availability
    await doctorRef.update({ available: newAvailability });

    return NextResponse.json({
      message: "Doctor availability updated successfully",
      available: newAvailability,
    });
  } catch (error) {
    console.error("Error toggling availability:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
