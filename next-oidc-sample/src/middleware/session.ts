/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextRequest, NextResponse } from "next/server";
import applySession from "next-session";
import Redis from "ioredis";
import { RedisStore } from "./redis-store";
import { SessionData } from "@/types/session-types";

// Initialize Redis client
const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
);

// Session options
const sessionOptions = {
  store: new RedisStore(redisClient),
  name: "next.js.session",
  secret: process.env.SECRET_COOKIE_PASSWORD || "default_password",
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
};

// Define the extended request interface
interface ExtendedNextRequest extends NextRequest {
  session: SessionData; // Use the SessionData interface we defined above
}

// Middleware to initialize session
export const withSessionMiddleware = async (
  req: NextRequest,
  res: NextResponse
): Promise<void> => {
  const extendedReq = req as ExtendedNextRequest;
  await applySession(extendedReq as any, res as any, sessionOptions); // Initialize session

  // Ensure the session has the required methods
  if (!extendedReq.session.save) {
    extendedReq.session.save = async () => {
      // Implement the save logic here
    };
  }

  if (!extendedReq.session.destroy) {
    extendedReq.session.destroy = (callback: (err: any) => void) => {
      // Implement the destroy logic here
      callback(null);
    };
  }
};
