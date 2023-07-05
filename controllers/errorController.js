const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err)=>{
  const value = err.keyValue.name ;
  const message = `Creating duplicate fields with name ${value}, please use another value`
  return new AppError(message,400)
}

const sendErrorProd = (err, res) => {
  //TRUSTED OPERATIONAL ERROR : SEND MSG TO CLIENT
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //*PROGRAMMING AND UNKNOWN ERRORS(npm packages)
  else {
    //1) catch error and log into console
    console.error('🌋🌋🌋 Error', err);

    //2) send msg to user and hide details
    res.status(500).json({
      status: 'Error',
      mesaage: 'something went very wrong !',
    });
  }
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

exports.errorController = (err, req, res, next) => {
  // console.log("😍😍😍😍",err.stack);
  err.statusCode = err.statusCode || 500; //500 means internal server error
  err.status = err.status || 'error';

  // console.log("❌❌❌❌",err.code)
  // const error = {...err} ;
  // console.log("❌❌❌❌",error.name)

  if(process.env.NODE_ENV === 'development')
  {
    sendErrorDev(err,res);
  }
  else if(process.env.NODE_ENV === 'production')
  {
    let error = { ...err } ;
    if(err.name === 'CastError') error = handleCastErrorDB(error);
    if(err.code === 11000) error = handleDuplicateFieldsDB(error);

    sendErrorProd(error ,res);
  }
};
