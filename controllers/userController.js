const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterdObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  //TODO: SEND RESPONSE
  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    results: users.length,
    data: { users },
  });
});


exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: "This route isn't implemented yet !!",
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) IF USER WANT TO UPDATE PASSWORD , GENERTE ERROR
  console.log(req.body);
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
  // 3) UPDATE USER
  // console.log({id : req.body.id})
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
    new: true,
    runValidators: true,
  });
  // console.log(updatedUser)
  // 4) SEND RES BACK TO CLIENT
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
  
  console.log(req.user)
  res.status(204).json({
    status: 'success',
    data: 'null',
  });
});

exports.createUser = factory.createOne(User);

//! dO NOT ATTEMPT TO CHANGE PASSWORD FROM HERE BECAUSE THE SAVE MIDDLEWARE WILL NOT RUN
exports.updateUser = factory.updateOne(User)

exports.deleteUser = factory.deleteOne(User);