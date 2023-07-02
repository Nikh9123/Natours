exports.errorController = (err, req, res, next) => {
  // console.log("😍😍😍😍",err.stack);
  err.statusCode = err.statusCode || 500; //500 means internal server error
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
}