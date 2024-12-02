import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth"; // Corrected path
import { sessionManager } from "@/middleware/session-manager"; // Correct import for sessionManager

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // Authenticate user (implement your auth logic)
  const user = await authenticateUser(email, password);

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Create session
  const { response } = await sessionManager.create({
    user: {
      id: user.id,
      email: user.email,
    },
  });

  return response;
}
