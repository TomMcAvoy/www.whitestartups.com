import { NextRequest, NextResponse } from "next/server";
import { withIronSessionApiRoute } from "iron-session/edge";

interface Cookies {
  get: (name: string) => string | undefined;
}

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "myapp_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

const handler = async (req: NextRequest) => {
  const cookies = req.cookies as unknown as Cookies;
  const accessToken = cookies.get("access_token");
  const idToken = cookies.get("id_token");

  if (!accessToken || !idToken) {
    return NextResponse.json({ error: "No session found" }, { status: 404 });
  }

  // Optionally, validate the tokens here

  return NextResponse.json({
    access_token: accessToken,
    id_token: idToken,
  });
};

export const GET = withIronSessionApiRoute(handler, sessionOptions);
