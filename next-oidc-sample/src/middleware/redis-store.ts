/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unused-vars */

import "@/config/env"; // Ensure environment variables are loaded
import { redis, Redis } from "@/lib/redis";
import { AppContext, ContextManager } from "@/lib/context";
import { NextRequest, NextResponse } from "next/server";
import { SessionData } from "@/types/session-types";

// Initialize Redis client
export const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// Redis Store implementation
export class RedisStore {
  private client: Redis;

  constructor(client: Redis) {
    this.client = client;
  }

  async get(sid: string): Promise<SessionData | null> {
    const data = await this.client.get(`sess:${sid}`);
    return typeof data === "string" ? JSON.parse(data) : null;
  }

  async set(sid: string, sess: SessionData): Promise<void> {
    await this.client.set(`sess:${sid}`, JSON.stringify(sess));
  }

  async destroy(sid: string): Promise<void> {
    await this.client.del(`sess:${sid}`);
  }
}

export const redisStore = new RedisStore(redisClient);

const SESSION_SYMBOL = Symbol("session");

// Generate a UUID using a supported method
function generateUUID() {
  return crypto.randomUUID();
}

// Session CRUD operations
export async function createSession(
  data: Partial<SessionData>
): Promise<{ sessionId: string; sessionData: SessionData }> {
  const sessionId = generateUUID();
  const sessionData = new SessionData({ authenticated: false, ...data });
  sessionData.id = sessionId;

  await redis.set(`session:${sessionId}`, JSON.stringify(sessionData));
  return { sessionId, sessionData };
}

export async function getSession(
  sessionId: string
): Promise<SessionData | null> {
  const session = await redis.get(`session:${sessionId}`);
  return session ? JSON.parse(session as string) : null;
}

export async function updateSession(
  sessionId: string,
  data: Partial<SessionData>
): Promise<void> {
  const sessionData = await getSession(sessionId);
  if (!sessionData) {
    throw new Error("Session not found");
  }
  Object.assign(sessionData, data);
  await redis.set(`session:${sessionId}`, JSON.stringify(sessionData));
}

export async function deleteSession(sessionId: string): Promise<void> {
  await redis.del(`session:${sessionId}`);
}

// Cookie management
export async function setSessionCookie(
  response: NextResponse,
  sessionId: string
): Promise<NextResponse> {
  response.cookies.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,
  });
  return response;
}

export async function clearSessionCookie(
  response: NextResponse
): Promise<NextResponse> {
  response.cookies.delete("session_id");
  return response;
}

// Middleware to retrieve session from request
export async function withSession(request: NextRequest): Promise<{
  session: SessionData | null;
  sessionId: string | null;
}> {
  const sessionId = request.cookies.get("session_id")?.value;
  if (!sessionId) {
    return { session: null, sessionId: null };
  }

  const session = await redis.get(`session:${sessionId}`);
  const sessionData = session ? JSON.parse(session as string) : null;

  // Store in new context system
  ContextManager.set(request, SESSION_SYMBOL, sessionData);

  return { session: sessionData, sessionId };
}

const CODE_VERIFIER_SYMBOL = Symbol("codeVerifier");
const CONTEXT_SYMBOL = Symbol("context");
const contextMap = new Map<string, RequestContext>();

export async function setCodeVerifier(context: RequestContext): Promise<void> {
  const requestBody = await (context.req as NextRequest).json();
  const contextId = requestBody[CONTEXT_SYMBOL];
  if (contextId && contextMap.has(contextId)) {
    const storedContext = contextMap.get(contextId);
    if (storedContext) {
      storedContext.codeVerifier = requestBody.codeVerifier || undefined;
    }
  }
}

export async function getCodeVerifier(
  context: RequestContext
): Promise<string | undefined> {
  const requestBody = await (context.req as NextRequest).json();
  const contextId = requestBody[CONTEXT_SYMBOL];
  if (contextId && contextMap.has(contextId)) {
    const storedContext = contextMap.get(contextId);
    return storedContext?.codeVerifier;
  }
  return undefined;
}

export async function ensureSession(context: RequestContext): Promise<void> {
  if (!context.session) {
    const { sessionId, sessionData } = await createSession({});
    context.session = sessionData;
    await setSessionCookie(context.res as NextResponse, sessionId);
  }
}
