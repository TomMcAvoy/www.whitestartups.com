import { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/edge";

interface NextApiRequestWithSession extends NextApiRequest {
  session: {
    get: (key: string) => unknown;
    set: (key: string, value: unknown) => void;
    save: () => Promise<void>;
  };
}

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "myapp_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

const password = async (
  req: NextApiRequestWithSession,
  res: NextApiResponse
) => {
  if (!req.session.get("user")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  res.status(200).json({ message: "Authorized" });
};

export default withIronSessionApiRoute(password, sessionOptions);
