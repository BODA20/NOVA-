const Tour = require('../tour/tour.model');
const Review = require('../review/review.model');
const User = require('../user/user.model');

/**
 * Service to handle admin analytics and system health
 */

exports.getTourStats = async () => {
  return await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
};

exports.getMonthlyPlan = async (year) => {
  return await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
};

exports.getSystemHealth = async () => {
  const [userCount, tourCount, reviewCount] = await Promise.all([
    User.countDocuments(),
    Tour.countDocuments(),
    Review.countDocuments(),
  ]);

  return {
    users: userCount,
    tours: tourCount,
    reviews: reviewCount,
    timestamp: new Date(),
  };
};
