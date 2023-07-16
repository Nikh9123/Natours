const express = require('express');
const morgan = require('morgan');
const rateLimiter = require('express-rate-limit') ;
const mongoSanitize = require('express-mongo-sanitize') ;
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');


const userRouter = require(`./routes/userRoutes`);
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes')

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();


//^ GLOBAL MIDDLEWARES

//& SET Security HTTP HEADERS
app.use( helmet())

//& LIMIT THE UPCOMING REQUEST
const limiter = rateLimiter({
	windowMs: 60 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 60 minutes)
  message :"Too many requests from this IP , Try after sometimes !"
	// standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	// legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

//& Apply the rate limiting middleware to all requests
app.use('/api', limiter);

//& DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  // console.log(morgan('dev'))
}

//& BODY PARSER , READING DATA FROM THE REQ.BODY
app.use(express.json({limit:'10kb'}));

//&  DATA SANITIZATION AGAINST UNUSUAL NoSQL QUERY EJECTION
app.use(mongoSanitize())


//& DATA SANITIZATION AGAINST XSS ATTACK
app.use(xss());

//& PREVENT FROM PARAMETER POLLUTION
app.use(hpp({
  whitelist:['duration' ,'ratingsQuantity', 'ratingsAverage','maxGroupSize','difficulty','price']
}))

//& SERVING THE STATIC FILE
app.use(express.static(`${__dirname}/public`));

//& TO TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers)
  next();
});

//& ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(
  //   `No such ${req.originalUrl} route exists on this server`
  // );
  // err.statusCode = 404;
  // err.status = `fail`;

  next(
    new AppError(`No such ${req.originalUrl} route exists on this server`, 404)
  );
});

//^ global error handling
app.use(globalErrorHandler.errorController);

//todo: <6> START SERVER
module.exports = app;
