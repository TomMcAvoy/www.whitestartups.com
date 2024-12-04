/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { SessionData } from "@/types/session-types";
import { refreshTokens, setTokenExpiry } from "@/utils/token-utils";
import { refreshAccessToken } from "@/utils/oidc-utils"; // Updated import path
import { getContext } from "@/middleware/context-store"; // Import context store

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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

  const session = await SessionData.load(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const newAccessToken = await refreshTokens(session);
    setTokenExpiry(context, session); // Use context instead of requestId

    return NextResponse.json({ access_token: newAccessToken });
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return NextResponse.json(
      { error: "Failed to refresh access token" },
      { status: 500 }
    );
  }
}
