import { auth, db } from "@/db/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    // Check user role collections and return first match with role
    const collections = ["doctors", "nurses", "patients"];

    for (const collection of collections) {
      const docSnap = await db.collection(collection).doc(uid).get();
      if (docSnap.exists) {
        const role = docSnap.data().role || collection.slice(0, -1); // fallback
        return NextResponse.json(
          { authenticated: true, registered: true, role, userId: uid },
          { status: 200 }
        );
      }
    }

    // Authenticated but no registration found
    return NextResponse.json(
      { authenticated: true, registered: false, userId: uid },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
