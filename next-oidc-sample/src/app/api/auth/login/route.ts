/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextApiRequest, NextApiResponse } from "next";
import { login } from "@/middleware/auth";
import "@/config/env"; // Ensure environment variables are loaded

export const dynamic = "force-dynamic";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await login(req, res); // Add middleware usage
  if (req.method === "POST") {
    try {
      const { username, password } = req.body;
      const tokens = await login(username, password);
      res.status(200).json(tokens);
    } catch (error) {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
