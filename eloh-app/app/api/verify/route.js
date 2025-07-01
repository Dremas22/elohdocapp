import { auth } from "@/db/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const cookieToken = req.cookies.get("session")?.value;
  const headerToken = req.headers.get("authorization")?.split("Bearer ")[1];

  const token = cookieToken || headerToken;

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  try {
    const decoded = await auth?.verifyIdToken(token);

    return NextResponse.json({ uid: decoded?.uid });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
