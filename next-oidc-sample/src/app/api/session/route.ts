/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { withSessionMiddleware } from "@/middleware/session";
import initializeSession from "next-session";

const handler = async (req: NextRequest) => {
  const res = NextResponse.next();

  // Initialize session
  await initializeSession()(req as any, res as any);
  await withSessionMiddleware(req as any, res as any);

  const session = (req as any).session;
  session.id = session.id || "generated-id"; // Ensure id exists
  session.touch = session.touch || (() => {}); // Ensure touch method exists
  session.commit = session.commit || (async () => {}); // Ensure commit method exists
  session.destroy = session.destroy || (async () => {}); // Ensure destroy method exists

  if (!session.access_token || !session.id_token) {
    return NextResponse.json({ error: "No session found" }, { status: 404 });
  }

  return NextResponse.json({
    access_token: session.access_token,
    id_token: session.id_token,
  });
};

export const GET = handler;
