import { config } from "dotenv";
config();

// The CLIENT_ID and other Google-specific environment variables are used for OAuth2 authentication with Google services.
// These variables are necessary to configure the OpenID Connect (OIDC) and Google OAuth2 authentication flows.

// Print UPSTASH environment variables
console.log("UPSTASH_REDIS_URL:", process.env.UPSTASH_REDIS_URL);
console.log("UPSTASH_REDIS_TOKEN:", process.env.UPSTASH_REDIS_TOKEN);
