#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create test directories
mkdir -p src/__tests__/auth
mkdir -p src/__tests__/mocks

# Create mock data
cat > src/__tests__/mocks/googleOidcConfig.ts << 'EOL'
export const mockGoogleConfig = {
  issuer: 'https://accounts.google.com',
  authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  token_endpoint: 'https://oauth2.googleapis.com/token',
  userinfo_endpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
  jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs'
};

export const mockTokenResponse = {
  access_token: 'mock_access_token',
  id_token: 'mock_id_token',
  refresh_token: 'mock_refresh_token',
  expires_in: 3600,
  scope: 'openid profile email',
  token_type: 'Bearer'
};

export const mockUserInfo = {
  sub: '12345',
  name: 'Test User',
  given_name: 'Test',
  family_name: 'User',
  picture: 'https://example.com/photo.jpg',
  email: 'testuser@example.com',
  email_verified: true
};
EOL

# Create OIDC client test
cat > src/__tests__/auth/oidcClient.test.ts << 'EOL'
import { OIDCClient } from '../../lib/oidc/client';
import { mockGoogleConfig, mockTokenResponse, mockUserInfo } from '../mocks/googleOidcConfig';

// Mock fetch globally
global.fetch = jest.fn();

describe('OIDCClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should fetch OIDC configuration', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGoogleConfig)
      });

      await OIDCClient.initialize();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://accounts.google.com/.well-known/openid-configuration'
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse)
      });

      const result = await OIDCClient.refreshTokens('old_refresh_token');
      
      expect(result).toEqual({
        access_token: mockTokenResponse.access_token,
        id_token: mockTokenResponse.id_token,
        refresh_token: mockTokenResponse.refresh_token,
        expires_at: expect.any(Number)
      });
    });
  });
});
EOL

# Create token verification test
cat > src/__tests__/auth/tokenVerify.test.ts << 'EOL'
import { TokenVerifier } from '../../lib/tokens/verify';
import { mockTokenResponse, mockUserInfo } from '../mocks/googleOidcConfig';

describe('TokenVerifier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const mockJwt = 'valid.mock.token';
      
      const result = await TokenVerifier.verifyToken(mockJwt, {
        issuer: 'https://accounts.google.com',
        audience: process.env.GOOGLE_CLIENT_ID
      });

      expect(result).toBeTruthy();
    });

    it('should reject an invalid token', async () => {
      const mockJwt = 'invalid.token';
      
      await expect(
        TokenVerifier.verifyToken(mockJwt)
      ).rejects.toThrow('Token verification failed');
    });
  });
});
EOL

# Create session store test
cat > src/__tests__/auth/sessionStore.test.ts << 'EOL'
import { SessionStore } from '../../lib/redis/store';
import { redis } from '../../lib/redis/client';

// Mock redis client
jest.mock('../../lib/redis/client', () => ({
  redis: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn()
  }
}));

describe('SessionStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      const mockSession = {
        userId: '12345',
        email: 'test@example.com',
        tokens: {
          access_token: 'mock_access_token',
          id_token: 'mock_id_token',
          expires_at: Date.now() + 3600000
        },
        created: new Date().toISOString()
      };

      const sessionId = await SessionStore.createSession(mockSession);
      
      expect(sessionId).toBeTruthy();
      expect(redis.set).toHaveBeenCalledWith(
        expect.stringContaining('session:'),
        expect.any(String)
      );
    });
  });

  describe('getSession', () => {
    it('should retrieve an existing session', async () => {
      const mockSession = {
        userId: '12345',
        email: 'test@example.com'
      };

      (redis.get as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockSession)
      );

      const session = await SessionStore.getSession('test-session-id');
      
      expect(session).toEqual(mockSession);
    });
  });
});
EOL

# Create test environment file
cat > .env.test << 'EOL'
# Test Environment Configuration
GOOGLE_CLIENT_ID=your_test_client_id
GOOGLE_CLIENT_SECRET=your_test_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Redis Test Configuration
REDIS_URL=redis://localhost:6379
REDIS_TOKEN=mock_token

# Session Configuration
SESSION_SECRET=test_session_secret
EOL

# Create Jest config
cat > jest.config.js << 'EOL'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: ['<rootDir>/src/__tests__/mocks/setup.ts'],
};
EOL

# Create test setup file
cat > src/__tests__/mocks/setup.ts << 'EOL'
process.env.GOOGLE_CLIENT_ID = 'test_client_id';
process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/callback';
EOL

# Update package.json with test scripts
echo -e "${BLUE}Adding test scripts to package.json...${NC}"
pnpm pkg set scripts.test="jest"
pnpm pkg set scripts.test:watch="jest --watch"
pnpm pkg set scripts.test:coverage="jest --coverage"

# Install required dependencies
echo -e "${BLUE}Installing test dependencies...${NC}"
pnpm add -D jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom

echo -e "${GREEN}Test files created successfully!${NC}"
echo -e "${BLUE}To run tests:${NC}"
echo "pnpm test"
echo "pnpm test:watch"
echo "pnpm test:coverage"

