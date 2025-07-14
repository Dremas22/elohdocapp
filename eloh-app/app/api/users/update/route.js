import { cookies } from "next/headers";
import { auth, db } from "@/db/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await cookies();
    const sessionCookie = session?.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decodedToken = await auth?.verifySessionCookie(sessionCookie, true);
    const uid = decodedToken.uid;

    const { role, data } = await req.json();

    if (!role || !data) {
      return NextResponse.json(
        { success: false, error: "Missing role or data" },
        { status: 400 }
      );
    }

    const collectionName = `${role}s`; // e.g. "patients", "doctors"
    const userRef = db?.collection(collectionName).doc(uid);

    await userRef.update(data);

    return NextResponse.json(
      { success: true, message: `${role} information updated successfully` },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ User update failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
