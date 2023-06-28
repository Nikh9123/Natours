const express = require('express');
const morgan = require('morgan');
const fs = require('fs');

const userRouter = require(`./routes/userRoutes`);
const tourRouter = require('./routes/tourRoutes');

const app = express();

//todo: <1> MIDDLEWARES
if(process.env.NODE_ENV==='development')
{
  app.use(morgan('dev'));
  // console.log(morgan('dev')) 
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
  console.log('hello from middleware 👍');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
}); 

//todo: <2> ROUTE HANDLERS

//todo: <3> TOUR ROUTES

//todo: <4> USER HANDLERS

//todo :<5> USERS ROUTE



//Mounting 
app.use('/api/v1/users', userRouter)
app.use('/api/v1/tours' , tourRouter)

//todo: <6> START SERVER
module.exports = app ;