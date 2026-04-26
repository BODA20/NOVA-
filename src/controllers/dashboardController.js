const dashboardService = require('../services/dashboardService');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const metrics = await dashboardService.getOverviewMetrics();

  res.status(200).json({
    status: 'success',
    data: { metrics },
  });
});

exports.getRevenue = catchAsync(async (req, res, next) => {
  const analytics = await dashboardService.getRevenueAnalytics();

  res.status(200).json({
    status: 'success',
    data: { analytics },
  });
});

exports.getBookingsStats = catchAsync(async (req, res, next) => {
  const stats = await dashboardService.getBookingsStats();

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getTopTours = catchAsync(async (req, res, next) => {
  const topTours = await dashboardService.getTopTours();

  res.status(200).json({
    status: 'success',
    data: { topTours },
  });
});

exports.getUsersStats = catchAsync(async (req, res, next) => {
  const usersStats = await dashboardService.getUsersStats();

  res.status(200).json({
    status: 'success',
    data: { usersStats },
  });
});
