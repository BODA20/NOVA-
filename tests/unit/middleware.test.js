const jwt = require('jsonwebtoken');
// Mock catchAsync BEFORE importing protect
jest.mock('../../src/utils/catchAsync', () => (fn) => fn);

const { protect, restrictTo } = require('../../src/modules/auth/auth.controller');
const User = require('../../src/modules/user/user.model');
const AppError = require('../../src/utils/appError');

jest.mock('jsonwebtoken');
jest.mock('../../src/modules/user/user.model');

describe('Middleware Unit Tests', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {},
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
    
    jwt.verify.mockImplementation((token, secret, callback) => {
      if (token === 'valid-token') {
        callback(null, { id: 'user-id', iat: Date.now() / 1000 });
      } else {
        callback(new Error('Invalid token'));
      }
    });
  });

  describe('protect middleware', () => {
    it('should call next with AppError if no token is provided', async () => {
      await protect(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should allow access if valid token is provided', async () => {
      req.headers.authorization = 'Bearer valid-token';
      
      const mockUser = {
        id: 'user-id',
        changedPasswordAfter: jest.fn().mockReturnValue(false),
      };
      User.findById.mockResolvedValue(mockUser);

      await protect(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('user-id');
      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with AppError if user no longer exists', async () => {
      req.headers.authorization = 'Bearer valid-token';
      User.findById.mockResolvedValue(null);

      await protect(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe('restrictTo middleware', () => {
    it('should allow access if user has required role', () => {
      req.user = { role: 'admin' };
      const middleware = restrictTo('admin', 'lead-guide');
      
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with AppError if user does not have required role', () => {
      req.user = { role: 'user' };
      const middleware = restrictTo('admin');
      
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });
});
