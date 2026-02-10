const express = require('express');
const tourController = require('./tourController');
const tourMiddlewares = require('./../../common/middelWare/tourMiddlewares');
const dashboardController = require('./dashBoard/dashboardController');
const authController = require('./../userModels/authController');
const { createTourSchema, updateTourSchema } = require('./tour.validator');
const router = express.Router();

// Dashboard (restricted)
router
  .route('/tour-stats')
  .get(
    authController.protect,
    authController.alloweOnly('admin', 'lead-guide'),
    dashboardController.getTourStats,
  );

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.alloweOnly('admin', 'lead-guide'),
    dashboardController.getMonthlyPlan,
  );

router
  .route('/top-5-cheap')
  .get(
    authController.protect,
    tourMiddlewares.aliasTopTours,
    authController.alloweOnly('admin', 'lead-guide'),
    tourController.getAllTours,
  );

// Tours
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(
    authController.protect,
    authController.alloweOnly('admin', 'lead-guide'),
    tourMiddlewares.validate(createTourSchema, 'body'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(authController.protect, tourController.getTour)
  .patch(
    authController.protect,
    authController.alloweOnly('admin', 'lead-guide'),
    tourMiddlewares.validate(updateTourSchema, 'body'),
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.alloweOnly('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
