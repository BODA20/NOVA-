const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../../modules/userModels/userModels/userSechma');
const AppError = require('./../errHandling/appError');

const verifyToken = async (token) => {
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  return decoded;
};

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError(
          'You are not logged in! Please log in to get access.',
          401,
        ),
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded || !decoded.id) {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    const user = await User.findById(decoded.id).select('+active');

    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401),
      );
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401,
        ),
      );
    }

    if (user.active === false) {
      return next(new AppError('This user account is no longer active.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

exports.restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

exports.validate =
  (schema, property = 'body') =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const msg = error.details.map((d) => d.message).join(' | ');
      return next(new AppError(msg, 400));
    }

    req[property] = value;
    next();
  };
