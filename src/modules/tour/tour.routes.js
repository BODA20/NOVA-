const express = require('express');
const tourController = require('./tour.controller');
const authController = require('../auth/auth.controller');
const reviewRouter = require('../review/review.routes');

const router = express.Router();

// Nested routes
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(
    // (req, res, next) => { req.query.limit = '5'; req.query.sort = '-ratingsAverage,price'; next(); },
    tourController.getAllTours,
  );

router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
