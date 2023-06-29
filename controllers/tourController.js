const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

// const tourFileContent = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage ,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

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

    //*[2] IF PARAMS HAVE SORTING
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

    //*[3] FIELD limitFields
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   // console.log("😍😍😍😍",fields)
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }

    //*[4] PAGINATION
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

    //TODO: EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const tourContent = await features.query;

    //TODO: SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      results: tourContent.length,
      data: { tours: tourContent },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const Id = req.params.id;
    // const tour = await Tour.findOne({
    //   _id: Id,
    // });
    const tour = await Tour.findById(Id);
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'There is some error !!',
    });
  }
};

exports.createTour = async (req, res) => {
  // const newTour = new Tour({});
  // newTour.save()
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    console.log('error 🔥🔥🔥', err);
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    console.log('error 🔥🔥🔥', err);
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    const Id = req.params.id;
    await Tour.deleteOne({ _id: Id });
    res.status(204).json({
      status: 'success',
    });
  } catch (err) {
    console.log('error 🔥🔥🔥', err);
    res.status(404);
  }
};

//*AGGREGATION
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    console.log('error 🔥🔥🔥', err);
    res.status(404);
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; //2021
    // $match : { "date": { $gte: new ISODate("2014-01-01"), $lt: new ISODate("2015-01-01") } }
const month = new APIFeatures() ;
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
        $addFields : {
          month : '$_id'
        },
      },
      // {
      //   $project : {
      //     _id : 0 
      //   }
      // },
      {
        $sort : {
          numTourStarts : -1 ,
        }
      },
      {
        $limit : 6
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    console.log('error 🔥🔥🔥', err);
    res.status(404);
  }
};
