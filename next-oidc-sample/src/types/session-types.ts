/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import "@/config/env"; // Ensure environment variables are loaded
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Represents a session.
 */
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
  tenant_id?: string; // Add tenant_id property
  [key: string]: unknown;
}

/**
 * Represents session data.
 */
export interface SessionData {
  tokens: OIDCTokens;
  user: {
    id: string;
    name: string;
    email: string;
    // ...other user information...
  };
  // ...other session-related information...
}

/**
 * Manages session data.
 */
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
  tenant_id?: string; // Add tenant_id property
  [key: string]: unknown;

  constructor(data: Session) {
    this.authenticated = data.authenticated;
    this.id = data.id;
    this.tenant_id = data.tenant_id; // Initialize tenant_id
    // ...initialize other properties...
  }

  /**
   * Saves the session data to Redis.
   */
  async save() {
    if (this.id) {
      await redis.set(this.id, JSON.stringify(this));
    } else {
      throw new Error("Session ID is missing");
    }
  }

  /**
   * Destroys the session data in Redis.
   */
  async destroy() {
    if (this.id) {
      await redis.del(this.id);
    } else {
      throw new Error("Session ID is missing");
    }
  }

  /**
   * Loads session data from Redis.
   * @param {string} id - The session ID.
   * @returns {Promise<SessionData | null>} The session data or null if not found.
   */
  static async load(id: string): Promise<SessionData | null> {
    const data = await redis.get(id);
    return typeof data === "string" ? new SessionData(JSON.parse(data)) : null;
  }
}
