const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

/**
 * Service to handle review business logic
 * Decoupled from Express (No req, res)
 */

exports.createReview = async (reviewData) => {
  const newReview = await Review.create(reviewData);
  return newReview;
};

exports.getAllReviews = async (queryStr, filter = {}) => {
  const features = new ApiFeatures(Review.find(filter), queryStr)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query;
  return reviews;
};

exports.getReview = async (id) => {
  const review = await Review.findById(id);
  if (!review) {
    throw new AppError('No review found with that ID', 404);
  }
  return review;
};

exports.updateReview = async (id, updateData) => {
  const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedReview) {
    throw new AppError('No review found with that ID', 404);
  }

  return updatedReview;
};

exports.deleteReview = async (id) => {
  const deletedReview = await Review.findByIdAndDelete(id);

  if (!deletedReview) {
    throw new AppError('No review found with that ID', 404);
  }

  return deletedReview;
};
