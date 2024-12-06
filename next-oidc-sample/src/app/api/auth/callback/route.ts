import { NextApiRequest, NextApiResponse } from "next";
import { getCodeVerifier } from "@/middleware/auth";
import { OIDCClient } from "@/lib/oidc/client";
import { SessionStore } from "@/lib/redis/store";
import { SessionData } from "@/types/session-types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      // Retrieve the code verifier from the request context
      const codeVerifier = getCodeVerifier(req);
      if (!codeVerifier) {
        return res.status(400).json({ error: "Code verifier not found" });
      }

      // Retrieve the authorization code from the query parameters
      const code = req.query.code as string;
      if (!code) {
        return res.status(400).json({ error: "Authorization code not found" });
      }

      // Exchange the authorization code for tokens
      const tokens = await OIDCClient.handleCallback(code, codeVerifier);

      // Handle tokens and create a new session
      const sessionId = await SessionStore.createSession({
        tokens,
        user: {
          /* user information from tokens */
        },
      });

      // Set the session ID in a cookie
      res.setHeader("Set-Cookie", `sessionId=${sessionId}; Path=/; HttpOnly`);

      // Return the tokens in the response
      res.status(200).json(tokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to handle callback" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
