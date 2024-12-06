import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RedisManager } from "@/lib/session/redis";

export async function rateLimitMiddleware(
  request: NextRequest,
  limit: number = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS!),
  windowSecs: number = parseInt(process.env.RATE_LIMIT_WINDOW_SECS!)
) {
  // ...existing code...
}
