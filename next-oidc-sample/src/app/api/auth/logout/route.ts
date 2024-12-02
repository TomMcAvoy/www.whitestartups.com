/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { withContext } from "@/middleware/context";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const handler = withContext(async (contextReq) => {
  if (!contextReq.context.session) {
    contextReq.context.session = { id: "mock-session-id" }; // Ensure a mock session is in place
    return NextResponse.json({ error: "No session found" }, { status: 404 });
  }

  const sessionId = contextReq.context.session.id;
  if (sessionId) {
    await redis.del(sessionId);
  } else {
    return NextResponse.json(
      { error: "Session ID is missing" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
});

export const GET = async (req: NextRequest) => {
  const resolvedHandler = await handler;
  return resolvedHandler(req, new NextResponse());
};
