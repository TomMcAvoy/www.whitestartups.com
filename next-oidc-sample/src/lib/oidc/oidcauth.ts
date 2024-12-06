import { OIDCConfig } from "@/lib/oidc/config";
import { OIDCState, OIDCTokens } from "@/lib/context/types";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  exchangeCodeForTokens,
  refreshTokens,
} from "@/lib/oidc-utils";
import jwt from "jsonwebtoken";

interface TokenPayload {
  sub: string;
  email?: string;
  name?: string;
  exp?: number;
  iat?: number;
}

export const verifyToken = (token: string): Promise<TokenPayload> => {
  return new Promise((resolve, reject) => {
    if (!process.env.JWT_SECRET) {
      reject(new Error("JWT_SECRET is not configured"));
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(decoded as TokenPayload);
    });
  });
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
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    const code_verifier = generateCodeVerifier();
    const code_challenge = await generateCodeChallenge(code_verifier);

    const params = new URLSearchParams({
      client_id: OIDCConfig.client_id,
      response_type: "code",
      scope: OIDCConfig.scope,
      redirect_uri: OIDCConfig.redirect_uri,
      state,
      nonce,
      code_challenge,
      code_challenge_method: "S256",
    });

    return {
      url: `${OIDCConfig.authority}/authorize?${params.toString()}`,
      state: {
        state,
        nonce,
        code_verifier,
        redirect_uri: OIDCConfig.redirect_uri,
      },
    };
  }

  static async handleCallback(
    code: string,
    storedState: OIDCState
  ): Promise<OIDCTokens> {
    return await exchangeCodeForTokens({
      code,
      code_verifier: storedState.code_verifier,
      redirect_uri: storedState.redirect_uri,
    });
  }

  static async refreshTokens(refresh_token: string): Promise<OIDCTokens> {
    return await refreshTokens(refresh_token);
  }
}
