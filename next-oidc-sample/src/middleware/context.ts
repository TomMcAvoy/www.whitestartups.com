/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, JWTPayload } from "jose";
import crypto from "crypto";
import {
  getSession,
  createSession,
  setSessionCookie,
  addCodeVerifier,
  ensureSession,
  Session,
} from "@/middleware/redis-store"; // Import new session routines
import { SessionData } from "@/types/session-types"; // Import SessionData
import { refreshAccessToken } from "@/utils/oidc-utils"; // Updated import path

export interface RequestContext {
  requestId: string;
  sessionId?: string;
  session?: SessionData; // Use SessionData
  auth?: {
    token: string;
    claims: JWTPayload;
  };
  trace: {
    startTime: number;
    path: string;
    method: string;
  };
  id_token?: string; // Add placeholder for id_token
  refresh_token?: string;
  id_token_expiry?: Date;
  refresh_token_expiry?: Date;
  codeChallenge?: string; // Optionally include codeChallenge
  codeVerifier?: string; // Optionally include codeVerifier
  [key: string]: unknown; // Specify a more appropriate type
}

const contextSymbol = Symbol("context");

// Create the context
export async function createContext(
  req: NextRequest,
  res: NextResponse
): Promise<RequestContext> {
  const requestId = crypto.randomUUID(); // Generate a unique request ID
  const sessionId = req.cookies.get("session_id")?.value;
  const authToken = req.headers.get("authorization")?.split(" ")[1];

  const context: RequestContext = {
    requestId, // Attach the unique request ID to the context
    sessionId,
    trace: {
      startTime: Date.now(),
      path: req.nextUrl.pathname,
      method: req.method,
    },
  };

  // Add session if exists
  if (sessionId) {
    const sessionData = await getSession(sessionId);
    if (sessionData) {
      context.session = sessionData;
      context.refresh_token = sessionData.refresh_token as string;
      context.id_token = sessionData.id_token;
      context.refresh_token_expiry = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ); // 30 days expiry
      context.id_token_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day expiry
    }
  }

  // Add auth if token exists
  if (authToken) {
    try {
      const { payload } = await jwtVerify(
        authToken,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );
      context.auth = {
        token: authToken,
        claims: payload,
      };
    } catch (error) {
      console.error("JWT verification failed:", error);
    }
  }

  return context;
}

// Middleware to handle context
export async function withContext(
  handler: (req: NextRequest, res: NextResponse) => Promise<NextResponse>
) {
  return async function (
    req: NextRequest,
    res: NextResponse
  ): Promise<NextResponse> {
    const context = await createContext(req, res);

    // Attach context to the request object using a symbol
    (req as any)[contextSymbol] = context;

    try {
      const response = await handler(req, res);

      // Add context headers for debugging/tracing
      response.headers.set("x-request-id", context.requestId);
      response.headers.set(
        "x-response-time",
        `${Date.now() - context.trace.startTime}ms`
      );

      return response;
    } catch (error) {
      // Error handling with context
      console.error(`Error [${context.requestId}]:`, error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}

// Helper function to get context from request
export function getContext(req: NextRequest): RequestContext {
  return (req as any)[contextSymbol];
}

// Re-export the addCodeVerifier and ensureSession functions
export { addCodeVerifier, ensureSession };
