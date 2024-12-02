// src/middleware/redis-store.ts
import { Redis } from "@upstash/redis";
import { SessionData } from "@/types/session-types";
import { NextRequest, NextResponse } from "next/server";

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
    return data ? JSON.parse(data) : null;
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
export async function createSession<T>(
  data: T
): Promise<{ sessionId: string; sessionData: SessionData }> {
  const sessionId = generateUUID();
  const sessionData: SessionData = {
    ...data,
    save: async () => {
      await redisClient.set(`sess:${sessionId}`, JSON.stringify(sessionData));
    },
    destroy: async (callback: (err: Error | null) => void) => {
      try {
        await redisClient.del(`sess:${sessionId}`);
        callback(null);
      } catch (err) {
        callback(err);
      }
    },
  };

  await redisClient.set(`sess:${sessionId}`, JSON.stringify(sessionData));
  return { sessionId, sessionData };
}

export async function getSession(
  sessionId: string
): Promise<SessionData | null> {
  return await redisStore.get(sessionId);
}

export async function updateSession(
  sessionId: string,
  data: Partial<SessionData>
): Promise<void> {
  const sessionData = await redisStore.get(sessionId);
  if (!sessionData) {
    throw new Error("Session not found");
  }
  Object.assign(sessionData, data);
  await redisStore.set(sessionId, sessionData);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await redisStore.destroy(sessionId);
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

  const sessionData = await redisClient.get(`sess:${sessionId}`);
  if (!sessionData) {
    return { session: null, sessionId: null };
  }

  const parsedSession = JSON.parse(sessionData) as SessionData;
  return { session: parsedSession, sessionId };
}
