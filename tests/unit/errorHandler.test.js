const globalErrorHandler = require('../../src/middlewares/errorMiddleware');
const AppError = require('../../src/utils/appError');

describe('Global Error Handler Unit Tests', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    process.env.NODE_ENV = 'production';
  });

  it('should handle AppError correctly', () => {
    const error = new AppError('Test error', 400);

    globalErrorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Test error',
    });
  });

  it('should handle CastError correctly in production', () => {
    const error = {
      name: 'CastError',
      path: '_id',
      value: '123',
    };

    globalErrorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid _id: 123.',
    }));
  });
});
