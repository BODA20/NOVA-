const authService = require('../services/authService');
const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const createSendToken = (user, statusCode, res) => {
  const token = authService.signToken?.(user._id); // Internal helper should be moved to service if needed, or just use the one from service login
  // Actually, I'll rely on service returning the token
};

// Refactoring helper for responses
const sendResponse = (res, statusCode, data, token) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { user, verifyToken } = await authService.signup(req.body);

  const verifyURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/verifyEmail/${verifyToken}`;

  try {
    await new Email(user, verifyURL).sendVerification();

    res.status(201).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    // If email fails, we should ideally rollback the user creation or handle it
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const { user, token } = await authService.login(email, password);

  sendResponse(res, 200, { user }, token);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.verifyEmail = catchAsync(async (req, res, next) => {
  await authService.verifyEmail(req.params.token);

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully!',
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { user, resetToken } = await authService.forgotPassword(req.body.email);

  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { user, token } = await authService.resetPassword(
    req.params.token,
    req.body.password,
    req.body.passwordConfirm,
  );

  sendResponse(res, 200, { user }, token);
});
