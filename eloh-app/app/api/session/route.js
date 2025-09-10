import { SEVEN_DAYS_MS } from "@/constants";
import { auth, db } from "@/db/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { token, role, fcmToken } = await req.json();

    const cookieStore = await cookies();

    if (!token) {
      // Clear any old session
      cookieStore.set("session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      });
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const decodedToken = await auth?.verifyIdToken(token);

    if (!decodedToken || !decodedToken.exp) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const expirationTimeMs = Date.now() + SEVEN_DAYS_MS;
    const nowMs = Date.now();
    const expiresIn = expirationTimeMs - nowMs;

    if (expiresIn <= 0) {
      return NextResponse.json(
        { error: "Token already expired. Please sign in again" },
        { status: 401 }
      );
    }

    const sessionCookie = await auth?.createSessionCookie(token, { expiresIn });

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
      await auth.setCustomUserClaims(uid, { role: role || decodedToken?.role });
    }

    // 📝 Only update FCM/status if user is in doctors/nurses/drivers collection
    if (role === "doctor" || role === "nurse" || role === "driver") {
      const userRef = db?.collection(`${role}s`).doc(uid);
      const userSnap = await userRef.get();

      if (userSnap.exists) {
        const updateData = {
          online: true,
          lastLogin: new Date(),
          updatedAt: new Date(),
        };

        // If we received a valid FCM token, store it
        if (
          fcmToken &&
          typeof fcmToken === "string" &&
          fcmToken.trim() !== ""
        ) {
          updateData.fcmToken = fcmToken;
        }

        await userRef.set(updateData, { merge: true });
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

    // Verify and decode the session
    const decodedClaims = await auth?.verifySessionCookie(sessionCookie, true);
    const { uid, role } = decodedClaims;

    // Update Firestore: mark user offline and remove FCM token
    if (role) {
      const userRef = db?.collection(`${role}s`).doc(uid);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        await userRef.set(
          {
            online: false,
            updatedAt: new Date(),
          },
          { merge: true }
        );
      }
    }

    // Prepare response and clear the session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (err) {
    console.error("Session deletion error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
