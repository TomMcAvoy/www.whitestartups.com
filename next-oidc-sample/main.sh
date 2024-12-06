# Update .env with OIDC discovery configuration
cat > .env << 'EOL'
# Google OAuth Configuration
GOOGLE_CLIENT_ID="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
GOOGLE_CLIENT_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback"

# OpenID Connect Configuration
OIDC_ISSUER="https://accounts.google.com"
OIDC_DISCOVERY_URL="https://accounts.google.com/.well-known/openid-configuration"
OIDC_TOKEN_ENDPOINT="https://oauth2.googleapis.com/token"
OIDC_USERINFO_ENDPOINT="https://openidconnect.googleapis.com/v1/userinfo"
OIDC_AUTH_ENDPOINT="https://accounts.google.com/o/oauth2/v2/auth"
OIDC_JWKS_URI="https://www.googleapis.com/oauth2/v3/certs"
OIDC_SCOPES="openid email profile offline"

# Upstash Redis Configuration
UPSTASH_REDIS_URL="https://precious-pheasant-25489.upstash.io"
UPSTASH_REDIS_TOKEN=""
EOL

# Update type definitions
cat > src/types/env.d.ts << 'EOL'
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
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {}
EOL

# Create a config utility for OIDC
cat > src/lib/oidc/config.ts << 'EOL'
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
EOL

# Create a discovery utility
cat > src/lib/oidc/discovery.ts << 'EOL'
export async function fetchOIDCDiscovery() {
  try {
    const response = await fetch(process.env.OIDC_DISCOVERY_URL!);
    if (!response.ok) {
      throw new Error('Failed to fetch OIDC discovery document');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching OIDC discovery document:', error);
    throw error;
  }
}
EOL

