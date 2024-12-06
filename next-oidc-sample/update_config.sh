#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# First, let's update the OIDC config file
cat > src/lib/oidc/config.ts << 'EOL'
export const OIDCConfig = {
  authority: 'https://accounts.google.com',
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
  scope: 'openid email profile',
  response_type: 'code',
  token_endpoint: 'https://oauth2.googleapis.com/token',
  authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  userinfo_endpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
  jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs'
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
EOL

# Update the .env file with Google OIDC configuration
cat > .env << 'EOL'
# Google OAuth Configuration
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback"

# Session Configuration
SESSION_SECRET=""
SESSION_DURATION="7d"

# Redis Configuration
REDIS_URL="redis://localhost:6379"
REDIS_TOKEN=""

# Application Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""

# Cookie Configuration
COOKIE_NAME="__session"
COOKIE_DOMAIN="localhost"
COOKIE_SECURE="false"
EOL

# Update the test environment file
cat > .env.test << 'EOL'
# Google OAuth Test Configuration
GOOGLE_CLIENT_ID="test_client_id"
GOOGLE_CLIENT_SECRET="test_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback"

# Session Test Configuration
SESSION_SECRET="test_session_secret"
SESSION_DURATION="1h"

# Redis Test Configuration
REDIS_URL="redis://localhost:6379"
REDIS_TOKEN="test_token"

# Application Test Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test_secret"

# Cookie Test Configuration
COOKIE_NAME="__session_test"
COOKIE_DOMAIN="localhost"
COOKIE_SECURE="false"
EOL

# Create environment type definitions
cat > src/types/env.d.ts << 'EOL'
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GOOGLE_REDIRECT_URI: string;
      SESSION_SECRET: string;
      SESSION_DURATION: string;
      REDIS_URL: string;
      REDIS_TOKEN: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      COOKIE_NAME: string;
      COOKIE_DOMAIN: string;
      COOKIE_SECURE: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {}
EOL

# Update the test setup file
cat > src/__tests__/mocks/setup.ts << 'EOL'
process.env.GOOGLE_CLIENT_ID = 'test_client_id';
process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/callback';
process.env.SESSION_SECRET = 'test_session_secret';
process.env.SESSION_DURATION = '1h';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.REDIS_TOKEN = 'test_token';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test_secret';
process.env.COOKIE_NAME = '__session_test';
process.env.COOKIE_DOMAIN = 'localhost';
process.env.COOKIE_SECURE = 'false';
process.env.NODE_ENV = 'test';
EOL

echo -e "${GREEN}Configuration files updated successfully!${NC}"
echo -e "${BLUE}Important:${NC}"
echo "1. Add your Google OAuth credentials to .env"
echo "2. Update NEXTAUTH_SECRET with a secure random string"
echo "3. Update SESSION_SECRET with a secure random string"
echo "4. Update REDIS_TOKEN if using authenticated Redis"
echo -e "\n${BLUE}To generate secure secrets, you can use:${NC}"
echo "openssl rand -base64 32"

