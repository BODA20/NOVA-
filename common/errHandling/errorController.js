const errorService = require('./errServices');
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const env = process.env.NODE_ENV?.trim() || 'development';

  if (env === 'development') {
    return res.status(err.statusCode).json(errorService.formatErrDev(err));
  }

  if (env === 'production') {
    let error = {
      ...err,
      message: err.message,
      name: err.name,
    };

    if (error.name === 'CastError') {
      error = errorService.handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = errorService.handleDublicateFiledDb(error);
    }

    if (error.name === 'ValidationError') {
      error = errorService.handleValidationErrorDB(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = errorService.handleJwtError();
    }
    if (error.name === 'TokenExpiredError') {
      error = errorService.handleJwtExpiredError();
    }

    return res.status(error.statusCode || 500).json({
      status: error.status || 'error',
      message: error.message || 'Internal Server Error',
    });
  }
};
