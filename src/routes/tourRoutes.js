const express = require('express');
const tourController = require('../controllers/tourController');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const {
  createTourSchema,
  updateTourSchema,
} = require('../middlewares/validators/tourValidator');

const router = express.Router();

router.route('/tour-stats').get(dashboardController.getTourStats);
router.route('/monthly-plan/:year').get(dashboardController.getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead-guide'),
    validate(createTourSchema),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead-guide'),
    validate(updateTourSchema),
    tourController.updateTour,
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
