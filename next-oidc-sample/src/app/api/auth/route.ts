import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/utils/index";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const codeVerifier = req.cookies.get("code_verifier")?.value;

  if (!code || !codeVerifier) {
    return NextResponse.json(
      { error: "Missing code or code verifier" },
      { status: 400 }
    );
  }

  try {
    const tokens = await exchangeCodeForToken(code, codeVerifier);
    // Store tokens in session or cookies as needed
    return NextResponse.json({ tokens });
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return NextResponse.json(
      { error: "Failed to exchange code for token" },
      { status: 500 }
    );
  }
}
