/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse, NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  fetchOpenIdConfiguration,
  generateCodeVerifier,
  generateCodeChallenge,
} from "@/utils";
import { withSession, createSession } from "@/middleware/redis-store";
import { createContext } from "@/middleware/context";

interface SessionData {
  state: string;
  codeVerifier: string;
  [key: string]: any;
}

async function postHandler(req: NextRequest) {
  console.log("Received request to /api/auth/start");

  // Initialize session
  const res = NextResponse.next();

  const context = await createContext(req, res, {
    enhanceContext: (ctx) => {
      ctx.request = req;
      ctx.response = res;
      return Promise.resolve();
    },
  });

  let { session } = (await withSession(context)) as {
    session: SessionData | null;
  };

  // If no session exists, create one
  if (!session) {
    const { sessionId } = await createSession({});
    const newContext = await createContext(req, res, {
      enhanceContext: (ctx) => {
        ctx.request = req;
        ctx.response = res;
        ctx.sessionId = sessionId;
        return Promise.resolve();
      },
    });
    ({ session } = (await withSession(newContext)) as {
      session: SessionData | null;
    });
  }

  // Now we can safely assert that session exists
  if (!session) {
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }

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

  session.state = state;
  session.codeVerifier = codeVerifier;

  console.log("Session state set:", session.state);
  console.log("Session codeVerifier set:", session.codeVerifier);
  console.log("Authorization URL:", authorizationUrl);

  await session.save();

  return res;
}

export const POST = postHandler;
