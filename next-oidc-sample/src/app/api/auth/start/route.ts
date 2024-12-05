import { NextApiRequest, NextApiResponse } from "next";
import { start } from "../../../middleware/auth";
import { startAuthProcess } from "../../../lib/oidc/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await start(req, res); // Add middleware usage
  if (req.method === "GET") {
    try {
      const authUrl = await startAuthProcess();
      res.redirect(authUrl);
    } catch (error) {
      res.status(500).json({ error: "Failed to start authentication process" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
