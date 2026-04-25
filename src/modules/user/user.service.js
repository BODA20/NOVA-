const User = require('./user.model');
const AppError = require('../../utils/appError');
const ApiFeatures = require('../../utils/apiFeatures');

exports.getAllUsers = async (queryStr) => {
  const features = new ApiFeatures(User.find(), queryStr)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  return users;
};

exports.getUser = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }
  return user;
};

exports.updateMe = async (userId, updateData) => {
  // 1) Filter out unwanted fields
  const filteredBody = {};
  const allowedFields = ['name', 'email'];
  Object.keys(updateData).forEach((el) => {
    if (allowedFields.includes(el)) filteredBody[el] = updateData[el];
  });

  // 2) Update user document
  const updatedUser = await User.findByIdAndUpdate(userId, filteredBody, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

exports.deleteMe = async (userId) => {
  await User.findByIdAndUpdate(userId, { active: false });
};

exports.updateUser = async (id, updateData) => {
  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new AppError('No user found with that ID', 404);
  }

  return updatedUser;
};

exports.deleteUser = async (id) => {
  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    throw new AppError('No user found with that ID', 404);
  }

  return deletedUser;
};
