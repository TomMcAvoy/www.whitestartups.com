export const getOIDCConfig = () => ({
  issuer: process.env.OIDC_ISSUER,
  discoveryUrl: process.env.OIDC_DISCOVERY_URL,
  endpoints: {
    token: process.env.OIDC_TOKEN_ENDPOINT,
    userInfo: process.env.OIDC_USERINFO_ENDPOINT,
    authorization: process.env.OIDC_AUTH_ENDPOINT,
    jwks: process.env.OIDC_JWKS_URI,
  },
  client: {
    id: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  },
  scopes: process.env.OIDC_SCOPES?.split(' ') || ['openid', 'email', 'profile'],
});

// Validate required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'OIDC_ISSUER',
  'OIDC_DISCOVERY_URL',
  'OIDC_TOKEN_ENDPOINT',
  'OIDC_USERINFO_ENDPOINT',
  'OIDC_AUTH_ENDPOINT',
  'OIDC_JWKS_URI',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
