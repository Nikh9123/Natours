const Tour = require('../models/tourModel');
// const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) GET THE TOUR DATA FROM COLLECTION
  const tours = await Tour.find();

  // 2) BUILD TEMPLATE

  // 3) RENDER THAT TEMPLATE USING TOUR DATA FROM 1)

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { tourName } = req.params;
  const tour = await Tour.findOne({ slug: tourName }).populate({
    path: 'reviews',
    fields: 'user rating review',
  });

  if (!tour) {
    return next(
      new AppError(`There is no tour with */${tourName}* tour name`, 404)
    );
  }
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLogIn = catchAsync(async (req, res, next) => {
  console.log(req.body);
  res.status(200).render('login', {
    title: 'log in to your account',
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
});

// exports.updateUserData = catchAsync(async (req, res, next) => {
  
//   res.status(200).render('account', {
//     title: 'Your account',
//     user: updatedUser,
//   });
// });
