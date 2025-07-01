import { auth } from "@/db/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { token } = await req.json();

  try {
    // 🔐 Decode and verify token to access expiration
    const decodedToken = await auth?.verifyIdToken(token);

    // ✅ Ensure decodedToken exists and has an 'exp'
    if (!decodedToken || !decodedToken.exp) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 🔢 Get expiration in milliseconds
    const expirationTimeMs = decodedToken.exp * 1000;
    const nowMs = Date.now();
    const expiresIn = expirationTimeMs - nowMs;

    if (expiresIn <= 0) {
      return NextResponse.json(
        { error: "Token already expired." },
        { status: 401 }
      );
    }

    // 🍪 Create session cookie that matches token expiration
    const sessionCookie = await auth?.createSessionCookie(token, {
      expiresIn,
    });

    // ✅ Set session cookie
    if (sessionCookie) {
      (await cookies()).set("session", sessionCookie, {
        httpOnly: true,
        secure: true,
        path: "/",
        maxAge: Math.floor(expiresIn / 1000),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Session creation error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  // Clear the session cookie
  (await cookies()).set("session", "", {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ message: "Logged out successfully" });
}
