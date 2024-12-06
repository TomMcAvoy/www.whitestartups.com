/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtVerify, JWTPayload } from "jose";
import { refreshAccessToken } from "@/utils/oidc-utils"; // Updated import path
import { SessionData } from "@/types/session-types";
import { sign } from "jsonwebtoken"; // Import jsonwebtoken library

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
  throw new Error("SECRET_KEY environment variable is not defined");
}

/**
 * Verifies a JWT token.
 * @param {string} token - The token to verify.
 * @param {string} secret - The secret key.
 * @returns {Promise<JWTPayload | null>} The token payload or null if verification fails.
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Refreshes the access token.
 * @param {SessionData} session - The session data.
 * @returns {Promise<string>} The new access token.
 */
export async function refreshTokens(session: SessionData): Promise<string> {
  try {
    const newAccessToken = await refreshAccessToken(
      session.refresh_token as string
    );
    session.access_token = newAccessToken;
    await session.save();
    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("Failed to refresh access token");
  }
}

/**
 * Sets the token expiry times.
 * @param {any} context - The context object.
 * @param {SessionData} session - The session data.
 */
export function setTokenExpiry(context: any, session: SessionData): void {
  context.refresh_token = session.refresh_token;
  context.id_token = session.id_token;
  context.refresh_token_expiry = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ); // 30 days expiry
  context.id_token_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day expiry
}

/**
 * Generates an access token.
 * @param {any} user - The user data.
 * @returns {Promise<string>} The access token.
 */
export async function generateAccessToken(user: any): Promise<string> {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    // ...other claims...
  };

  if (!secretKey) {
    throw new Error("SECRET_KEY is not defined");
  }

  return sign(payload, secretKey);
}

/**
 * Generates a refresh token.
 * @param {any} user - The user data.
 * @returns {Promise<string>} The refresh token.
 */
export async function generateRefreshToken(user: any): Promise<string> {
  const payload = {
    sub: user.id,
    type: "refresh",
    // ...other claims...
  };

  if (!secretKey) {
    throw new Error("SECRET_KEY is not defined");
  }

  return sign(payload, secretKey);
}

/**
 * Generates an ID token.
 * @param {any} user - The user data.
 * @returns {Promise<string>} The ID token.
 */
export async function generateIdToken(user: any): Promise<string> {
  const payload = {
    sub: user.id,
    email: user.email,
    // ...other claims...
  };

  if (!secretKey) {
    throw new Error("SECRET_KEY is not defined");
  }

  return sign(payload, secretKey);
}
