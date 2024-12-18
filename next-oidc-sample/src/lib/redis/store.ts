/* eslint-disable @typescript-eslint/no-explicit-any */
import { redis } from "./client";
import type { SessionData, OIDCTokens } from "@/types/session-types";
import crypto from "crypto";

/**
 * Manages sessions in Redis.
 */
export class SessionStore {
  // Key prefixes for different types of data
  private static readonly SESSION_PREFIX = "session:";
  private static readonly STATE_PREFIX = "state:";
  private static readonly TOKEN_PREFIX = "token:";

  /**
   * Creates a new session.
   * @param {SessionData} data - The session data.
   * @returns {Promise<string>} The session ID.
   */
  static async createSession(data: SessionData): Promise<string> {
    const sessionId = crypto.randomUUID();
    await redis.set(
      `${this.SESSION_PREFIX}${sessionId}`,
      JSON.stringify(data),
      "EX",
      3600
    ); // 1 hour expiry
    return sessionId;
  }

  static async getSession(sessionId: string): Promise<SessionData | null> {
    const data = await redis.get(`${this.SESSION_PREFIX}${sessionId}`);
    return data ? JSON.parse(data as string) : null;
  }

  static async updateSession(
    sessionId: string,
    data: Partial<SessionData>
  ): Promise<void> {
    const existing = await this.getSession(sessionId);
    if (!existing) throw new Error("Session not found");

    await redis.set(
      `${this.SESSION_PREFIX}${sessionId}`,
      JSON.stringify({
        ...existing,
        ...data,
        updated: new Date().toISOString(),
      }),
      "EX",
      3600 // 1 hour expiry
    );
  }

  static async deleteSession(sessionId: string): Promise<void> {
    await redis.del(`${this.SESSION_PREFIX}${sessionId}`);
  }

  // OIDC State Management
  static async storeOIDCState(state: string, data: any): Promise<void> {
    await redis.set(
      `${this.STATE_PREFIX}${state}`,
      JSON.stringify(data),
      "EX",
      600 // 10 minutes expiry
    );
  }

  static async getOIDCState(state: string): Promise<any | null> {
    const data = await redis.get(`${this.STATE_PREFIX}${state}`);
    return data ? JSON.parse(data as string) : null;
  }

  static async clearOIDCState(state: string): Promise<void> {
    await redis.del(`${this.STATE_PREFIX}${state}`);
  }

  // Token Management
  static async storeTokens(userId: string, tokens: OIDCTokens): Promise<void> {
    await redis.set(`${this.TOKEN_PREFIX}${userId}`, JSON.stringify(tokens));
  }

  static async getTokens(userId: string): Promise<OIDCTokens | null> {
    const data = await redis.get(`${this.TOKEN_PREFIX}${userId}`);
    return data ? JSON.parse(data as string) : null;
  }

  // Utility Methods
  static async isSessionValid(sessionId: string): Promise<boolean> {
    return Boolean(await this.getSession(sessionId));
  }
}
