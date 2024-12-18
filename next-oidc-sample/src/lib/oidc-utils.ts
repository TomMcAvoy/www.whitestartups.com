/* eslint-disable @typescript-eslint/no-unused-vars */
import { OIDCTokens } from "./context/types";
import crypto from "crypto";
import { SessionStore } from "../redis/store";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { V4 } from "paseto";

// Fetch OpenID configuration from the provider
export async function fetchOpenIdConfiguration() {
  const response = await fetch(
    "https://accounts.google.com/.well-known/openid-configuration"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch OpenID configuration");
  }
  return await response.json();
}

// Generate a code verifier for PKCE
export function generateCodeVerifier(): string {
  return crypto.randomUUID();
}

// Generate a code challenge for PKCE
export async function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Generate PKCE pair (code verifier and code challenge)
export function generatePKCE() {
  const code_verifier = generateCodeVerifier();
  const code_challenge = generateCodeChallenge(code_verifier);
  return { code_verifier, code_challenge };
}

// Exchange authorization code for tokens
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

// Refresh tokens using a refresh token
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

// Verify ID token using JWKS (JSON Web Key Set) or PASETO
export async function verifyIdToken(
  id_token: string,
  nonce: string,
  tokenType: "jwt" | "paseto"
) {
  if (tokenType === "jwt") {
    const openIdConfig = await fetchOpenIdConfiguration();
    const client = jwksClient({
      jwksUri: openIdConfig.jwks_uri,
    });

    function getKey(header, callback) {
      client.getSigningKey(header.kid, function (err, key) {
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      });
    }

    return new Promise((resolve, reject) => {
      jwt.verify(
        id_token,
        getKey,
        { algorithms: ["RS256"] },
        (err, decoded) => {
          if (err) {
            return reject(err);
          }
          if (decoded.nonce !== nonce) {
            return reject(new Error("Invalid nonce"));
          }
          resolve(decoded);
        }
      );
    });
  } else if (tokenType === "paseto") {
    try {
      const decoded = await V4.verify(id_token, process.env.PASETO_PUBLIC_KEY);
      if (decoded.nonce !== nonce) {
        throw new Error("Invalid nonce");
      }
      return decoded;
    } catch (err) {
      throw new Error("Failed to verify PASETO token");
    }
  }
}

// Create a new session in the session store
export async function createSession({
  userId,
  email,
  tokens,
}: {
  userId: string;
  email: string;
  tokens: OIDCTokens;
}) {
  const session = {
    userId,
    email,
    tokens,
    createdAt: new Date(),
    accessTokenExpiresAt: new Date(tokens.expires_at * 1000), // Convert expires_at to Date
    idTokenExpiresAt: new Date(tokens.id_token_expires_at * 1000), // Assuming id_token_expires_at is provided
    refreshTokenExpiresAt: tokens.refresh_token_expires_at
      ? new Date(tokens.refresh_token_expires_at * 1000)
      : null, // Assuming refresh_token_expires_at is provided
  };
  await SessionStore.createSession(session);
}

// Update an existing session in the session store
export async function updateSession(
  sessionId: string,
  { tokens }: { tokens: OIDCTokens }
) {
  const session = await SessionStore.getSession(sessionId);
  if (session) {
    session.tokens = tokens;
    session.accessTokenExpiresAt = new Date(tokens.expires_at * 1000); // Convert expires_at to Date
    session.idTokenExpiresAt = new Date(tokens.id_token_expires_at * 1000); // Assuming id_token_expires_at is provided
    session.refreshTokenExpiresAt = tokens.refresh_token_expires_at
      ? new Date(tokens.refresh_token_expires_at * 1000)
      : null; // Assuming refresh_token_expires_at is provided
    await SessionStore.updateSession(sessionId, session);
  }
}

// Retrieve a session from the session store
export async function getSession(sessionId: string): Promise<Session | null> {
  const session = await SessionStore.getSession(sessionId);
  if (!session) {
    return null;
  }
  return {
    userId: session.userId,
    email: session.email,
    tokens: session.tokens,
    createdAt: new Date(session.createdAt),
    accessTokenExpiresAt: new Date(session.accessTokenExpiresAt),
    idTokenExpiresAt: new Date(session.idTokenExpiresAt),
    refreshTokenExpiresAt: session.refreshTokenExpiresAt
      ? new Date(session.refreshTokenExpiresAt)
      : null,
  };
}

// Generate a random state parameter for OIDC
export function generateRandomState(): string {
  return crypto.randomUUID();
}

// Generate the authorization URL
export function generateAuthorizationUrl({
  redirect_uri,
  state,
  code_challenge,
  scope = "openid profile email",
}: {
  redirect_uri: string;
  state: string;
  code_challenge: string;
  scope?: string;
}): string {
  const openIdConfig = await fetchOpenIdConfiguration();
  const authorizationEndpoint = openIdConfig.authorization_endpoint;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.CLIENT_ID || "",
    redirect_uri,
    scope,
    state,
    code_challenge,
    code_challenge_method: "S256",
  });

  return `${authorizationEndpoint}?${params.toString()}`;
}

// Handle the redirect from the authorization server
export function handleRedirect(req: Request): { code: string; state: string } {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    throw new Error("Missing code or state in the redirect URL");
  }

  return { code, state };
}

// Device Authorization Grant
export async function deviceAuthorizationGrant() {
  const openIdConfig = await fetchOpenIdConfiguration();
  const deviceAuthorizationEndpoint =
    openIdConfig.device_authorization_endpoint;

  const response = await fetch(deviceAuthorizationEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID || "",
      scope: "openid profile email",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to initiate device authorization grant");
  }

  return await response.json();
}

// Pushed Authorization Requests
export async function pushedAuthorizationRequest(params: URLSearchParams) {
  const openIdConfig = await fetchOpenIdConfiguration();
  const pushedAuthorizationRequestEndpoint =
    openIdConfig.pushed_authorization_request_endpoint;

  const response = await fetch(pushedAuthorizationRequestEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    throw new Error("Failed to initiate pushed authorization request");
  }

  return await response.json();
}
