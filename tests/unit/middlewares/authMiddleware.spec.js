const { restrictTo } = require('../../../src/middlewares/authMiddleware');
const AppError = require('../../../src/utils/appError');

describe('Auth Middleware (Unit)', () => {
  describe('restrictTo', () => {
    it('should allow access if user has required role', () => {
      const req = { user: { role: 'admin' } };
      const res = {};
      const next = jest.fn();

      const middleware = restrictTo('admin', 'lead-guide');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(); // called without args implies success
    });

    it('should call next with 403 AppError if user lacks permission', () => {
      const req = { user: { role: 'user' } };
      const res = {};
      const next = jest.fn();

      const middleware = restrictTo('admin', 'lead-guide');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });
});
