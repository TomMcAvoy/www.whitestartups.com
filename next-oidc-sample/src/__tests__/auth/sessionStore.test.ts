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
