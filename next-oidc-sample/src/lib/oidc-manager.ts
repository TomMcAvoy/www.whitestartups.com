import { OIDCContext, OIDCState, OIDCTokens } from "./oidc-context";
import { NextRequest } from "next/server";
import { setRequestContext, getRequestContext } from "./request-context";

export class OIDCRequestManager {
  static initializeAuth(request: NextRequest) {
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    const code_verifier = generateCodeVerifier();
    const code_challenge = generateCodeChallenge(code_verifier);

    const authState: OIDCState = {
      state,
      nonce,
      code_verifier,
      redirect_uri: process.env.REDIRECT_URI!,
    };

    setRequestContext(request, OIDCContext.STATE, authState);

    return {
      state,
      nonce,
      code_challenge,
      redirect_uri: authState.redirect_uri,
    };
  }

  static getAuthState(request: NextRequest): OIDCState | undefined {
    return getRequestContext(request, OIDCContext.STATE);
  }

  static setTokens(request: NextRequest, tokens: OIDCTokens) {
    setRequestContext(request, OIDCContext.TOKENS, tokens);
  }

  static getTokens(request: NextRequest): OIDCTokens | undefined {
    return getRequestContext(request, OIDCContext.TOKENS);
  }
}
