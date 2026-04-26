const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.getMyBookings);

router.use(authMiddleware.restrictTo('admin'));
router.get('/', bookingController.getAllBookings);

module.exports = router;
