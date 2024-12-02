/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { withContext } from "@/middleware/context";
import { deleteSession } from "@/middleware/session-manager";

const handler = withContext(async (contextReq) => {
  if (!contextReq.context.session) {
    contextReq.context.session = { id: "mock-session-id" }; // Ensure a mock session is in place
    return NextResponse.json({ error: "No session found" }, { status: 404 });
  }

  const sessionId = contextReq.context.session.id;
  if (sessionId) {
    await deleteSession(sessionId);
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
