/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  updateSessionData as updateSessionDataInStore,
  deleteSession as deleteSessionData,
  RequestWithSession,
  redisClient,
} from "@/middleware/redis-store";
import { NextRequest, NextResponse } from "next/server";
import { SessionData } from "@/types/session-types"; // Import SessionData

// Ensure there are no references to next-auth or lucia

// Client configuration for OpenID Connect
export const clientConfig = {
  url: process.env.OIDC_AUTHORITY || "",
  audience: process.env.GOOGLE_AUTH_URL,
  client_id: process.env.GOOGLE_CLIENT_ID || "",
  scope: process.env.NEXT_PUBLIC_SCOPE || "",
  redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
  post_logout_redirect_uri: process.env.OIDC_POST_LOGOUT_REDIRECT_URI || "",
  response_type: "code",
  grant_type: "authorization_code",
};

// Default session data
export const defaultSession: SessionData = {
  id: undefined,
  isLoggedIn: false,
  access_token: undefined,
  code_verifier: undefined,
  state: undefined,
  userInfo: undefined,
};

// Function to get the current session data
export async function getSession(
  context: RequestContext
): Promise<SessionData> {
  const sessionId = context.sessionId;
  if (!sessionId) {
    return defaultSession;
  }

  const sessionData = await redisClient.get(`sess:${sessionId}`);
  if (!sessionData) {
    return defaultSession;
  }

  return JSON.parse(sessionData);
}

// Function to set session data
export async function setSession(
  context: RequestContext,
  data: Partial<SessionData>
): Promise<void> {
  const sessionId = context.sessionId;
  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  const sessionData = {
    ...context.session,
    ...data,
    save: context.session.save,
    destroy: context.session.destroy,
  };

  await updateSessionDataInStore(sessionId, sessionData, 86400);
}

// Function to update session data
export async function updateSession(
  context: RequestContext,
  data: Partial<Omit<RequestWithSession["session"], "save" | "destroy">>
): Promise<void> {
  const sessionId = context.sessionId;
  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  const sessionData = {
    ...context.session,
    ...data,
  };

  await updateSessionDataInStore(sessionId, sessionData, 86400);
}

// Function to destroy session data
export async function destroySession(context: RequestContext): Promise<void> {
  const sessionId = context.sessionId;
  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  await deleteSessionData(sessionId);
}

// Function to get the client configuration
export async function getClientConfig() {
  if (!clientConfig.url) {
    throw new Error("OIDC_AUTHORITY is not defined");
  }
  return clientConfig;
}

// Function to set cookies in the response
export function setCookie(res: NextResponse, cookies: string[]) {
  let existingSetCookie = res.headers.get("set-cookie");
  if (!existingSetCookie) {
    existingSetCookie = "";
  } else if (!Array.isArray(existingSetCookie)) {
    existingSetCookie = [existingSetCookie].join(", ");
  }
  res.headers.set("set-cookie", [...existingSetCookie, ...cookies].join(", "));
}
