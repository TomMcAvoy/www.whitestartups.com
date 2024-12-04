/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { SessionData } from "@/types/session-types"; // Import SessionData
import {
  createSession,
  getSession,
  updateSession,
  deleteSession,
  setSessionCookie,
  clearSessionCookie,
} from "@/middleware/redis-store";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get("session_id")?.value;
  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is missing" },
      { status: 400 }
    );
  }

  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { sessionId, sessionData } = await createSession(data);
  const response = NextResponse.json({ success: true, sessionData });
  return setSessionCookie(response, sessionId);
}

export async function PUT(request: NextRequest) {
  const sessionIdCookie = request.cookies.get("session_id");
  if (!sessionIdCookie) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }
  const sessionId = sessionIdCookie.value;
  const data = await request.json();
  await updateSession(sessionId, data);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const sessionIdCookie = request.cookies.get("session_id");
  if (!sessionIdCookie) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }
  const sessionId = sessionIdCookie.value;
  await deleteSession(sessionId);
  const response = NextResponse.json({ success: true });
  return clearSessionCookie(response);
}
