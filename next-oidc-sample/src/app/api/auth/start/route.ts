import { NextApiRequest, NextApiResponse } from "next";
import { start } from "@/middleware/auth";
import { OIDCClient } from "@/lib/oidc/client";
import { setCodeChallenge, setCodeVerifier } from "@/middleware/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await start(req, res); // Add middleware usage
  if (req.method === "GET") {
    try {
      const { authUrl, codeChallenge, codeVerifier } =
        await OIDCClient.startAuthProcess();
      setCodeChallenge(req, codeChallenge);
      setCodeVerifier(req, codeVerifier);
      res.redirect(authUrl);
    } catch (error) {
      res.status(500).json({ error: "Failed to start authentication process" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
