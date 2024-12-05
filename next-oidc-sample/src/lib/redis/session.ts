import { redis } from "./client";
import type { SessionData } from "../context/types";

export class SessionStore {
  static async create(sessionData: SessionData): Promise<string> {
    const sessionId = crypto.randomUUID();
    await redis.set(`session:${sessionId}`, JSON.stringify(sessionData));
    return sessionId;
  }

  static async get(sessionId: string): Promise<SessionData | null> {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data as string) : null;
  }

  static async update(
    sessionId: string,
    sessionData: Partial<SessionData>
  ): Promise<void> {
    const existing = await this.get(sessionId);
    if (!existing) throw new Error("Session not found");

    await redis.set(
      `session:${sessionId}`,
      JSON.stringify({
        ...existing,
        ...sessionData,
      })
    );
  }

  static async delete(sessionId: string): Promise<void> {
    await redis.del(`session:${sessionId}`);
  }
}
