const express = require('express');
const adminController = require('./admin.controller');
const authController = require('../auth/auth.controller');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router.get('/tour-stats', adminController.getTourStats);
router.get('/monthly-plan/:year', adminController.getMonthlyPlan);
router.get('/system-health', adminController.getSystemHealth);

module.exports = router;
