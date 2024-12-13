import { getOIDCConfig } from "@/lib/oidc/config";
import { OIDCState, OIDCTokens } from "@/lib/context/types";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  exchangeCodeForTokens,
  refreshTokens,
} from "@/lib/oidc-utils";

export class OIDCAuth {
  static async createAuthRequest(): Promise<{ url: string; state: OIDCState }> {
    const config = getOIDCConfig();
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    const code_verifier = generateCodeVerifier();
    const code_challenge = await generateCodeChallenge(code_verifier);

    const params = new URLSearchParams({
      client_id: config.client.id,
      response_type: "code",
      scope: config.scopes.join(" "),
      redirect_uri: config.client.redirectUri,
      state,
      nonce,
      code_challenge,
      code_challenge_method: "S256",
    });

    return {
      url: `${config.endpoints.authorization}?${params.toString()}`,
      state: {
        state,
        nonce,
        code_verifier,
        redirect_uri: config.client.redirectUri,
      },
    };
  }

  static async handleCallback(
    code: string,
    storedState: OIDCState
  ): Promise<OIDCTokens> {
    return await exchangeCodeForTokens({
      code,
      code_verifier: storedState.code_verifier,
      redirect_uri: storedState.redirect_uri,
    });
  }

  static async refreshTokens(refresh_token: string): Promise<OIDCTokens> {
    return await refreshTokens(refresh_token);
  }
}
