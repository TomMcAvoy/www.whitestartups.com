import {
  updateSession as updateSessionDataInStore,
  deleteSession as deleteSessionData,
  redisClient,
} from "@/middleware/redis-store";

// Keep the client configuration for OIDC
export const clientConfig = {
  url: process.env.OIDC_AUTHORITY || "",
  audience: process.env.GOOGLE_AUTH_URL,
  client_id: process.env.GOOGLE_CLIENT_ID || "",
  scope: process.env.NEXT_PUBLIC_SCOPE || "",
  redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
  post_logout_redirect_uri: process.env.OIDC_POST_LOGOUT_REDIRECT_URI || "",
  response_type: "code",
  grant_type: "authorization_code",
};

// Check for required environment variables
console.log("UPSTASH_REDIS_URL:", process.env.UPSTASH_REDIS_URL);
console.log("UPSTASH_REDIS_TOKEN:", process.env.UPSTASH_REDIS_TOKEN);
console.log("SECRET_KEY:", process.env.SECRET_KEY);

if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
  throw new Error("Upstash Redis configuration is missing or undefined");
}

if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY environment variable is not defined");
}
