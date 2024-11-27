import { NextResponse, NextRequest } from "next/server";
import { withSessionMiddleware } from "@/middleware/session";
import { NextApiResponse } from "next";

const handler = async (req: NextRequest) => {
  console.log("Logout route invoked"); // Debug log

  // Initialize session
  const apiResponse = NextResponse.next();

  await withSessionMiddleware(req as any, apiResponse);

  // Destroy the session
  (req as any).session.destroy((err: any) => {
    if (err) {
      console.error("Failed to destroy session:", err);
      return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
    }
  });

  return NextResponse.redirect("/");
};

export { handler as GET };
