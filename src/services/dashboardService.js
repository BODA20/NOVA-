const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

exports.getOverviewMetrics = async () => {
  const totalUsers = await User.countDocuments();
  const totalTours = await Tour.countDocuments();
  const totalBookings = await Booking.countDocuments();
  
  const revenueAgg = await Booking.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
  ]);
  
  const ratingAgg = await Tour.aggregate([
    { $group: { _id: null, avgRating: { $avg: '$ratingsAverage' } } }
  ]);

  return {
    totalUsers,
    totalTours,
    totalBookings,
    totalRevenue: revenueAgg[0] ? revenueAgg[0].totalRevenue : 0,
    averageTourRating: ratingAgg[0] ? ratingAgg[0].avgRating.toFixed(2) : 0,
  };
};

exports.getRevenueAnalytics = async () => {
  // Revenue grouped by month
  const revenueByMonth = await Booking.aggregate([
    { $match: { status: 'paid' } },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$price' },
        bookings: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Revenue by tour difficulty
  const revenueByDifficulty = await Booking.aggregate([
    { $match: { status: 'paid' } },
    {
      $lookup: {
        from: 'tours',
        localField: 'tour',
        foreignField: '_id',
        as: 'tourData'
      }
    },
    { $unwind: '$tourData' },
    {
      $group: {
        _id: '$tourData.difficulty',
        revenue: { $sum: '$price' }
      }
    }
  ]);

  return { revenueByMonth, revenueByDifficulty };
};

exports.getBookingsStats = async () => {
  const bookingsPerTour = await Booking.aggregate([
    {
      $group: {
        _id: '$tour',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'tours',
        localField: '_id',
        foreignField: '_id',
        as: 'tourData'
      }
    },
    { $unwind: '$tourData' },
    {
      $project: {
        _id: 0,
        tourName: '$tourData.name',
        bookingsCount: '$count'
      }
    },
    { $sort: { bookingsCount: -1 } }
  ]);

  return bookingsPerTour;
};

exports.getTopTours = async () => {
  const stats = await this.getBookingsStats();
  return stats.slice(0, 5); // Return top 5
};

exports.getUsersStats = async () => {
  // Most active users (by bookings)
  const activeUsers = await Booking.aggregate([
    {
      $group: {
        _id: '$user',
        bookingsCount: { $sum: 1 },
        totalSpent: { $sum: '$price' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userData'
      }
    },
    { $unwind: '$userData' },
    {
      $project: {
        _id: 0,
        userName: '$userData.name',
        email: '$userData.email',
        bookingsCount: 1,
        totalSpent: 1
      }
    },
    { $sort: { bookingsCount: -1 } },
    { $limit: 10 }
  ]);

  return activeUsers;
};
