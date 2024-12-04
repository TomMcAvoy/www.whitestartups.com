import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// src/types/session-types.ts
export interface Session {
  authenticated: boolean;
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
  [key: string]: unknown;
}

export class SessionData implements Session {
  authenticated: boolean;
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
  [key: string]: unknown;

  constructor(data: Session) {
    this.authenticated = data.authenticated;
    this.id = data.id;
    // ...initialize other properties...
  }

  async save() {
    if (this.id) {
      await redis.set(this.id, JSON.stringify(this));
    } else {
      throw new Error("Session ID is missing");
    }
  }

  async destroy() {
    if (this.id) {
      await redis.del(this.id);
    } else {
      throw new Error("Session ID is missing");
    }
  }

  static async load(id: string): Promise<SessionData | null> {
    const data = await redis.get(id);
    return data ? new SessionData(JSON.parse(data)) : null;
  }
}
