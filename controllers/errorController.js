const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = JSON.stringify(err.keyValue);
  // const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Creating duplicate fields with name ${value}, please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (msg) => {
  const message = msg.concat(' ', ',', 'please provide all required fields');
  return new AppError(message, 400);
};

// const handleValidationErrorDB = (err) =>
// {
//   const errors = Object.values(err.errors).map(el => el.message ) ;

//   const message = `Invalid data inputs. ${errors.join('. ')}`
//   return new AppError(message ,400);

// }

const sendErrorProd = (err, req, res) => {
  //TRUSTED OPERATIONAL ERROR : SEND MSG TO CLIENT

  // ERROR IS IN API THEN
  if (req.originalUrl.startsWith('/api')) {
    //OPERATIONaL ERROR
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    //PROGRAMMING AND UNKNOWN ERRORS(npm packages)

    //1) catch error and log into console
    console.error('🌋🌋🌋❌ Error', err);

    //2) send msg to user and hide details(api user)
    return res.status(500).json({
      status: 'Error',
      message: 'something went very wrong !',
    });
  }

  //RENDER ON WEBSITE client side error

  if (err.isOperational) {
    return res.status(500).render('error',{
      title: 'something went wrong',
      msg:err.message,
    });
  }

  //PROGRAMMING AND UNKNOWN ERRORS(npm packages)

  //1) catch error and log into console
  console.error('🌋🌋🌋 Error', err);

  //2) send msg to user and hide details
  res.status(500).render('error',{
    title: 'something went wrong',
    msg: 'Please try again later',
  });
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);
const handleJWTExpiredError = () =>
  new AppError('session expired ! please log in again ', 401);
const handlePasswordConfirmError = () =>
  new AppError('password and confirm password should be same ', 400);

const sendErrorDev = (err, req, res) => {
  //API ERRORS
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }
  //RENDER WEBSITE
  console.error('🌋🌋🌋 Error', err);
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: err.message,
  });
};

exports.errorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //500 means internal server error
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message ;
    
    // console.log(error)
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError')
      error = handleValidationErrorDB(err.message);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err.message === 'jwt malformed') error = handlePasswordConfirmError();
    // if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    sendErrorProd(error, req, res);
  }
};
