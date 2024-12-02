import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, JWTPayload } from "jose";
import crypto from "crypto";
import { Redis } from "@upstash/redis";
import { Session } from "./session"; // Ensure Session interface is imported from the correct file

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export interface RequestContext {
  requestId: string;
  sessionId?: string;
  session?: Session; // Use Session interface
  auth?: {
    token: string;
    claims: JWTPayload;
  };
  trace: {
    startTime: number;
    path: string;
    method: string;
  };
  req: NextRequest;
  res: NextResponse;
  id_token?: string; // Add placeholder for id_token
  request?: NextRequest; // Optionally include request
  response?: NextResponse; // Optionally include response
  codeChallenge?: string; // Optionally include codeChallenge
  codeVerifier?: string; // Optionally include codeVerifier
  [key: string]: unknown; // Specify a more appropriate type
}

// Extend NextRequest to include our context
export interface ContextRequest extends NextRequest {
  context: RequestContext;
}

// Interface for context functionality
export interface ContextFunctionality {
  enhanceContext: (context: RequestContext) => Promise<void>;
}

// Create the context
export async function createContext(
  req: NextRequest,
  res: NextResponse,
  functionality?: ContextFunctionality
): Promise<ContextRequest> {
  const requestId = crypto.randomUUID();
  const sessionId = req.cookies.get("session_id")?.value;
  const authToken = req.headers.get("authorization")?.split(" ")[1];

  const context: RequestContext = {
    requestId,
    sessionId,
    trace: {
      startTime: Date.now(),
      path: req.nextUrl.pathname,
      method: req.method,
    },
    req,
    res,
  };

  // Add session if exists
  if (sessionId) {
    const sessionData = await getSessionData(sessionId);
    if (sessionData) {
      context.session = sessionData;
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

  // Enhance context with additional functionality if provided
  if (functionality?.enhanceContext) {
    await functionality.enhanceContext(context);
  }

  // Attach context to request
  (req as ContextRequest).context = context;

  return req as ContextRequest;
}

// Middleware to handle context
export async function withContext(
  handler: (req: ContextRequest) => Promise<NextResponse>,
  functionality?: ContextFunctionality
) {
  return async function (req: NextRequest, res: NextResponse) {
    const contextReq = await createContext(req, res, functionality);

    try {
      const response = await handler(contextReq);

      // Add context headers for debugging/tracing
      response.headers.set("x-request-id", contextReq.context.requestId);
      response.headers.set(
        "x-response-time",
        `${Date.now() - contextReq.context.trace.startTime}ms`
      );

      return response;
    } catch (error) {
      // Error handling with context
      console.error(`Error [${contextReq.context.requestId}]:`, error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}

// Re-export the addCodeVerifier and ensureSession functions
export async function addCodeVerifier(context: RequestContext) {
  context.codeVerifier =
    context.req.headers.get("x-code-verifier") || undefined;
}

export async function ensureSession(context: RequestContext) {
  if (!context.session) {
    context.session = { id: context.sessionId || "" };
  }
}

export async function getSessionData(sessionId: string) {
  return await redis.get(sessionId);
}
