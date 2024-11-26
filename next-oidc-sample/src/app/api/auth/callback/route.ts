import { NextRequest, NextResponse } from "next/server";
import { fetchOpenIdConfiguration } from "@/utils";

const handler = async (req: NextRequest) => {
  console.log("Callback route invoked"); // Debug log

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 }
    );
  }

  const openIdConfig = await fetchOpenIdConfiguration();
  const tokenEndpoint = openIdConfig.token_endpoint;

  // Exchange the authorization code for tokens
  const tokenResponse = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: code || "",
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return NextResponse.json(
      { error: "Failed to exchange authorization code for tokens" },
      { status: tokenResponse.status }
    );
  }

  // Store the tokens in the session or database
  // For simplicity, we'll store them in a cookie
  const response = NextResponse.redirect("/");
  response.cookies.set("access_token", tokenData.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  response.cookies.set("id_token", tokenData.id_token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  return response;
};

export { handler as GET };
