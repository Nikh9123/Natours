const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Bookings = require('../models/bookingModel');
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

exports.getSignUp = catchAsync(async (req, res, next) => {
  res.status(200).render('signUp', {
    title: 'Sign up',
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) find bookings
  const bookings = await Bookings.find({ user: req.user.id });

  // 2) find tours with thr returned ids
  const tourIds = bookings.map((el) => el.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIDAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  });
});
