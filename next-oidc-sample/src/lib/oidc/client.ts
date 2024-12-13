/* eslint-disable @typescript-eslint/no-unused-vars */
import { redis } from "../redis/client"; // Update the import path
import type { SessionData, OIDCTokens } from "../context/types";
import { URLSearchParams } from "url";
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/oidc-utils";

const OIDC_AUTHORITY = process.env.OIDC_AUTHORITY!;
const CLIENT_ID = process.env.OIDC_CLIENT_ID!;
const REDIRECT_URI = process.env.OIDC_REDIRECT_URI!;
const SCOPE = "openid profile email";
const RESPONSE_TYPE = "code";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function someFunction(param: any) {
  // ...existing code...
}

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
  private static instance: OIDCClient;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private discoveryDocument: any;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): OIDCClient {
    if (!OIDCClient.instance) {
      OIDCClient.instance = new OIDCClient();
    }
    return OIDCClient.instance;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const response = await fetch(process.env.OIDC_DISCOVERY_URL!, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (!response.ok) {
        throw new Error("Failed to fetch OIDC discovery document");
      }

      this.discoveryDocument = await response.json();
      this.initialized = true;

      return this.discoveryDocument;
    } catch (error) {
      console.error("Failed to initialize OIDC client:", error);
      throw error;
    }
  }

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

  static async startAuthProcess() {
    const codeVerifier = await generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: RESPONSE_TYPE,
      scope: SCOPE,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    const authUrl = `${OIDC_AUTHORITY}/authorize?${params.toString()}`;

    return { authUrl, codeChallenge, codeVerifier };
  }

  static async handleCallback(code: string, codeVerifier: string) {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET!,
      redirect_uri: REDIRECT_URI,
      code: code,
      code_verifier: codeVerifier,
    });

    const response = await fetch(this.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error("Token exchange failed");
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
