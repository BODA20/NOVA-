const authService = require('../../src/modules/auth/auth.service');
const Session = require('../../src/modules/auth/session.model');
const jwt = require('jsonwebtoken');

jest.mock('../../src/modules/auth/session.model');
jest.mock('jsonwebtoken');

describe('AuthService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
  });

  describe('createAuthTokens', () => {
    it('should create tokens and save session', async () => {
      const userId = 'user-id';
      jwt.sign.mockReturnValue('mock-access-token');
      Session.create.mockResolvedValue({ _id: 'session-id' });

      const result = await authService.createAuthTokens(userId, 'agent', 'ip');

      expect(jwt.sign).toHaveBeenCalled();
      expect(Session.create).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
