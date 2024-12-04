/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getSession, createSession } from "@/middleware/redis-store";
import { SessionData } from "@/types/session-types";
import { refreshAccessToken } from "@/utils/oidc-utils"; // Updated import path
import { getContext } from "@/middleware/context-store"; // Import context store

// Define the logOutUser function
function logOutUser(requestId: string) {
  console.log(`User with request ID ${requestId} has been logged out.`);
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id");
  if (!requestId) {
    return NextResponse.json(
      { error: "Request ID not found" },
      { status: 400 }
    );
  }

  const context = getContext(requestId);
  if (!context) {
    return NextResponse.json(
      { error: "Context not found or expired" },
      { status: 400 }
    );
  }

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

  // Invalidate session tokens
  session.access_token = "";
  session.refresh_token = "";
  session.id_token = "";
  await createSession(session);

  logOutUser(context.requestId); // Use context instead of requestId

  return NextResponse.json({ message: "Logged out successfully" });
}
