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
  tokens: OIDCTokens;
  user: {
    id: string;
    name: string;
    email: string;
    // ...other user information...
  };
  // ...other session-related information...
}
