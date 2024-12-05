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
