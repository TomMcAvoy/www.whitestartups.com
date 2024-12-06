declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GOOGLE_REDIRECT_URI: string;
      OIDC_ISSUER: string;
      OIDC_DISCOVERY_URL: string;
      OIDC_TOKEN_ENDPOINT: string;
      OIDC_USERINFO_ENDPOINT: string;
      OIDC_AUTH_ENDPOINT: string;
      OIDC_JWKS_URI: string;
      OIDC_SCOPES: string;
      UPSTASH_REDIS_URL: string;
      UPSTASH_REDIS_TOKEN: string;
      JWT_SECRET: string;
      NODE_ENV: "development" | "production" | "test";
      RATE_LIMIT_WINDOW_SECS: string;
      RATE_LIMIT_MAX_REQUESTS: string;
    }
  }
}

export {};
