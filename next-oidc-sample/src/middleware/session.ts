import { NextRequest, NextResponse } from "next/server"; // Import NextRequest and NextResponse

export interface Session {
  id: string;
  state?: string;
  codeVerifier?: string;
  // Add other session properties as needed
  [key: string]: any;
}

export const withSessionMiddleware = (
  handler: (req: NextRequest, res: NextResponse) => Promise<void>
) => {
  return async (req: NextRequest, res: NextResponse) => {
    // Middleware logic here
    await handler(req, res);
  };
};

// Removed unused sessionManager import
