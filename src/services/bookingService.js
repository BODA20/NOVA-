const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');

exports.createBooking = async (userId, tourId) => {
  // 1. Get the tour to get the price
  const tour = await Tour.findById(tourId);
  if (!tour) {
    throw new AppError('No tour found with that ID', 404);
  }

  // 2. Check for duplicate booking is handled by MongoDB unique index
  try {
    const booking = await Booking.create({
      tour: tourId,
      user: userId,
      price: tour.price,
      status: 'paid', // Simulating successful payment flow
    });
    return booking;
  } catch (error) {
    // 11000 is Mongo error code for duplicate key
    if (error.code === 11000) {
      throw new AppError('You have already booked this tour!', 400);
    }
    throw error;
  }
};

exports.getUserBookings = async (userId) => {
  const bookings = await Booking.find({ user: userId });
  return bookings;
};

exports.getAllBookings = async (queryString) => {
  // using basic query since this is a simple admin route
  const bookings = await Booking.find();
  return bookings;
};
