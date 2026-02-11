// services/authservices.js
const User = require('./userModels/userSechma');
const jwt = require('jsonwebtoken');
const AppError = require('./../../common/errHandling/appError');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signToken = signToken;

exports.signupUser = async (userData) => {
  const newUser = new User({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    passwordConfirm: userData.passwordConfirm,
    emailVerified: false,
  });

  const verifyToken = newUser.createEmailVerifyToken();

  await newUser.save();

  const verifyURL = `${process.env.PROTOCOL}://${process.env.HOST}/api/v1/users/verifyEmail/${verifyToken}`;

  return { user: newUser, verifyToken, verifyURL };
};

exports.verifyEmail = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerifyToken: hashedToken,
    emailVerifyExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  user.emailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;

  await user.save({ validateBeforeSave: false });

  return user;
};

exports.loginUser = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email }).select(
    '+password +active +emailVerified',
  );

  if (!user) {
    throw new AppError('Incorrect email or password', 401);
  }

  const correct = await user.correctPassword(password, user.password);
  if (!correct) {
    throw new AppError('Incorrect email or password', 401);
  }

  if (!user.emailVerified) {
    throw new AppError(
      'Please verify your email to activate your account',
      401,
    );
  }

  if (user.active === false) {
    throw new AppError('This user account is no longer active.', 401);
  }

  const token = signToken(user._id);

  user.password = undefined;

  return { user, token };
};

exports.forgotPasswordServices = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('There is no user with email address.', 404);
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  return { user, resetToken };
};

exports.resetPasswordServices = async (
  token,
  newPassword,
  newPasswordConfirm,
) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const newToken = signToken(user._id);
  user.password = undefined;

  return { user, token: newToken };
};
