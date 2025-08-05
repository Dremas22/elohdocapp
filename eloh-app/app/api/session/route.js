import { auth, db } from "@/db/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { token, fcmToken, role } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const decodedToken = await auth.verifyIdToken(token);

    if (!decodedToken || !decodedToken.exp) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const uid = decodedToken.uid;

    // 🔥 Determine role by checking both collections
    const doctorRef = db?.collection("doctors").doc(uid);
    const nurseRef = db?.collection("nurses").doc(uid);
    const patientRef = db?.collection("patients").doc(uid);
    let userRef = null;

    const [doctorSnap, nurseSnap, patientSnap] = await Promise.all([
      doctorRef.get(),
      nurseRef.get(),
      patientRef.get(),
    ]);

    if (doctorSnap.exists) {
      userRef = doctorRef;
    } else if (nurseSnap.exists) {
      userRef = nurseRef;
    } else if (patientSnap.exists) {
      userRef = patientRef;
    } else {
      return NextResponse.json(
        { error: "User not found in any collection" },
        { status: 404 }
      );
    }

    let roleJustSet = false;
    // 🔐 Set role as a custom claim (only if not already set)
    if (!decodedToken.role || decodedToken.role !== role) {
      await auth.setCustomUserClaims(uid, { role });
      roleJustSet = true;
    }

    // 🍪 Create session cookie
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

    // 💾 Update FCM and metadata
    const userSnap = await userRef.get();
    if (userSnap.exists && fcmToken) {
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

    return NextResponse.json({ success: true, roleJustSet });
  } catch (err) {
    console.error("Session creation error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (sessionCookie) {
      // Verify session cookie to get UID
      const decoded = await auth?.verifySessionCookie(sessionCookie, true);
      const uid = decoded.uid;
      const role = decoded.role || "patient"; // default fallback

      // Mark user offline
      const userRef = db.collection(`${role}s`).doc(uid);
      await userRef.set(
        {
          online: false,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    }

    // Clear session cookie
    cookieStore.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Failed to logout" }, { status: 401 });
  }
}
