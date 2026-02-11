const authservice = require('./authservices');
const catchAsync = require('./../../common/errHandling/catchAsync');
const Email = require('./../../common/utils/email');
const authMiddleware = require('./../../common/middelWare/userMiddlewares');

exports.createToken = (user, token, statusCode, res) => {
  const days = Number(process.env.JWT_COOKIE_EXPIRES_IN || 7);
  const cookieOptions = {
    maxAge: days * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('jwt', token, cookieOptions);

  if (user) user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await authservice.signupUser(req.body);

  await new Email(newUser.user, newUser.verifyURL).sendVerification();

  res.status(201).json({
    status: 'success',
    message:
      'User created successfully! Please check your email to verify your account.',
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  await authservice.verifyEmail(req.params.token);

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully! You can now log in.',
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const loggedInUser = await authservice.loginUser(email, password);
  const { user, token } = loggedInUser;

  exports.createToken(user, token, 200, res);
});

exports.protect = authMiddleware.protect;

exports.alloweOnly = (...allowedRoles) =>
  authMiddleware.restrictTo(...allowedRoles);

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { user, resetToken } = await authservice.forgotPasswordServices(
    req.body.email,
  );

  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  await new Email(user, resetURL).sendPasswordReset();

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const result = await authservice.resetPasswordServices(
    req.params.token,
    req.body.password,
    req.body.passwordConfirm,
  );

  exports.createToken(result.user, result.token, 200, res);
});
