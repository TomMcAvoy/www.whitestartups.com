import crypto from "crypto";

export async function fetchOpenIdConfiguration() {
  const response = await fetch(
    "https://accounts.google.com/.well-known/openid-configuration"
  );
  return await response.json();
}

export function generateCodeVerifier() {
  const array = new Uint32Array(56 / 2);
  crypto.getRandomValues(array);
  return Array.from(array, (dec) => ("0" + dec.toString(16)).substr(-2)).join(
    ""
  );
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

export async function exchangeCodeForToken(code: string, codeVerifier: string) {
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
      redirect_uri: process.env.REDIRECT_URI || "",
      client_id: process.env.CLIENT_ID || "",
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for tokens");
  }

  return await response.json();
}

export async function refreshAccessToken(refreshToken: string) {
  const openIdConfig = await fetchOpenIdConfiguration();
  const tokenEndpoint = openIdConfig.token_endpoint;

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.CLIENT_ID || "",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  return await response.json();
}
