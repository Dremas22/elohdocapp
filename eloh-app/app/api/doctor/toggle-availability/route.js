import { auth, db } from "@/db/server";
import { NextResponse } from "next/server";

/**
 * Verifies the Firebase session token and determines user role + doc.
 * Returns: { uid, role, doc: Firebase DocumentSnapshot }
 */
async function verifyUserAndGetDoc(token) {
  try {
    const decodedToken = await auth.verifySessionCookie(token, true);
    const { uid } = decodedToken;

    const doctorRef = db.collection("doctors").doc(uid);
    const doctorDoc = await doctorRef.get();
    if (doctorDoc.exists) return { uid, role: "doctor", doc: doctorDoc };

    const nurseRef = db.collection("nurses").doc(uid);
    const nurseDoc = await nurseRef.get();
    if (nurseDoc.exists) return { uid, role: "nurse", doc: nurseDoc };

    const driverRef = db.collection("drivers").doc(uid);
    const driverDoc = await driverRef.get();
    if (driverDoc.exists) return { uid, role: "driver", doc: driverDoc };

    throw new Error("User not found in doctor, nurse or driver collection");
  } catch (err) {
    console.error("Token verification failed:", err.message);
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

    const { role, doc } = await verifyUserAndGetDoc(token);

    return NextResponse.json({
      available: doc.data()?.available ?? false,
      user: { id: doc.id, ...doc.data() },
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

    const { uid, role, doc } = await verifyUserAndGetDoc(token);

    const currentAvailability = doc.data()?.available ?? false;
    const newAvailability = !currentAvailability;

    const userRef = db?.collection(`${role}s`).doc(uid);
    await userRef.update({ available: newAvailability });

    return NextResponse.json({
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } availability updated`,
      available: newAvailability,
      user: { id: doc.id, ...doc.data(), available: newAvailability },
    });
  } catch (error) {
    console.error("Availability update error:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
