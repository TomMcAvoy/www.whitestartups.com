import { getSession, defaultSession } from "@/lib";
import { NextRequest, NextResponse } from "next/server";
import { NextApiResponse } from "next";

// Ensure there are no references to next-auth

export async function GET(request: NextRequest) {
  const res = {} as NextApiResponse;
  try {
    const session = await getSession(request, res);
    if (!session) {
      return NextResponse.json({ defaultSession });
    }
    return NextResponse.json({
      isLoggedIn: session.isLoggedIn,
      userInfo: session.userInfo,
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
