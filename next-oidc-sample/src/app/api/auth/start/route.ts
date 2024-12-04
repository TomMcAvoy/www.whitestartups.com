/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { generateRandomState } from "@/utils/oidc-utils"; // Updated import path

export async function POST(req: NextRequest) {
  // Generate state for OIDC security
  const state = generateRandomState();

  // Redirect the user to the authentication provider with the state parameter
  const authUrl = `${process.env.AUTH_PROVIDER_URL}?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&state=${state}`;

  return NextResponse.redirect(authUrl);
}
