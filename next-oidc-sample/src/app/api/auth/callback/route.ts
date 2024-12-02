import { NextResponse, NextRequest } from "next/server";
import { fetchOpenIdConfiguration } from "@/utils";
import {
  createContext,
  addCodeVerifier,
  ensureSession,
  ContextRequest,
} from "@/middleware/context";
import { Session } from "@/middleware/session"; // Import Session interface

const handler = async (req: NextRequest) => {
  console.log("Callback route invoked"); // Debug log

  const res = NextResponse.next();
  const contextReq = await createContext(req, res, {
    enhanceContext: async (context) => {
      await addCodeVerifier(context);
      await ensureSession(context);
    },
  });
  const context = contextReq.context as ContextRequest["context"];

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 }
    );
  }

  const openIdConfig = await fetchOpenIdConfiguration();
  const tokenEndpoint = openIdConfig.token_endpoint;

  const codeVerifier = context.codeVerifier as string; // Ensure codeVerifier is typed as string

  if (!codeVerifier) {
    return NextResponse.json(
      { error: "Missing code verifier" },
      { status: 400 }
    );
  }

  // Exchange the authorization code for tokens
  const tokenResponse = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: code || "",
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return NextResponse.json(
      { error: "Failed to exchange authorization code for tokens" },
      { status: tokenResponse.status }
    );
  }

  // Ensure context.session is defined before storing tokens
  if (!context.session) {
    context.session = { id: context.sessionId || "" } as Session;
  }
  context.session.access_token = tokenData.access_token;
  context.session.jwt = tokenData.access_token; // Assign session.jwt equal to access_token
  context.id_token = tokenData.id_token; // Store id_token in the context

  return NextResponse.redirect("/");
};

export const GET = handler;
