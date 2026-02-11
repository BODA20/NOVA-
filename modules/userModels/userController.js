const Email = require('./../../common/utils/email');
const userServices = require('./userServices');
const catchAsync = require('./../../common/errHandling/catchAsync');
exports.resetData = catchAsync(async (req, res, next) => {
  const resetInfo = await userServices.resetDataServices(req.user.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { user: resetInfo },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await userServices.deleteUser(req.user.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.requestChangeEmail = catchAsync(async (req, res, next) => {
  const { verifyURL } = await userServices.requestChangeEmail(
    req.user.id,
    req.body.newEmail,
  );
  await new Email(
    req.user,
    verifyURL,
    req.body.newEmail,
  ).sendEmailChangeVerification();
  res.status(200).json({
    status: 'success',
    message: 'Email change request sent successfully.',
  });
});

exports.verifyNewEmail = catchAsync(async (req, res, next) => {
  await userServices.verifyNewEmail(req.params.token);

  res.status(200).json({
    status: 'success',
    message: 'Email updated successfully.',
  });
});
