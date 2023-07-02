const express = require('express');
const morgan = require('morgan');
const fs = require('fs');

const userRouter = require(`./routes/userRoutes`);
const tourRouter = require('./routes/tourRoutes');

const app = express();

//todo: <1> MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  // console.log(morgan('dev'))
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//todo: <2> ROUTE HANDLERS

//todo: <3> TOUR ROUTES

//todo: <4> USER HANDLERS

//todo :<5> USERS ROUTE

//Mounting
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message:`No such ${req.originalUrl} route exists`,
  // });
  const err = new Error(
    `No such ${req.originalUrl} route exists on this server`
  );
  err.statusCode = 404;
  err.status = `fail`;

  next(err);
});

//^ global error handling
app.use((err, req, res, next) => {
  // console.log("😍😍😍😍",err.stack);
  err.statusCode = err.statusCode || 500; //500 means internal server error
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status : err.status ,
    message: err.message 
  });
});
//todo: <6> START SERVER
module.exports = app;
