const AppError = require('./../../common/errHandling/appError');
const User = require('./userModels/userSechma');
const crypto = require('crypto');
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.resetDataServices = async (userId, data) => {
  const filteredData = filterObj(data, 'name');

  const updatedUser = await User.findByIdAndUpdate(userId, filteredData, {
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

  const pendingUser = await User.findOne({
    pendingEmail: newEmail,
    _id: { $ne: userId },
  });
  if (pendingUser) {
    throw new AppError(
      'This email is already pending verification for another account.',
      400,
    );
  }

  user.pendingEmail = newEmail;

  const token = user.createPendingEmailToken();
  await user.save({ validateBeforeSave: false });

  const verifyURL = `${process.env.PROTOCOL}://${process.env.HOST}/api/v1/users/verifyNewEmail/${token}`;

  return { verifyURL };
};

exports.verifyNewEmail = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    pendingEmailToken: hashedToken,
    pendingEmailExpires: { $gt: Date.now() },
  });

  if (!user) throw new AppError('Token is invalid or has expired.', 400);

  if (!user.pendingEmail) {
    throw new AppError('No pending email found for this token.', 400);
  }

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

  await user.save();

  return user;
};

exports.deleteUser = async (userId) => {
  const deletedUser = await User.findByIdAndUpdate(userId, { active: false });
  return deletedUser;
};
