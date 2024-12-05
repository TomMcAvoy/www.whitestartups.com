import { NextApiRequest, NextApiResponse } from "next";
import { refresh } from "../../../middleware/auth";
import { Redis } from "@upstash/redis";
import { ContextManager, OIDCContext } from "../../../lib/context";
import { refreshTokens } from "../../../lib/oidc/tokens";
import { redis } from "../../../lib/redis-store"; // Updated import

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await refresh(req, res); // Add middleware usage

  const sessionId = ContextManager.get(req, OIDCContext.SESSION_ID);

  if (!sessionId) {
    return res.status(401).json({ error: "No session" });
  }

  const session = await redis.get(`session:${sessionId}`);
  if (!session) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const { tokens } = JSON.parse(session as string);

  try {
    const newTokens = await refreshTokens(tokens.refresh_token);

    // Update session with new tokens
    await redis.set(
      `session:${sessionId}`,
      JSON.stringify({
        ...JSON.parse(session as string),
        tokens: newTokens,
      })
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Token refresh failed:", error);
    return res.status(401).json({ error: "Refresh failed" });
  }
}
