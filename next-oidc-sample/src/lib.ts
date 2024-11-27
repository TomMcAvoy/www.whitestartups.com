import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import session from "next-session";

// Ensure there are no references to next-auth or lucia

export const clientConfig = {
  url: process.env.OIDC_AUTHORITY || "",
  audience: process.env.GOOGLE_AUTH_URL,
  client_id: process.env.GOOGLE_CLIENT_ID || "",
  scope: process.env.NEXT_PUBLIC_SCOPE || "",
  redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
  post_logout_redirect_uri: process.env.OIDC_POST_LOGOUT_REDIRECT_URI || "",
  response_type: "code",
  grant_type: "authorization_code",
  post_login_route: process.env.NEXT_PUBLIC_SERVER_URL || "",
  code_challenge_method: "S256",
};

export interface SessionData {
  isLoggedIn: boolean;
  access_token?: string;
  code_verifier?: string;
  state?: string;
  userInfo?: {
    sub: string;
    name: string;
    email: string;
    email_verified: boolean;
  };
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
  access_token: undefined,
  code_verifier: undefined,
  state: undefined,
  userInfo: undefined,
};

const sessionOptions = {
  name: "next.js.session",
  secret: process.env.SECRET_COOKIE_PASSWORD || "default_password",
  cookie: {
    secure: process.env.NODE_ENV === "production",
  },
};

export const local_session = session(sessionOptions);

export async function getSession(
  req: NextApiRequest | NextRequest,
  res: NextApiResponse | NextResponse
): Promise<SessionData> {
  await local_session(req as unknown, res as unknown);
  const session = (req as unknown as any).session as SessionData;
  if (!session.isLoggedIn) {
    session.access_token = defaultSession.access_token;
    session.userInfo = defaultSession.userInfo;
  }
  return session;
}

export async function getClientConfig() {
  if (!clientConfig.url) {
    throw new Error("OIDC_AUTHORITY is not defined");
  }
  return clientConfig;
}

export function setCookie(res: NextResponse, cookies: string[]) {
  let existingSetCookie = res.headers.get("set-cookie");
  if (!existingSetCookie) {
    existingSetCookie = "";
  } else if (!Array.isArray(existingSetCookie)) {
    existingSetCookie = [existingSetCookie].join(", ");
  }
  res.headers.set("set-cookie", [...existingSetCookie, ...cookies].join(", "));
}
