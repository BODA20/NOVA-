const express = require('express');
const tourController = require('./tourController');
const tourMiddlewares = require('./../../common/middelWare/tourMiddlewares');
const userMiddelware = require('./../../common/middelWare/userMiddlewares');
const dashboardController = require('./dashBoard/dashboardController');
const { createTourSchema, updateTourSchema } = require('./tour.validator');
const router = express.Router();

// Dashboard (restricted)
router
  .route('/tour-stats')
  .get(
    userMiddelware.protect,
    userMiddelware.restrictTo('admin', 'lead-guide'),
    dashboardController.getTourStats,
  );

router
  .route('/monthly-plan/:year')
  .get(
    userMiddelware.protect,
    userMiddelware.restrictTo('admin', 'lead-guide'),
    dashboardController.getMonthlyPlan,
  );

router
  .route('/top-5-cheap')
  .get(
    userMiddelware.protect,
    tourMiddlewares.aliasTopTours,
    userMiddelware.restrictTo('admin', 'lead-guide'),
    tourController.getAllTours,
  );

// Tours
router
  .route('/')
  .get(userMiddelware.protect, tourController.getAllTours)
  .post(
    userMiddelware.protect,
    userMiddelware.restrictTo('admin', 'lead-guide'),
    userMiddelware.validate(createTourSchema, 'body'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(userMiddelware.protect, tourController.getTour)
  .patch(
    userMiddelware.protect,
    userMiddelware.restrictTo('admin', 'lead-guide'),
    userMiddelware.validate(updateTourSchema, 'body'),
    tourController.updateTour,
  )
  .delete(
    userMiddelware.protect,
    userMiddelware.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

router
  .route('/within/:distance/center/:latlng/unit/:unit')
  .get(userMiddelware.protect, tourController.getToursWithin);

router
  .route('/distances/center/:latlng/unit/:unit')
  .get(userMiddelware.protect, tourController.getDistances);

module.exports = router;
