import { redis } from "./client";
import type { SessionData, OIDCTokens } from "../context/types";

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

  static async exists(sessionId: string): Promise<boolean> {
    const exists = await redis.exists(`session:${sessionId}`);
    return exists === 1;
  }

  static async revokeTokens(token: string): Promise<void> {
    const params = new URLSearchParams({
      token: token,
      client_id: process.env.CLIENT_ID!,
      client_secret: process.env.CLIENT_SECRET!,
    });

    const response = await fetch(`${process.env.OIDC_AUTHORITY}/revoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error("Token revocation failed");
    }
  }
}

export class OIDCClient {
  private static readonly tokenEndpoint = `${process.env.OIDC_AUTHORITY}/token`;

  static async refreshTokens(refresh_token: string): Promise<OIDCTokens> {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.CLIENT_ID!,
      client_secret: process.env.CLIENT_SECRET!,
      refresh_token: refresh_token,
    });

    const response = await fetch(this.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();

    return {
      access_token: data.access_token,
      id_token: data.id_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    };
  }
}
