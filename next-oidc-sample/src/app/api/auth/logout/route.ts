import { NextApiRequest, NextApiResponse } from "next";
import { logout } from "@/middleware/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await logout(req, res); // Add middleware usage
  if (req.method === "POST") {
    try {
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      res.status(500).json({ error: "Failed to handle logout" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
