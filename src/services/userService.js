const crypto = require('crypto');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = async (userId, data) => {
  // 1) Create error if user POSTs password data
  if (data.password || data.passwordConfirm) {
    throw new AppError(
      'This route is not for password updates. Please use /updateMyPassword.',
      400,
    );
  }

  // 2) Filter out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(data, 'name', 'photo');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(userId, filteredBody, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

exports.requestChangeEmail = async (userId, newEmail) => {
  const user = await User.findById(userId).select('+email');
  if (!user) throw new AppError('User not found.', 404);

  if (newEmail === user.email) {
    throw new AppError('This email is already your current email.', 400);
  }

  const existingUser = await User.findOne({ email: newEmail });
  if (existingUser) {
    throw new AppError('This email is already in use by another account.', 400);
  }

  user.pendingEmail = newEmail;
  const token = crypto.randomBytes(32).toString('hex');
  user.pendingEmailToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  user.pendingEmailExpires = Date.now() + 24 * 60 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  return { token };
};

exports.verifyNewEmail = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    pendingEmailToken: hashedToken,
    pendingEmailExpires: { $gt: Date.now() },
  });

  if (!user) throw new AppError('Token is invalid or has expired.', 400);

  const existsNow = await User.findOne({
    email: user.pendingEmail,
    _id: { $ne: user._id },
  });

  if (existsNow) throw new AppError('This email is already in use.', 400);

  user.email = user.pendingEmail;
  user.pendingEmail = undefined;
  user.pendingEmailToken = undefined;
  user.pendingEmailExpires = undefined;
  user.emailVerified = true;

  await user.save({ validateBeforeSave: false });

  return user;
};

exports.deleteMe = async (userId) => {
  await User.findByIdAndUpdate(userId, { active: false });
};

exports.getAllUsers = async () => {
  return await User.find();
};

exports.getUser = async (id) => {
  return await User.findById(id);
};

exports.updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

exports.deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};
