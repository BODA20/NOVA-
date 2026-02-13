const appError = require('./appError');

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  // console.log(errors);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new appError(message, 400);
};
const handleDublicateFiledDb = (err) => {
  const value = err.keyValue
    ? Object.values(err.keyValue)[0]
    : err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Dublicate field value: ${value}. Please use another value!`;
  return new appError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new appError(message, 400);
};
const formatErrDev = (err) => {
  return {
    statusCode: err.statusCode,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  };
};

const formatErrProd = (err) => {
  if (err.isOperational) {
    return {
      status: err.status,
      message: err.message,
    };
  } else {
    console.error('ERROR 💥', err);
    return {
      status: 'error',
      message: 'Something went wrong!',
    };
  }
};

const handleJwtError = () => {
  return new appError('Invalid token. Please log in again!', 401);
};
const handleJwtExpiredError = () => {
  return new appError('Your token has expired! Please log in again.', 401);
};

module.exports = {
  formatErrDev,
  formatErrProd,
  handleCastErrorDB,
  handleDublicateFiledDb,
  handleValidationErrorDB,
  handleJwtError,
  handleJwtExpiredError,
};
