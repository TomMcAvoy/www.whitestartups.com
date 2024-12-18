/* eslint-disable @typescript-eslint/no-unused-vars */
import { getOIDCConfig } from "@/lib/oidc/config";
import { OIDCState, OIDCTokens } from "@/lib/context/types";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  exchangeCodeForTokens,
  refreshTokens,
} from "@/lib/oidc-utils";
import jwt from "jsonwebtoken";
import { SessionStore } from "../redis/store";
import { TokenVerifier } from "@/lib/tokens/verify";

interface TokenPayload {
  sub: string;
  email?: string;
  name?: string;
  exp?: number;
  iat?: number;
}

export const verifyToken = async (token: string): Promise<TokenPayload> => {
  const verifier = new TokenVerifier(process.env.JWT_SECRET!);
  const payload = await verifier.verifyToken(token);
  if (!payload) {
    throw new Error("Token verification failed");
  }
  return payload;
};

export const createToken = (payload: Partial<TokenPayload>): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d", // Token expires in 1 day
  });
};

export const refreshToken = async (token: string): Promise<string> => {
  try {
    const decoded = await verifyToken(token);

    // Create new token with fresh expiration
    const newToken = createToken({
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name,
    });

    return newToken;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new Error("Invalid token for refresh");
  }
};

// Helper to extract token from Authorization header
export const extractTokenFromHeader = (authHeader?: string): string => {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Invalid authorization header");
  }

  return authHeader.substring(7);
};

export class OIDCAuth {
  static async createAuthRequest(): Promise<{ url: string; state: OIDCState }> {
    const config = getOIDCConfig();
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    const code_verifier = generateCodeVerifier();
    const code_challenge = await generateCodeChallenge(code_verifier);

    const params = new URLSearchParams({
      client_id: config.client.id,
      response_type: "code",
      scope: config.scopes.join(" "),
      redirect_uri: config.client.redirectUri,
      state,
      nonce,
      code_challenge,
      code_challenge_method: "S256",
    });

    await SessionStore.storeOIDCState(state, { nonce, code_verifier });

    return {
      url: `${config.endpoints.authorization}?${params.toString()}`,
      state: {
        state,
        nonce,
        code_verifier,
        redirect_uri: config.client.redirectUri,
      },
    };
  }

  static async handleCallback(
    code: string,
    storedState: OIDCState
  ): Promise<OIDCTokens> {
    const oidcState = await SessionStore.getOIDCState(storedState.state);
    if (!oidcState) {
      throw new Error("Invalid state");
    }

    const tokens = await exchangeCodeForTokens({
      code,
      code_verifier: oidcState.code_verifier,
      redirect_uri: storedState.redirect_uri,
    });

    await SessionStore.clearOIDCState(storedState.state);

    // Store tokens with expiry time
    await SessionStore.storeTokens(tokens);

    return tokens;
  }

  static async refreshTokens(refresh_token: string): Promise<OIDCTokens> {
    return await refreshTokens(refresh_token);
  }
}
