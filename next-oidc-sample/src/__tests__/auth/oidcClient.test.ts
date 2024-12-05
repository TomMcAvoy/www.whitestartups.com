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
