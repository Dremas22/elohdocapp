import { auth, db } from "@/db/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { token, fcmToken } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const decodedToken = await auth.verifyIdToken(token);

    if (!decodedToken || !decodedToken.exp) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const expirationTimeMs = decodedToken.exp * 1000;
    const nowMs = Date.now();
    const expiresIn = expirationTimeMs - nowMs;

    if (expiresIn <= 0) {
      return NextResponse.json(
        { error: "Token already expired. Please sign in again" },
        { status: 401 }
      );
    }

    const sessionCookie = await auth?.createSessionCookie(token, { expiresIn });

    const cookieStore = cookies();
    cookieStore.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(expiresIn / 1000),
    });

    // Optional FCM and profile update
    if (fcmToken) {
      const uid = decodedToken.uid;
      const role = decodedToken.role || "doctor";
      const userRef = db?.collection(`${role}s`).doc(uid);

      const userSnap = await userRef.get();
      if (userSnap.exists) {
        await userRef.set(
          {
            fcmToken,
            online: true,
            lastLogin: new Date(),
            updatedAt: new Date(),
          },
          { merge: true }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Session creation error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
