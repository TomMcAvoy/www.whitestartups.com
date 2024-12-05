import { NextApiRequest, NextApiResponse } from "next";
import { handleCallback } from "@/middleware/auth"; // Corrected import path

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await handleCallback(req, res); // Add middleware usage
  // Middleware handles the rest
}
