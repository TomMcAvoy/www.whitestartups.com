import { NextResponse, NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  fetchOpenIdConfiguration,
  generateCodeVerifier,
  generateCodeChallenge,
} from "@/utils";
import { withSessionMiddleware } from "@/middleware/session";
import { NextApiResponse } from "next";

async function postHandler(req: NextRequest) {
  console.log("Received request to /api/auth/start");

  // Initialize session
  const apiResponse = NextResponse.next();

  await withSessionMiddleware(req as any, apiResponse);

  console.log("Session after initialization:", (req as any).session);

  const codeVerifier = generateCodeVerifier();
  const state = uuidv4();

  console.log("Generated codeVerifier:", codeVerifier);
  console.log("Generated state:", state);

  const codeChallenge = await generateCodeChallenge(codeVerifier);
  console.log("Generated codeChallenge:", codeChallenge);

  const openIdConfig = await fetchOpenIdConfiguration();
  const authorizationEndpoint = openIdConfig.authorization_endpoint;

  console.log("Fetched OpenID configuration:", openIdConfig);

  const client_id = process.env.GOOGLE_CLIENT_ID || "";
  const redirect_uri = process.env.GOOGLE_REDIRECT_URI || "";
  const scope = process.env.GOOGLE_SCOPE || "openid profile email";
  const code_challenge_method = "S256";

  const authorizationUrl = `${authorizationEndpoint}?${new URLSearchParams({
    client_id,
    response_type: "code",
    redirect_uri,
    scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method,
  }).toString()}`;

  (req as any).session.state = state;
  (req as any).session.codeVerifier = codeVerifier;

  console.log("Session state set:", (req as any).session.state);
  console.log("Session codeVerifier set:", (req as any).session.codeVerifier);
  console.log("Authorization URL:", authorizationUrl);

  await (req as any).session.save();

  return NextResponse.json({ url: authorizationUrl });
}

export const POST = postHandler;
