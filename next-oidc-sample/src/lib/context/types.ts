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
  expires_at: number; // Access token expiry
  id_token_expires_at: number; // ID token expiry
  refresh_token_expires_at?: number; // Refresh token expiry (optional)
}

// Remove the duplicate SessionData definition
// export interface SessionData {
//   tokens: OIDCTokens;
//   user: {
//     id: string;
//     name: string;
//     email: string;
//     // ...other user information...
//   };
//   // ...other session-related information...
// }
