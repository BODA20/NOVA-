const reviewService = require('./review.service');
const catchAsync = require('../../utils/catchAsync');

/**
 * Controller to handle review requests
 * Calls service layer and handles Express response
 */

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await reviewService.getAllReviews(req.query, filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await reviewService.getReview(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { review },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await reviewService.createReview(req.body);

  res.status(201).json({
    status: 'success',
    data: { review: newReview },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const updatedReview = await reviewService.updateReview(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { review: updatedReview },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  await reviewService.deleteReview(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
