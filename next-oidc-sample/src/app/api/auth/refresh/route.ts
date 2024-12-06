import { NextRequest, NextResponse } from "next/server";
import { OIDCClient } from "@/lib/oidc/client";
import { SessionStore } from "@/lib/redis/store";

async function refreshSession(sessionId: string) {
  const session = await SessionStore.getSession(sessionId);

  if (!session?.tokens.refresh_token) {
    throw new Error("No refresh token available");
  }

  const newTokens = await OIDCClient.refreshTokens(
    session.tokens.refresh_token
  );

  // Update session with new tokens
  await SessionStore.updateSession(sessionId, {
    tokens: newTokens,
  });

  return {
    ...session,
    tokens: newTokens,
  };
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { message: "Session ID not found" },
        { status: 400 }
      );
    }

    const refreshedSession = await refreshSession(sessionId);

    if (!refreshedSession) {
      return NextResponse.json(
        { message: "Failed to refresh session" },
        { status: 500 }
      );
    }

    return NextResponse.json(refreshedSession, { status: 200 });
  } catch (error) {
    console.error("Error refreshing session:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
