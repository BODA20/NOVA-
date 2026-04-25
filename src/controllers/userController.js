const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

exports.updateMe = catchAsync(async (req, res, next) => {
  const updatedUser = await userService.updateMe(req.user.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await userService.deleteMe(req.user.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.requestChangeEmail = catchAsync(async (req, res, next) => {
  const { token } = await userService.requestChangeEmail(
    req.user.id,
    req.body.newEmail,
  );

  const verifyURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/verifyNewEmail/${token}`;

  try {
    await new Email(req.user, verifyURL).sendEmailChangeVerification();

    res.status(200).json({
      status: 'success',
      message: 'Verification link sent to your new email!',
    });
  } catch (err) {
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});

exports.verifyNewEmail = catchAsync(async (req, res, next) => {
  await userService.verifyNewEmail(req.params.token);

  res.status(200).json({
    status: 'success',
    message: 'Email updated successfully!',
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await userService.getAllUsers();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await userService.getUser(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await userService.updateUser(req.params.id, req.body);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await userService.deleteUser(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
