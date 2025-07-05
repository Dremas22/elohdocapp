import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth, db } from "@/db/client";

export async function POST(req) {
  const { token, fcmToken } = await req.json();

  try {
    // Decode and verify token
    const decodedToken = await auth?.verifyIdToken(token);

    if (!decodedToken || !decodedToken.exp) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Calculate expiration
    const expirationTimeMs = decodedToken.exp * 1000;
    const nowMs = Date.now();
    const expiresIn = expirationTimeMs - nowMs;

    if (expiresIn <= 0) {
      return NextResponse.json(
        { error: "Token has already expired" },
        { status: 401 }
      );
    }

    // Create session cookie
    const sessionCookie = await auth?.createSessionCookie(token, {
      expiresIn,
    });

    if (sessionCookie) {
      (await cookies()).set("session", sessionCookie, {
        httpOnly: true,
        secure: true,
        path: "/",
        maxAge: expiresIn / 1000,
      });
    }

    // Update Firestore user document if fcmToken provided
    if (fcmToken) {
      const uid = decodedToken.uid;
      const role = decodedToken.role || "doctor";
      const collectionName = role + "s"; // doctors, nurses, patients

      const userRef = db.collection(collectionName).doc(uid);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const existingData = userSnap.data();

      const updatedData = {
        ...existingData,
        fcmToken,
        online: true,
        lastLogin: new Date(),
        updatedAt: new Date(),
      };

      await userRef.set(updatedData, { merge: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  (await cookies()).set("session", "", {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ message: "Logged out successfully" });
}
