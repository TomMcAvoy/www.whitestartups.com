import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { validateCsrfToken } from "@/utils/csrf";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export function authMiddleware(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const sessionId = req.cookies.session_id;
      const csrfToken = req.cookies.csrf_token;

      if (!sessionId || !csrfToken) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Validate the CSRF token
      const validCsrfToken = await validateCsrfToken(csrfToken);
      if (!validCsrfToken) {
        return res.status(401).json({ error: "Invalid CSRF token" });
      }

      // Retrieve the session data from Redis
      const sessionData = await redis.get(sessionId);
      if (!sessionData || !sessionData.authenticated) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Attach session data to the request object
      req.session = sessionData;

      return handler(req, res);
    } catch (error) {
      console.error("Error in authMiddleware:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
