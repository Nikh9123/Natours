const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

//* STORE FILES(UPLOADED IMG) IN OUR FILE SYSTEM WITH NAME

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];

//     //filename - user-122937ewd8u82319-763827823
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

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

exports.uploadUserPhoto = upload.single('photo');

//resize img middleware
exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
  if (!req.file) {
    return next();
  }

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

  //crop images to
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

    next();
});

const filterdObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   res.status(200).json({
//     status: 'success',
//     requestTime: req.requestTime,
//     results: users.length,
//     data: { users },
//   });
// });

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) IF USER WANT TO UPDATE PASSWORD , GENERTE ERROR

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for updating password.Please go to /updateMyPassword ',
        400
      )
    );
  }

  // 2) FILTER THE REQ.BODY OBJ TO UPDATE ONLY SPECIFIED FIELDS
  const filterdBody = filterdObj(req.body, 'name', 'email');
  if (req.file) {
    filterdBody.photo = req.file.filename;
  }

  //* 3) UPDATE USER
  // console.log({id : req.body.id})
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
    new: true,
    runValidators: true,
  });
  // console.log(updatedUser)
  // 4)* SEND RES BACK TO CLIENT
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    data: 'null',
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User, null);
exports.createUser = factory.createOne(User);
//! dO NOT ATTEMPT TO CHANGE PASSWORD FROM HERE BECAUSE THE SAVE MIDDLEWARE WILL NOT RUN
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
