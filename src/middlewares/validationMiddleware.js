const AppError = require('../utils/appError');

module.exports = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((el) => el.message).join(' | ');
      return next(new AppError(message, 400));
    }

    req[property] = value;
    next();
  };
};
