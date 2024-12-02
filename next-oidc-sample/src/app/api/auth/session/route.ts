// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  withSession,
  createSession,
  deleteSession,
  clearSessionCookie,
  setSessionCookie,
} from "@/middleware/redis-store";
import { createContext } from "@/middleware/context";

export async function GET(request: NextRequest) {
  const context = await createContext(request, NextResponse.next(), {
    enhanceContext: (ctx) => {
      ctx.request = request;
      ctx.response = NextResponse.next();
      return Promise.resolve();
    },
  });
  const { session } = await withSession(context);
  return NextResponse.json({ session });
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { sessionId } = await createSession(data);
  const response = NextResponse.json({ success: true });
  return setSessionCookie(response, sessionId);
}

export async function DELETE(request: NextRequest) {
  const context = await createContext(request, NextResponse.next(), {
    enhanceContext: (ctx) => {
      ctx.request = request;
      ctx.response = NextResponse.next();
      return Promise.resolve();
    },
  });
  const { sessionId } = await withSession(context);

  if (sessionId) {
    await deleteSession(sessionId);
  }

  const response = NextResponse.json({ success: true });
  return clearSessionCookie(response);
}
