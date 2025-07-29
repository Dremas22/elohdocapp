import { auth, db } from "@/db/server";
import { NextResponse } from "next/server";

async function verifyUserAndGetRole(token) {
  try {
    const decodedToken = await auth.verifySessionCookie(token, true);

    const { uid, role } = decodedToken;

    if (!["doctor", "nurse"].includes(role)) {
      throw new Error("Invalid role");
    }

    return { uid, role };
  } catch (err) {
    console.error("Token verification failed:", err);
    throw new Error("Unauthorized");
  }
}

export async function GET(req) {
  try {
    const cookieToken = req.cookies.get("session")?.value;
    const headerToken = req.headers.get("authorization")?.split("Bearer ")[1];
    const token = cookieToken || headerToken;

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { uid, role } = await verifyUserAndGetRole(token);

    const userRef = db.collection(`${role}s`).doc(uid);
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: `${role} not found` }, { status: 404 });
    }

    return NextResponse.json({
      available: snapshot.data()?.available ?? false,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: err.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(req) {
  try {
    const cookieToken = req.cookies.get("session")?.value;
    const headerToken = req.headers.get("authorization")?.split("Bearer ")[1];
    const token = cookieToken || headerToken;

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { uid, role } = await verifyUserAndGetRole(token);

    const userRef = db.collection(`${role}s`).doc(uid);
    const docSnap = await userRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: `${role} not found` }, { status: 404 });
    }

    const currentAvailability = docSnap.data()?.available ?? false;
    const newAvailability = !currentAvailability;

    await userRef.update({ available: newAvailability });

    return NextResponse.json({
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } availability updated`,
      available: newAvailability,
    });
  } catch (error) {
    console.error("Availability update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
