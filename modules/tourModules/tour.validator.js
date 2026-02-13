const Joi = require('joi');

const difficultyValues = ['easy', 'medium', 'difficult'];

const geoPointSchema = Joi.object({
  type: Joi.string().valid('Point').default('Point'),
  coordinates: Joi.array()
    .ordered(
      Joi.number().min(-180).max(180).required(), // lng
      Joi.number().min(-90).max(90).required(), // lat
    )
    .required(),
  address: Joi.string().optional(),
  description: Joi.string().optional(),
});

exports.createTourSchema = Joi.object({
  name: Joi.string().trim().min(10).max(40).required(),
  secretTour: Joi.boolean().default(false),

  price: Joi.number().min(0).required(),
  priceDiscount: Joi.number().min(0).optional(),

  ratingsAverage: Joi.number().min(1).max(5).default(4.5),
  ratingsQuantity: Joi.number().min(0).default(0),

  maxGroupSize: Joi.number().integer().min(1).required(),
  difficulty: Joi.string()
    .valid(...difficultyValues)
    .required(),

  duration: Joi.number().min(1).required(),

  summary: Joi.string().trim().required(),
  description: Joi.string().trim().allow('', null),

  imageCover: Joi.string().required(),
  images: Joi.array().items(Joi.string()).default([]),

  createdAt: Joi.date().optional(),
  startDates: Joi.array().items(Joi.date()).default([]),

  startLocation: geoPointSchema.required(),
  locations: Joi.array()
    .items(
      geoPointSchema.keys({
        day: Joi.number().integer().min(1).optional(),
      }),
    )
    .default([]),
}).custom((value, helpers) => {
  if (
    value.priceDiscount !== undefined &&
    value.priceDiscount !== null &&
    value.priceDiscount >= value.price
  ) {
    return helpers.message('priceDiscount must be below price');
  }
  return value;
});

exports.updateTourSchema = Joi.object({
  name: Joi.string().trim().min(10).max(40),
  secretTour: Joi.boolean(),

  price: Joi.number().min(0),
  priceDiscount: Joi.number().min(0),

  ratingsAverage: Joi.number().min(1).max(5),
  ratingsQuantity: Joi.number().min(0),

  maxGroupSize: Joi.number().integer().min(1),
  difficulty: Joi.string().valid(...difficultyValues),

  duration: Joi.number().min(1),

  summary: Joi.string().trim(),
  description: Joi.string().trim().allow('', null),

  imageCover: Joi.string(),
  images: Joi.array().items(Joi.string()),

  startDates: Joi.array().items(Joi.date()),

  startLocation: geoPointSchema,
  locations: Joi.array().items(
    geoPointSchema.keys({
      day: Joi.number().integer().min(1).optional(),
    }),
  ),
})
  .min(1)
  .custom((value, helpers) => {
    if (
      value.price !== undefined &&
      value.priceDiscount !== undefined &&
      value.priceDiscount >= value.price
    ) {
      return helpers.message('priceDiscount must be below price');
    }
    return value;
  });

exports.tourStatsQuerySchema = Joi.object({
  minRating: Joi.number().min(1).max(5).optional(),
  difficulty: Joi.string()
    .valid(...difficultyValues)
    .optional(),
});
