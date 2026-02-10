const dashboardService = require('./dashboardService');
const catchAsync = require('../../../common/errHandling/catchAsync');
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await dashboardService.getTourStatsService(req.query);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await dashboardService.getMonthlyPlan(year);

  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});
