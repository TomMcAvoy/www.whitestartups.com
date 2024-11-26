import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession, Session } from "next-iron-session";

interface NextApiRequestWithSession extends NextApiRequest {
  session: Session;
}

const sessionPassword =
  process.env.SECRET_COOKIE_PASSWORD || "default_password";

export function session(
  req: NextApiRequest,
  res: NextApiResponse,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  next: (err?: unknown) => void
) {
  console.log("Initializing session...");
  withIronSession(
    async (req: NextApiRequestWithSession, res: NextApiResponse) => {
      console.log("Session initialized:", req.session);

      // Allow unauthenticated requests to /api/auth/start and /api/auth/callback
      if (req.url === "/api/auth/start" || req.url === "/api/auth/callback") {
        next();
        return;
      }

      if (!req.session.get("user")) {
        console.log("Unauthorized access attempt");
        res.status(401).json({ message: "middleware unauthorized" });
        return;
      }
      next();
    },
    {
      password: sessionPassword,
      cookieName: "myapp_session",
      cookieOptions: {
        secure: process.env.NODE_ENV === "production",
      },
    }
  )(req, res);
}
