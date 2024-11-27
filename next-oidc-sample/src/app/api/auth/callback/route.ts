import { NextResponse, NextRequest } from "next/server";
import { fetchOpenIdConfiguration } from "@/utils";
import { local_session } from "@/middleware/session";
import { NextApiResponse } from "next";

const handler = async (req: NextRequest) => {
  console.log("Callback route invoked"); // Debug log

  // Initialize session
  const apiResponse = NextResponse.next() as unknown as NextApiResponse;

  await local_session(req as unknown, apiResponse);

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

  const codeVerifier = (req as unknown as any).session.codeVerifier;

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

  // Store the tokens in the session
  (req as unknown as any).session.access_token = tokenData.access_token;
  (req as unknown as any).session.id_token = tokenData.id_token;

  return NextResponse.redirect("/");
};

export { handler as GET };
