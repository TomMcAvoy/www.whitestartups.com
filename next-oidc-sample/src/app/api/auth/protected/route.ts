import { NextRequest, NextResponse } from "next/server";
import { withSession } from "@/middleware/redis-store";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { session } = await withSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ data: session });
}
