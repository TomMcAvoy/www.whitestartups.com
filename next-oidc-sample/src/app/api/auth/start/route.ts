import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  fetchOpenIdConfiguration,
  generateCodeVerifier,
  generateCodeChallenge,
} from "@/utils";
import session from "@/middleware/session"; // Changed import
import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession } from "next-iron-session";

interface NextRequestWithSession extends NextRequest {
  session: {
    state: string;
    codeVerifier: string;
    get: (key: string) => string | undefined;
    set: (key: string, value: string) => void;
    save: () => Promise<void>;
  };
}

async function postHandler(req: NextRequest) {
  console.log("Received request to /api/auth/start");

  // Convert NextRequest to NextApiRequest
  const apiRequest = req as unknown as NextApiRequest;
  const apiResponse = NextResponse.next() as unknown as NextApiResponse;

  // Initialize session
  await new Promise<void>((resolve, reject) => {
    session(apiRequest, apiResponse, (err: unknown) => {
      if (err) {
        console.error("Session error:", err);
        return reject(err);
      }
      resolve();
    });
  });

  const apiReqWithSession = apiRequest as unknown as NextRequestWithSession;

  console.log("Session after initialization:", apiReqWithSession.session);

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

  apiReqWithSession.session.state = state;
  apiReqWithSession.session.codeVerifier = codeVerifier;

  console.log("Session state set:", apiReqWithSession.session.state);
  console.log(
    "Session codeVerifier set:",
    apiReqWithSession.session.codeVerifier
  );
  console.log("Authorization URL:", authorizationUrl);

  await apiReqWithSession.session.save();

  return NextResponse.json({ url: authorizationUrl });
}

export const POST = withIronSession(postHandler, {
  password:
    process.env.SECRET_COOKIE_PASSWORD ||
    "complex_password_at_least_32_characters_long",
  cookieName: "next-iron-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
});
