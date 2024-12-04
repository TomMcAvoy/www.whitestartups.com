/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtVerify, JWTPayload } from "jose";
import { refreshAccessToken } from "@/utils/oidc-utils"; // Updated import path
import { SessionData } from "@/types/session-types";
import { V4 } from "paseto"; // Import PASETO library

const { sign } = V4; // Remove unused 'verify'

const secretKey = process.env.PASETO_SECRET_KEY;

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

export function setTokenExpiry(context: any, session: SessionData): void {
  context.refresh_token = session.refresh_token;
  context.id_token = session.id_token;
  context.refresh_token_expiry = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ); // 30 days expiry
  context.id_token_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day expiry
}

export async function generateAccessToken(user: any): Promise<string> {
  const payload = {
    sub: user.id,
    email: user.email,
    // ...other claims...
  };
  return await sign(payload, secretKey);
}

export async function generateRefreshToken(user: any): Promise<string> {
  const payload = {
    sub: user.id,
    type: "refresh",
    // ...other claims...
  };
  return await sign(payload, secretKey);
}

export async function generateIdToken(user: any): Promise<string> {
  const payload = {
    sub: user.id,
    email: user.email,
    // ...other claims...
  };
  return await sign(payload, secretKey);
}