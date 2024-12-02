import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth"; // Corrected path
import { Redis } from "@upstash/redis";

/**
 * Handles the login process for the application.
 *
 * This function is the request handler for the POST method on the `/api/login` route.
 * It authenticates the user using the provided email and password, and if successful,
 * creates a new session for the user and returns the session response.
 *
 * @param req - The NextRequest object containing the request data.
 * @returns The NextResponse object with the session information or an error response.
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // Authenticate user (implement your auth logic)
  const user = await authenticateUser(email, password);

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Create session
  const sessionId = req.cookies.get("session_id")?.value; // Ensure sessionId is a string
  if (sessionId) {
    const sessionData = await redis.get(sessionId);
    // ...existing code...
  }

  return NextResponse.json({ session: sessionResponse });
}
