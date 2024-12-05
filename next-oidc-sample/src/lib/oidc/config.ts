export const OIDCConfig = {
  authority: process.env.OIDC_AUTHORITY!,
  client_id: process.env.CLIENT_ID!,
  client_secret: process.env.CLIENT_SECRET!,
  redirect_uri: process.env.REDIRECT_URI!,
  post_logout_redirect_uri: process.env.POST_LOGOUT_REDIRECT_URI!,
  scope: "openid profile email",
} as const;
