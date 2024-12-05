/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  setSessionCookie,
  ensureSession,
} from "@/middleware/redis-store";
import { generateRandomState } from "@/utils/oidc-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const state = generateRandomState();

    const { sessionId, sessionData } = await createSession({
      state,
      created: new Date().toISOString(),
    });

    const response = NextResponse.json({
      session: sessionData,
      sessionId,
    });

    await setSessionCookie(response, sessionId);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to initialize login session" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email } = await request.json();

    const { sessionId, sessionData } = await createSession({
      authenticated: true,
      email,
      created: new Date().toISOString(),
    });

    const response = NextResponse.json({
      success: true,
      sessionId,
    });

    await setSessionCookie(response, sessionId);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
