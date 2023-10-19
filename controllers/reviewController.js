const Review = require('../models/reviewModel');
// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) {
//     filter = {
//       tour: req.params.tourId,
//     };
//   }

//   const reviews = await Review.find(filter);

//   if (!reviews) {
//     return next(new AppError('No reviews found', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     reviewsResults: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });
exports.setTourIds = (req, res, next) => {
  //*APPLYING NESTED ROUTES
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};
//*USING FACTORY HANDLER
exports.getAllReviews = factory.getAll(Review)
exports.getReview = factory.getOne(Review )
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
