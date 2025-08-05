import { auth, db } from "@/db/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { token, fcmToken, role } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const decodedToken = await auth?.verifyIdToken(token);

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

    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(expiresIn / 1000),
    });

    // Optional FCM and profile update
    const uid = decodedToken.uid;

    // 🔐 Ensure correct custom claims
    if (!decodedToken.role || decodedToken.role !== role) {
      await auth.setCustomUserClaims(uid, { role });
    }

    // 📝 Only update FCM/status if user is in doctors/nurses collection
    if (role === "doctor" || role === "nurse") {
      const userRef = db?.collection(`${role}s`).doc(uid);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        await userRef.set(
          {
            ...userSnap.data(),
            ...(fcmToken && { fcmToken }),
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

export async function DELETE(req) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore?.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "No session cookie found" },
        { status: 401 }
      );
    }

    // Verify session cookie and get UID
    const decodedClaims = await auth?.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    const role = decodedClaims.role;

    // Clear session cookie
    cookieStore.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    // Optional: update user's online status
    if (role) {
      const userRef = db?.collection(`${role}s`).doc(uid);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        await userRef.set(
          {
            online: false,
            fcmToken: null,
            updatedAt: new Date(),
          },
          { merge: true }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Session deletion error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
