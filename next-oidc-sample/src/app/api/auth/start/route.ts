/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * OAuth 2.0 Authorization Code Flow with PKCE - Start Endpoint
 *
 * This endpoint initiates the OAuth 2.0 authorization code flow with PKCE (Proof Key for Code Exchange).
 * It handles:
 * 1. Session management - Creates/retrieves a session to store OAuth state
 * 2. PKCE generation - Creates code verifier and challenge
 * 3. Authorization URL construction - Builds the URL to redirect users to Google's consent page
 *
 * @param req - Next.js request object
 * @returns NextResponse with authorization URL
 *
 * Required Environment Variables:
 * - GOOGLE_CLIENT_ID: OAuth 2.0 client ID from Google Cloud Console
 * - GOOGLE_REDIRECT_URI: OAuth redirect URI registered in Google Cloud Console
 * - GOOGLE_SCOPE: OAuth scopes (defaults to "openid profile email")
 *
 * Session Data Stored:
 * - state: Random UUID used to prevent CSRF attacks
 * - codeVerifier: PKCE code verifier used to prove possession of the authorization
 */ import { NextResponse, NextRequest } from "next/server";
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
/**
 * @fileoverview OAuth 2.0 Authorization Code Flow with PKCE - Start Endpoint
 *
 * This module implements the initial endpoint for OAuth 2.0 authorization code flow
 * with PKCE (Proof Key for Code Exchange) authentication.
 *
 * Flow:
 * 1. Client makes POST request to /api/auth/start
 * 2. Endpoint creates/retrieves session to store OAuth state
 * 3. Generates PKCE code verifier and challenge
 * 4. Constructs authorization URL with required parameters
 * 5. Returns response with auth URL for client redirect
 *
 * @module auth/start
 *
 * @requires next/server
 * @requires uuid
 * @requires @/utils
 * @requires @/middleware/redis-store
 * @requires @/middleware/context
 *
 * Environment Variables:
 * @property {string} GOOGLE_CLIENT_ID - OAuth 2.0 client ID from Google Cloud Console
 * @property {string} GOOGLE_REDIRECT_URI - OAuth redirect URI registered in Google Cloud Console
 * @property {string} GOOGLE_SCOPE - OAuth scopes (defaults to "openid profile email")
 *
 * Session Storage:
 * @property {string} state - Random UUID used to prevent CSRF attacks
 * @property {string} codeVerifier - PKCE code verifier for authorization proof
 *
 * @function postHandler
 * @param {NextRequest} req - Next.js request object
 * @returns {Promise<NextResponse>} Response containing authorization URL
 *
 * @throws {Error} If session creation fails
 */
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
