import { db, auth } from "@/db/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Extract token from cookie or header
    const cookieToken = request.cookies.get("session")?.value;
    const headerToken = request.headers
      .get("authorization")
      ?.split("Bearer ")[1];
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token with Firebase Admin SDK (using verifySessionCookie)
    const decodedToken = await auth?.verifySessionCookie(token, true);

    const data = await request.json();
    const { userId, role } = data;

    if (!userId || decodedToken.uid !== userId || !role) {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 }
      );
    }

    const validRoles = ["doctor", "nurse", "patient"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const collectionName = role + "s";
    const userDocRef = db.collection(collectionName).doc(userId);
    const docSnapshot = await userDocRef.get();

    if (docSnapshot.exists) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 200 }
      );
    }

    const now = new Date();
    let userDoc = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    if (role === "doctor" || role === "nurse") {
      userDoc.isVerified = false;
    } else if (role === "patient") {
      userDoc.isActive = true;
    }

    await userDocRef.set(userDoc);

    if (role === "doctor" || role === "nurse") {
      await auth.setCustomUserClaims(userId, { role }); // use role from data
    }

    return NextResponse.json(
      { message: "User successfully created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
