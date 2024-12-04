import { NextRequest, NextResponse } from "next/server";
import { SessionData } from "@/types/session-types";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get("sessionId")?.value;
  if (sessionId) {
    const session = await SessionData.load(sessionId);
    if (session) {
      await session.destroy();
      const response = NextResponse.json({
        message: "Logged out successfully",
      });
      response.cookies.set("sessionId", "", { maxAge: 0, path: "/" });
      return response;
    } else {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
  } else {
    return NextResponse.json(
      { error: "Session ID is missing" },
      { status: 400 }
    );
  }
}
