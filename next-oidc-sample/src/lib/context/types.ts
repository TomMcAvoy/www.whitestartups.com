export type OIDCState = {
  state: string;
  nonce: string;
  code_verifier: string;
  redirect_uri: string;
};

export type OIDCTokens = {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_at: number;
};

export type SessionData = {
  tokens: OIDCTokens;
  claims: any;
  created: string;
};
