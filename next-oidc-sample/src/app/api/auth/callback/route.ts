import { NextApiRequest, NextApiResponse } from "next";
import { callback } from "../../../middleware/auth";
import { handleAuthCallback } from "../../../lib/oidc/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await callback(req, res); // Add middleware usage
  if (req.method === "GET") {
    try {
      const { code } = req.query;
      const tokens = await handleAuthCallback(code as string);
      res.status(200).json(tokens);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to handle authentication callback" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
