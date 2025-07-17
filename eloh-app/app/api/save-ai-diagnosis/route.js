import { auth, db } from "@/db/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const decoded = await auth?.verifySessionCookie(sessionCookie, true);
    const userId = decoded.uid;

    const { aiResponse } = await request.json();

    if (!aiResponse) {
      return NextResponse.json(
        { message: "Messages and diagnosis are required" },
        { status: 400 }
      );
    }

    // Save to Firestore
    const docRef = await db?.collection("diagnosis").add({
      userId,
      diagnosis: aiResponse,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: `Diagnosis saved with ID: ${docRef.id}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error saving diagnosis:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
