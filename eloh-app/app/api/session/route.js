import { auth, db } from "@/db/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { token, fcmToken } = await req.json();

  try {
    const decodedToken = await auth?.verifyIdToken(token);

    if (!decodedToken || !decodedToken.exp) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const expirationTimeMs = decodedToken.exp * 1000;
    const nowMs = Date.now();
    const expiresIn = expirationTimeMs - nowMs;

    if (expiresIn <= 0) {
      return NextResponse.json(
        { error: "Token already expired. Please sign-in" },
        { status: 401 }
      );
    }

    const sessionCookie = await auth?.createSessionCookie(token, {
      expiresIn,
    });

    if (sessionCookie) {
      (await cookies()).set("session", sessionCookie, {
        httpOnly: true,
        secure: true,
        path: "/",
        maxAge: Math.floor(expiresIn / 1000),
      });
    }

    if (fcmToken) {
      const uid = decodedToken.uid;
      const role = decodedToken.role || "doctor";
      const collectionName = role + "s"; // doctors, nurses, patients
      const userRef = db.collection(collectionName).doc(uid);

      // Get the existing data
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const existingData = userSnap.data();

      // Merge new session-related fields with existing data
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
  } catch (err) {
    console.error("Session creation error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
