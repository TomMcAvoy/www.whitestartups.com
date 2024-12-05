import { OIDCTokens } from "./oidc-context";
import crypto from "crypto";

export async function fetchOpenIdConfiguration() {
  const response = await fetch(
    "https://accounts.google.com/.well-known/openid-configuration"
  );
  return await response.json();
}

export function generateCodeVerifier(): string {
  return crypto.randomUUID();
}

export async function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generatePKCE() {
  const code_verifier = generateCodeVerifier();
  const code_challenge = generateCodeChallenge(code_verifier);
  return { code_verifier, code_challenge };
}

export async function exchangeCodeForTokens({
  code,
  code_verifier,
  redirect_uri,
}: {
  code: string;
  code_verifier: string;
  redirect_uri: string;
}): Promise<OIDCTokens> {
  const openIdConfig = await fetchOpenIdConfiguration();
  const tokenEndpoint = openIdConfig.token_endpoint;

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri,
      client_id: process.env.CLIENT_ID || "",
      code_verifier,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for tokens");
  }

  return await response.json();
}

export async function refreshTokens(
  refresh_token: string
): Promise<OIDCTokens> {
  const openIdConfig = await fetchOpenIdConfiguration();
  const tokenEndpoint = openIdConfig.token_endpoint;

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
      client_id: process.env.CLIENT_ID || "",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh tokens");
  }

  return await response.json();
}

export async function verifyIdToken(id_token: string, nonce: string) {
  // Implement the logic to verify the ID token
  // ...
}

export async function createSession({
  userId,
  email,
  tokens,
}: {
  userId: string;
  email: string;
  tokens: OIDCTokens;
}) {
  // Implement the logic to create a session
  // ...
}

export async function updateSession(
  sessionId: string,
  { tokens }: { tokens: OIDCTokens }
) {
  // Implement the logic to update the session with new tokens
  // ...
}

export async function getSession(sessionId: string) {
  // Implement the logic to get the session by sessionId
  // ...
}

export function generateRandomState(): string {
  return crypto.randomUUID();
}
