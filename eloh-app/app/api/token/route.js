import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export const revalidate = 0;

export async function GET(req) {
  const room = req.nextUrl.searchParams.get("room");
  const username = req.nextUrl.searchParams.get("username");
  // Get token from cookies or Authorization header
  const cookieToken = req.cookies.get("session")?.value;
  const headerToken = req.headers.get("authorization")?.split("Bearer ")[1];
  const token = cookieToken || headerToken;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized User, Please sign-in to join meeting" },
      { status: 401 }
    );
  }
  if (!room) {
    return NextResponse.json(
      { error: 'Missing "room" query parameter' },
      { status: 400 }
    );
  } else if (!username) {
    return NextResponse.json(
      { error: 'Missing "username" query parameter' },
      { status: 400 }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const at = new AccessToken(apiKey, apiSecret, { identity: username });
  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

  return NextResponse.json(
    { token: await at.toJwt() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
