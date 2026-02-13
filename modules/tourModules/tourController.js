const tourService = require('./tourService');
const catchAsync = require('../../common/errHandling/catchAsync');
const AppError = require('./../../common/errHandling/appError');

// Route Handlers
exports.getAllTours = catchAsync(async (req, res) => {
  const tours = await tourService.getAllTours(req.query);
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
});

// 4. Get Single Tour
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await tourService.getTour(req.params.id);

  if (!tour) return next(new AppError('No tour found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await tourService.createTour(req.body);
  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const deletedTour = await tourService.deleteTour(req.params.id);

  if (!deletedTour)
    return next(new AppError('No tour found with that ID', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// 6. Update Tour
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await tourService.updateTour(req.params.id, req.body);

  if (!tour) return next(new AppError('No tour found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',').map(Number);

  if (!lat || !lng) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide lat,lng in format lat,lng',
    });
  }
  const tours = await tourService.getToursWithin({ distance, lat, lng, unit });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',').map(Number);

  if (!lat || !lng) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide lat,lng in format lat,lng',
    });
  }

  const distances = await tourService.getDistances({ lat, lng, unit });

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: { distances },
  });
});
