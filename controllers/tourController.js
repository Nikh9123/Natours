const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

//*TOURS IMAGE UPLOAD FUNCTIONALITY
//images will be stored in memory of  req.file.buffer as a buffer
const multerStorage = multer.memoryStorage();

//*CREATING FILTER
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('not an image! Please upload only images👍', 400), false);
  }
};

//TO SAVE uploaded FILES
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// 4) imageUpload middleware
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

//--- upload single image
// upload.single('images') ;req.file

//--- upload multiple images
// upload.array('images',3);   req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) {
    return next();
  }
  console.log(req.files);

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  // 1) RESIZE imageCover  AND PROCESSING
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) images PROCESSING
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (image, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(image.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
      req.body.images.push(fileName);
    })
  );

  console.log('❌', req.body);

  next();
});

//* READING FILE FROM LOCAL FILE
// const tourFileContent = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage ,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// exports.getAllTours = catchAsync(async (req, res, next) => {
// try {
//   console.log(req.query);

// //TODO: BUILD QUERY
// //*[1A]  FILTERING 🧹🧹🧹🧹🧹🧹

// const queryObj = { ...req.query };
// const excludedFields = ['fields', 'page', 'sort', 'limit'];
// excludedFields.forEach((el) => delete queryObj[el]);

// //*[1B] : ADVANCE FILTERING(GREATER THAN , LESS THAN ,)

// let queryString = JSON.stringify(queryObj);
// console.log(queryString);
// queryString = queryString.replace(
//   /\b(gte|gt|lte|lt)\b/g,
//   (match) => `$${match}`
// );

// let query = Tour.find(JSON.parse(queryString));

//   //*[2] IF PARAMS HAVE SORTING
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(',').join(' ');
//   console.log(sortBy);
//   // sort(price , ratingsAverage)
//   query = query.sort(sortBy);
// } else {
//   query = query.sort(-'createdAT');
// }
// // filter object used in mongoDb
// {difficulty : 'easy' , duration:{$get:5}}

// filter object from req.query
//{difficulty: 'easy',duration: { gte: '5' }, limit: '2',page: '3',sort: '3'}

//   //*[3] FIELD limitFields
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   // console.log("😍😍😍😍",fields)
//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }

//   //*[4] PAGINATION
//127.0.0.1:8000/api/v1/tours?page=2&limit=10
//page1(1-10), page2(11-20), page3(21-30)

//^page=2&limit=10
// query = query.skip(10).limit(10) ;
// const pageVal = req.query.page * 1 || 1;
// const limitVal = req.query.limit * 1 || 100;
// // console.log("->>->>->>",pageVal , limitVal)
// const skipVal = (pageVal - 1) * limitVal;
// // console.log(skipVal)
// query = query.skip(skipVal).limit(limitVal);

// if (req.query.page) {
//   const tourCount = await Tour.countDocuments();
//   if (skipVal >= tourCount) throw new Error("This page doesn't exist");
// }

//   //TODO: EXECUTE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();
//   const tourContent = await features.query;

//   //TODO: SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     requestTime: req.requestTime,
//     results: tourContent.length,
//     data: { tours: tourContent },
//   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   // try {
//   const Id = req.params.id;
//   // const tour = await Tour.findOne({
//   //   _id: Id,
//   // });
//   const tour = await Tour.findById(Id).populate('reviews');

//   // const tour = await Tour.findById(Id).populate({
//   //   path: 'guides',
//   //   select: '-__v -passwordChangedAt',
//   // });

//   if (!tour) {
//     return next(new AppError('no tour found with that id', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: { tour },
//   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: 'There is some error !!',
//   //   });
//   // }
// });

// exports.createTour = catchAsync(
//   async (req, res, next) => {
//     // const newTour = new Tour({});
//     // newTour.save()

//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   }

// try {

// } catch (err) {
//   console.log('error 🔥🔥🔥', err);
//   res.status(400).json({
//     status: 'fail',
//     message: err,
//   });
// }
// };
// );

// exports.updateTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('no tour found with that id', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// } catch (err) {
//   console.log('error 🔥🔥🔥', err);
//   res.status(400).json({
//     status: 'fail',
//     message: err,
//   });
// }
// });

//* USING FACTORY FUNCTIONS
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   const Id = req.params.id;
//   const tour = await Tour.deleteOne( {_id : Id} );
//  console.log(tour.deletedCount)
//   if (!tour) {
//     return next(new AppError('no tour found with that id', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//   });
//   // } catch (err) {
//   //   console.log('error 🔥🔥🔥', err);
//   //   res.status(404);
//   // }
// });

//*AGGREGATION
exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
  // } catch (err) {
  //   console.log('error 🔥🔥🔥', err);
  //   res.status(404);
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1; //2021
  // $match : { "date": { $gte: new ISODate("2014-01-01"), $lt: new ISODate("2015-01-01") } }
  const month = new APIFeatures();
  console.log(month.numberToMonth(9));
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    // {
    //   $project : {
    //     _id : 0
    //   }
    // },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 6,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
  // } catch (err) {
  //   console.log('error 🔥🔥🔥', err);
  //   res.status(404);
  // }
});

exports.getToursWithIn = catchAsync(async (req, res, next) => {
  // /tours-within/:distance/center/:latlng/unit/:unit'
  const { latlng, distance, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = distance === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format of latlng',
        400
      )
    );
  }
  console.log(latlng, distance, unit);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'km' ? 0.001 : 0.000621;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format of latlng',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
