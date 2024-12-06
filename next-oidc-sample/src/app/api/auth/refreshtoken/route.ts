/* eslint-disable @typescript-eslint/no-unused-vars */
import "@/config/env"; // Ensure environment variables are loaded
import { NextRequest, NextResponse } from "next/server";
import { TokenVerifier } from "@/lib/tokens/verify";
import { SessionStore } from "@/lib/redis/store";
import { OIDCClient } from "@/lib/oidc/client";

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId")?.value;

  if (!sessionId) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  try {
    // Get current session
    const session = await SessionStore.getSession(sessionId);
    if (!session?.tokens.refresh_token) {
      return NextResponse.json(
        { error: "No refresh token available" },
        { status: 401 }
      );
    }

    // Refresh the tokens
    const newTokens = await OIDCClient.refreshTokens(
      session.tokens.refresh_token
    );

    // Update session with new tokens
    await SessionStore.updateSession(sessionId, {
      tokens: newTokens,
    });

    return NextResponse.json({
      success: true,
      tokens: newTokens,
    });
  } catch (error) {
    console.error("Token refresh failed:", error);
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }
}
