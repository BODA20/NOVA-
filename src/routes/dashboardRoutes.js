const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware.protect);
// Restrict to admin and lead-guide
router.use(authMiddleware.restrictTo('admin', 'lead-guide'));

router.get('/overview', dashboardController.getOverview);
router.get('/revenue', dashboardController.getRevenue);
router.get('/bookings', dashboardController.getBookingsStats);
router.get('/top-tours', dashboardController.getTopTours);
router.get('/users', dashboardController.getUsersStats);

module.exports = router;
