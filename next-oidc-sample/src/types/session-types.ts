import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// src/session-types.ts
export class SessionData {
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

  constructor(data: { authenticated: boolean }) {
    this.authenticated = data.authenticated;
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
}
