import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth"; // Corrected path
import { sessionManager } from "@/middleware/session-manager"; // Correct import for sessionManager

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
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // Authenticate user (implement your auth logic)
  const user = await authenticateUser(email, password);

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Create session
  const sessionResponse = await sessionManager.createSession({
    id: user.id,
    email: user.email,
  });

  return NextResponse.json({ session: sessionResponse });
}
