const mongoose = require('mongoose');
const User = require('../../src/models/userModel');
const Tour = require('../../src/models/tourModel');
const Booking = require('../../src/models/bookingModel');

exports.createTestUser = async (overrides = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: `testuser-${Date.now()}-${Math.random()}@example.com`,
    password: 'password123',
    passwordConfirm: 'password123',
    role: 'user',
    emailVerified: true
  };
  
  const user = await User.create({ ...defaultUser, ...overrides });
  return user;
};

exports.createTestTour = async (overrides = {}) => {
  const defaultTour = {
    name: `Tour-${Math.floor(Math.random() * 1000000000)}`,
    duration: 5,
    maxGroupSize: 10,
    difficulty: 'easy',
    price: 397,
    summary: 'A very cool test tour',
    description: 'Detailed description of the test tour',
    imageCover: 'tour-1-cover.jpg',
    startLocation: {
      type: 'Point',
      coordinates: [-118.113491, 34.111745],
      address: 'Test Address',
      description: 'Test Location'
    }
  };

  const tour = await Tour.create({ ...defaultTour, ...overrides });
  return tour;
};

exports.createTestBooking = async (user, tour, overrides = {}) => {
  const defaultBooking = {
    user: user._id,
    tour: tour._id,
    price: tour.price,
    status: 'paid'
  };

  const booking = await Booking.create({ ...defaultBooking, ...overrides });
  return booking;
};
