const adminService = require('../services/adminService');
const catchAsync = require('../utils/catchAsync');

/**
 * Controller to handle admin and analytics requests
 */

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await adminService.getTourStats();

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await adminService.getMonthlyPlan(year);

  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});

exports.getSystemHealth = catchAsync(async (req, res, next) => {
  const health = await adminService.getSystemHealth();

  res.status(200).json({
    status: 'success',
    data: { health },
  });
});
