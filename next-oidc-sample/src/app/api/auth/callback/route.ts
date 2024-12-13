/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextApiRequest, NextApiResponse } from "next";
import { getCodeVerifier } from "@/middleware/auth";
import { OIDCClient } from "@/lib/oidc/client";
import { SessionStore } from "@/lib/redis/store";
import { SessionData } from "@/types/session-types";

/**
 * Handles the OIDC callback.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */
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

      // Extract user information from tokens (assuming tokens contain user info)
      const user = {
        id: tokens.id_token, // Replace with actual user ID extraction logic
        name: "User Name", // Replace with actual user name extraction logic
        email: "user@example.com", // Replace with actual user email extraction logic
      };

      // Create a new session instance
      const sessionData = new SessionData({
        authenticated: true,
        tokens,
        user,
      });

      // Handle tokens and create a new session
      const sessionId = await SessionStore.createSession(sessionData);

      // Set the session ID in a cookie
      res.setHeader("Set-Cookie", `sessionId=${sessionId}; Path=/; HttpOnly`);

      // Return the tokens in the response
      res.status(200).json(tokens);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      res.status(500).json({ error: "Failed to handle callback" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
