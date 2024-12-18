/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { ContextManager } from "@/lib/context";
import { NextApiRequest, NextApiResponse } from "next";
import { OIDCAuth } from "@/lib/oidc/oidcauth";
import { SessionStore } from "@/lib/redis/store";
import { ContextSymbols } from "@/lib/context/symbols";
import { rateLimitMiddleware } from "@/middleware/rateLimit";
import { verifyToken, extractTokenFromHeader } from "@/lib/tokens/verify";
import { getSession, updateSession } from "@/lib/oidc-utils"; // Ensure correct import

export async function authMiddleware(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId")?.value;

  if (!sessionId) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  let session = await getSession(sessionId);
  const now = new Date();

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check if access token is expired
  if (now > new Date(session.accessTokenExpiresAt)) {
    try {
      // Refresh tokens using the refresh token
      const tokens = await OIDCAuth.refreshTokens(session.tokens.refresh_token);
      await updateSession(sessionId, { tokens });
      session = await getSession(sessionId);
    } catch (error) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Check if ID token is expired
  if (now > new Date(session.idTokenExpiresAt)) {
    try {
      // Refresh tokens using the refresh token
      const tokens = await OIDCAuth.refreshTokens(session.tokens.refresh_token);
      await updateSession(sessionId, { tokens });
      session = await getSession(sessionId);
    } catch (error) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Check if refresh token is expired
  if (
    session.refreshTokenExpiresAt &&
    now > new Date(session.refreshTokenExpiresAt)
  ) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Store sessionId in context
  ContextManager.set(request, ContextSymbols.SESSION_ID, sessionId);

  try {
    // ...existing code...
  } catch (error) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export async function handleCallback(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { code, state } = req.query;
      const storedState = await SessionStore.getOIDCState(state as string);
      if (!storedState) {
        return res.status(400).json({ error: "Invalid state" });
      }
      const tokens = await OIDCAuth.handleCallback(code as string, storedState);
      await SessionStore.clearOIDCState(state as string);
      await SessionStore.createSession({
        userId: tokens.id_token, // Use a unique identifier from the ID token
        email: tokens.email, // Extract email from the ID token
        tokens,
      });
      res.status(200).json(tokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to handle callback" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export async function login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { authUrl, state } = await OIDCAuth.createAuthRequest();
      res.status(200).json({ authUrl, state });
    } catch (error) {
      res.status(500).json({ error: "Failed to initiate login" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export async function logout(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const sessionId = req.cookies.get("sessionId")?.value;
      if (sessionId) {
        await SessionStore.delete(sessionId);
      }
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to handle logout" });
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
    res.status(500).json({ error: "Failed to handle protected route" });
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
    return new NextResponse("Failed to handle refresh", { status: 500 });
  }
}

// ...existing code...

export function start(req: NextApiRequest, res: NextApiResponse) {
  // Implementation of the start function
}

export const config = {
  matcher: ["/api/auth/protected/:path*"],
};
