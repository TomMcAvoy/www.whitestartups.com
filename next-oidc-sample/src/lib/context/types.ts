export type OIDCState = {
  state: string;
  nonce: string;
  code_verifier: string;
  redirect_uri: string;
};

export interface OIDCTokens {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_at: number;
}

export interface SessionData {
  userId: string;
  email: string;
  tokens: OIDCTokens;
  created: string;
}
