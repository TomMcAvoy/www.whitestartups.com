import { NextApiRequest, NextApiResponse } from "next";
import { protectedRoute } from "@/middleware/auth";
import { verifyToken } from "@/lib/oidc/oidcauth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await protectedRoute(req, res); // Add middleware usage

  if (req.method === "GET") {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }
      const user = await verifyToken(token);
      res.status(200).json({ user });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      res.status(500).json({ error: "Failed to handle protected route" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
