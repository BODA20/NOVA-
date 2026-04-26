const bookingService = require('../services/bookingService');
const catchAsync = require('../utils/catchAsync');

exports.createBooking = catchAsync(async (req, res, next) => {
  const { tourId } = req.body;
  const booking = await bookingService.createBooking(req.user.id, tourId);

  res.status(201).json({
    status: 'success',
    data: { booking },
  });
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await bookingService.getUserBookings(req.user.id);

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: { bookings },
  });
});

exports.getAllBookings = catchAsync(async (req, res, next) => {
  const bookings = await bookingService.getAllBookings(req.query);

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: { bookings },
  });
});
