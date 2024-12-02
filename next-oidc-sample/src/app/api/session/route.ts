/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { withSessionMiddleware } from "@/middleware/session";
import initializeSession from "next-session";
import { v4 as uuidv4 } from "uuid";
import {
  fetchOpenIdConfiguration,
  generateCodeVerifier,
  generateCodeChallenge,
} from "@/utils";
import { withSession, createSession } from "@/middleware/redis-store";
import { createContext } from "@/middleware/context";
import { SessionData, RequestWithSession } from "@middleware/

const handler = async (req: NextRequest) => {
  const res = NextResponse.next();

  // Initialize session
  await initializeSession()(req as any, res as any);
  await withSessionMiddleware(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (req: NextRequest, res: NextResponse) => {
      // Handler logic here
    }
  )(req as any, res as any);

  const session = (req as any).session;
  session.id = session.id || "generated-id"; // Ensure id exists
  session.touch = session.touch || (() => {}); // Ensure touch method exists
  session.commit = session.commit || (async () => {}); // Ensure commit method exists
  session.destroy = session.destroy || (async () => {}); // Ensure destroy method exists

  if (!session.access_token || !session.id_token) {
    return NextResponse.json({ error: "No session found" }, { status: 404 });
  }

  return NextResponse.json({
    access_token: session.access_token,
    id_token: session.id_token,
  });
};

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

export const GET = async (request: NextRequest) => {
  const context = await createContext(request, NextResponse.next());
  await withSessionMiddleware(context.req, context.res);
  const { session } = context.req as RequestWithSession;
  return NextResponse.json({ session });
};

export const POST = async (request: NextRequest) => {
  const data = await request.json();
  const { sessionId } = await createSession(data);
  const response = NextResponse.json({ success: true });
  return setSessionCookie(response, sessionId);
};
