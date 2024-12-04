/* eslint-disable @typescript-eslint/no-empty-interface */

import { Redis } from "@upstash/redis";
import { SessionData } from "@/types/session-types";
import { NextRequest, NextResponse } from "next/server";
import { RequestContext } from "@/middleware/context";

// Initialize Redis client
const redisClient = new Redis({
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

// Generate a UUID using a supported method
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Session CRUD operations
export async function createSession(
  data: Partial<SessionData>
): Promise<{ sessionId: string; sessionData: SessionData }> {
  const sessionId = generateUUID();
  const sessionData = new SessionData({ authenticated: false, ...data });
  sessionData.id = sessionId;

  await redisStore.set(sessionId, sessionData);
  return { sessionId, sessionData };
}

export async function getSession(
  sessionId: string
): Promise<SessionData | null> {
  return await SessionData.load(sessionId);
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
  await sessionData.save();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const sessionData = await getSession(sessionId);
  if (sessionData) {
    await sessionData.destroy();
  }
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

  const sessionData = await getSession(sessionId);
  return { session: sessionData, sessionId };
}

export async function addCodeVerifier(context: RequestContext): Promise<void> {
  context.codeVerifier =
    context.req.headers.get("x-code-verifier") || undefined;
}

export async function ensureSession(context: RequestContext): Promise<void> {
  if (!context.session) {
    const { sessionId, sessionData } = await createSession({});
    context.session = sessionData;
    await setSessionCookie(context.res, sessionId);
  }
}
