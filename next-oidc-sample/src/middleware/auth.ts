// src/middleware/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession, setSessionCookie } from "./redis-store";
import { ContextManager } from "@/lib/context";

interface User {
  id: string;
  email: string;
  password: string;
}

// Mock user data
const users: User[] = [
  { id: "1", email: "user@example.com", password: "password123" },
  // Add more users as needed
];

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const user = users.find(
    (user) => user.email === email && user.password === password
  );
  return user || null;
}

const SESSION_SYMBOL = Symbol("session");

export async function authMiddleware(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId")?.value;
  const session = sessionId ? await getSession(sessionId) : null;

  // Skip authentication for public paths
  const publicPaths = ["/api/auth/login", "/api/auth/callback"];
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Redirect to login if no session exists
  if (!session?.user) {
    const loginUrl = new URL("/api/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Create a new session if none exists
  if (!sessionId) {
    const { sessionId: newSessionId } = await createSession({
      user: session.user,
    });
    await setSessionCookie(NextResponse.next(), newSessionId);
    return NextResponse.next();
  }

  // Store session in new context system
  ContextManager.set(request, SESSION_SYMBOL, session);

  return NextResponse.next();
}
