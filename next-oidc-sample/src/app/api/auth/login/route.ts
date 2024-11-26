/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { fetchOpenIdConfiguration } from "@/utils";
import { setCookie } from "cookies-next";

const handler = async (req: NextRequest) => {
  if (req.method !== "POST") {
    return new NextResponse(null, { status: 405 }); // Method Not Allowed
  }

  const { code_challenge } = await req.json();

  if (!code_challenge) {
    return NextResponse.json(
      { error: "Missing code challenge" },
      { status: 400 }
    );
  }

  const openIdConfig = await fetchOpenIdConfiguration();
  const authorizationEndpoint = openIdConfig.authorization_endpoint;

  const client_id = process.env.GOOGLE_CLIENT_ID || "";
  const redirect_uri = process.env.GOOGLE_REDIRECT_URI || "";
  const scope = process.env.GOOGLE_SCOPE || "openid profile email"; // Read scope from .env
  const state = uuidv4();
  const code_challenge_method = "S256";

  const authorizationUrl = `${authorizationEndpoint}?${new URLSearchParams({
    client_id,
    response_type: "code",
    redirect_uri,
    scope,
    state,
    code_challenge,
    code_challenge_method,
  }).toString()}`;

  console.log("Redirecting to Google:", authorizationUrl); // Log the redirect URL

  return NextResponse.json({ url: authorizationUrl });
};

export { handler as POST };
