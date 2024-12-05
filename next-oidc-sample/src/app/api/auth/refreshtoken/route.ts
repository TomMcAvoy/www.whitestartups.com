/* eslint-disable @typescript-eslint/no-unused-vars */
import "@/config/env"; // Ensure environment variables are loaded
import { NextApiRequest, NextApiResponse } from "next";
import { refreshToken } from "../../../middleware/auth";
import { refreshAccessToken } from "../../../lib/oidc/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await refreshToken(req, res); // Add middleware usage
  if (req.method === "POST") {
    try {
      const { refreshToken } = req.body;
      const newAccessToken = await refreshAccessToken(refreshToken);
      res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      res.status(500).json({ error: "Failed to refresh token" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
