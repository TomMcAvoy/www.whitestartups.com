export const OIDCContext = {
  STATE: Symbol("oidc-state"),
  NONCE: Symbol("oidc-nonce"),
  CODE_VERIFIER: Symbol("oidc-code-verifier"),
  AUTH_PARAMS: Symbol("oidc-auth-params"),
  TOKENS: Symbol("oidc-tokens"),
  CLAIMS: Symbol("oidc-claims"),
} as const;

type OIDCTokens = {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_at: number;
};

type OIDCState = {
  state: string;
  nonce: string;
  code_verifier: string;
  redirect_uri: string;
};
