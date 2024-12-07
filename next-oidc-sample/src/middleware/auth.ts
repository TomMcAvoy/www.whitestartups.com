// src/middleware/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession, setSessionCookie } from "./redis-store";
import { ContextManager } from "@/lib/context";
import { NextApiRequest, NextApiResponse } from "next";
import { OIDCClient } from "@/lib/oidc/client";
import {
  OIDCAuth,
  verifyToken,
  extractTokenFromHeader,
} from "@/lib/oidc/oidcauth"; // Updated import
import { TokenVerifier } from "@/lib/tokens/verify";
import { SessionStore } from "@/lib/redis/store";
import { ContextSymbols } from "@/lib/context/symbols";
import { Redis } from "@upstash/redis";
import { rateLimitMiddleware } from "@/middleware/rateLimit";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

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

const CODE_CHALLENGE_SYMBOL = Symbol("code_challenge");
const CODE_VERIFIER_SYMBOL = Symbol("code_verifier");

export function setCodeChallenge(req: any, codeChallenge: string) {
  req[CODE_CHALLENGE_SYMBOL] = codeChallenge;
}

export function getCodeChallenge(req: any): string | undefined {
  return req[CODE_CHALLENGE_SYMBOL];
}

export function setCodeVerifier(req: any, codeVerifier: string) {
  req[CODE_VERIFIER_SYMBOL] = codeVerifier;
}

export function getCodeVerifier(req: any): string | undefined {
  return req[CODE_VERIFIER_SYMBOL];
}

export async function authMiddleware(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId")?.value;

  if (!sessionId) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const session = await SessionStore.getSession(sessionId);
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Store sessionId in context
  ContextManager.set(request, ContextSymbols.SESSION_ID, sessionId);

  return NextResponse.next();
}

export async function handleCallback(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { code } = req.query;
      const tokens = await OIDCAuth.handleCallback(code as string); // Updated method call
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

export async function login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { username, password } = req.body;
      const user = await authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      // Generate tokens and create session here
      const tokens = {
        /* token generation logic */
      };
      res.status(200).json(tokens);
    } catch (error) {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export async function logout(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      // Clear session or perform logout logic here
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to log out" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export async function protectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const user = await verifyToken(token);
    req.user = user; // Attach user to request object
    return NextResponse.next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export async function middleware(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const token = extractTokenFromHeader(authHeader);
    await verifyToken(token);

    return NextResponse.next();
  } catch (error) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}

export async function refresh(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimitMiddleware(request, 5, 60);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // ...existing code...
  } catch (error) {
    // ...existing code...
  }
}

export function start(req: NextApiRequest, res: NextApiResponse) {
  // Implementation of the start function
}

export const config = {
  matcher: ["/api/auth/protected/:path*"],
};
