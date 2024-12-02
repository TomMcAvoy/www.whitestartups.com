/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "redis";

// Initialize Redis client
const client = createClient({
  url: process.env.REDIS_URL,
  // ...other options...
});

client.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  await client.connect();
})();

// Redis Store implementation
export class RedisStore {
  private client: typeof client;

  constructor(client: typeof client) {
    this.client = client;
  }

  async get(sid: string): Promise<any> {
    const data = await this.client.get(`sess:${sid}`);
    return data ? JSON.parse(data) : null;
  }

  async set(sid: string, sess: any): Promise<void> {
    await this.client.set(`sess:${sid}`, JSON.stringify(sess));
  }

  async destroy(sid: string): Promise<void> {
    await this.client.del(`sess:${sid}`);
  }
}

export interface RequestWithSession extends NextRequest {
  session: {
    id?: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
    access_token?: string;
    id_token?: string;
    state?: string;
    codeVerifier?: string;
    save: () => Promise<void>;
    destroy: (callback: (err: any) => void) => void;
    [key: string]: any;
  };
}

// Session middleware
export async function withSession(request: NextRequest): Promise<{
  session: RequestWithSession["session"] | null;
  sessionId: string | null;
}> {
  const sessionId = request.cookies.get("session_id")?.value;
  if (!sessionId) {
    return { session: null, sessionId: null };
  }

  const sessionData = await client.get(`sess:${sessionId}`);
  if (!sessionData) {
    return { session: null, sessionId: null };
  }

  const parsedSession = JSON.parse(
    sessionData
  ) as RequestWithSession["session"];
  return { session: parsedSession, sessionId };
}

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
): Promise<{ sessionId: string; sessionData: any }> {
  const sessionId = generateUUID();
  const sessionData = {
    ...data,
    save: async () => {
      await client.set(`sess:${sessionId}`, JSON.stringify(data));
    },
    destroy: async () => {
      await client.del(`sess:${sessionId}`);
    },
  };

  await client.set(`sess:${sessionId}`, JSON.stringify(data));
  return { sessionId, sessionData };
}

export async function deleteSession(
  sessionId: string,
  prefix: string = "sess:"
): Promise<void> {
  await client.del(`${prefix}${sessionId}`);
}

// Update the updateSessionData function definition
export async function updateSessionData(
  sessionId: string,
  sessionData: RequestWithSession["session"],
  ttl: number = 86400
): Promise<void> {
  if (!sessionId) {
    throw new Error("Session ID is required");
  }
  await client.setEx(`sess:${sessionId}`, ttl, JSON.stringify(sessionData));
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function withSessionMiddleware(req: NextRequest): Promise<void> {
  const { session, sessionId } = await withSession(req);
  if (session && sessionId) {
    const enhancedSession: RequestWithSession["session"] = {
      ...session,
      save: async () => {
        await client.set(`sess:${sessionId}`, JSON.stringify(session));
      },
      destroy: (callback: (err: any) => void) => {
        client
          .del(`sess:${sessionId}`)
          .then(() => callback(null))
          .catch(callback);
      },
    };

    (req as RequestWithSession).session = enhancedSession;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sessionHandler = async (
  req: RequestWithSession
): Promise<NextResponse> => {
  if (!req.session) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  // Now TypeScript knows req.session.destroy exists
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
  });

  return NextResponse.json({ success: true });
};

// Example function to create a session
export const createSessionHandler = async <T>(
  req: RequestWithSession,
  data: T
) => {
  await withSessionMiddleware(req);
  req.session.data = data;
  await req.session.save();

  return NextResponse.json({
    message: "Session created",
    data: req.session.data,
  });
};

// Example function to read a session
export const readSession = async (req: RequestWithSession) => {
  await withSessionMiddleware(req);
  if (!req.session.data) {
    return NextResponse.json({ message: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({
    message: "Session data",
    data: req.session.data,
  });
};

// Example function to update a session
export const updateSession = async <T>(
  req: RequestWithSession,
  res: NextResponse,
  data: T
) => {
  await withSessionMiddleware(req);
  req.session.data = { ...req.session.data, ...data };
  await req.session.save();

  return NextResponse.json({
    message: "Session updated",
    data: req.session.data,
  });
};

// Example function to delete a session
export const deleteSessionHandler = async (req: RequestWithSession) => {
  await withSessionMiddleware(req);
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const anotherRes = NextResponse.json({
    message: "Session deleted",
  });
  return NextResponse.json({
    message: "Session deleted",
  });
};

export { client as redisClient };
