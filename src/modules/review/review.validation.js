const Joi = require('joi');

/**
 * Joi validation schemas for review module
 */

exports.createReviewSchema = Joi.object({
  review: Joi.string().required().min(3).max(500),
  rating: Joi.number().required().min(1).max(5),
  tour: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  user: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
});

exports.updateReviewSchema = Joi.object({
  review: Joi.string().min(3).max(500),
  rating: Joi.number().min(1).max(5),
});
