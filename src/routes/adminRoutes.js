const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.get('/tour-stats', adminController.getTourStats);
router.get('/monthly-plan/:year', adminController.getMonthlyPlan);
router.get('/system-health', adminController.getSystemHealth);

module.exports = router;
