import { NextResponse, NextRequest } from "next/server";
import { withSessionMiddleware } from "@/middleware/session";
import { NextApiResponse, NextApiRequest } from "next";

const handler = async (req: NextRequest) => {
  // Initialize session
  const apiResponse = NextResponse.next() as unknown as NextApiResponse;

  await withSessionMiddleware(req as unknown as NextApiRequest, apiResponse);

  if (
    !(req as unknown as any).session.access_token ||
    !(req as unknown as any).session.id_token
  ) {
    return NextResponse.json({ error: "No session found" }, { status: 404 });
  }

  return NextResponse.json({
    access_token: (req as unknown as any).session.access_token,
    id_token: (req as unknown as any).session.id_token,
  });
};

export const GET = handler;
