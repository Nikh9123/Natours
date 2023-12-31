const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const ms = require('ms');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

// this function will create a token and send it to the user
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { // this sign function will create a token which will take 3 arguments 1st is payload, 2nd is secret and 3rd is options
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // this function will create a token and send it to the user
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  console.log(user);

  // Calculate the expiration date
  const expirationDate = new Date(Date.now() + ms(process.env.JWT_EXPIRES_IN));

  const cookieOptions = { // cookie options
    // Set the 'expires' option
    expires: expirationDate,
    httpOnly: true, // Prevents client side JS from reading the cookie and also this will prevent XSS attack also set cookie in browser and send it in every request
  };

  // if (clearCookie) {
  //   cookieOptions.expires = new Date(Date.now() - 1); // Expire the cookie immediately
  // }

  console.log("from cookie functio ", cookieOptions);

  res.cookie('jwt', token, cookieOptions);// this will set the cookie in browser

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true; // this will send cookie only in https connection
  }
  
  // Remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url)
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) CHECK IF EMAIL AND PASSWORD EXISTS
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) CHECK IF USER EXISTS
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }
  // 3) send tken
  createSendToken(user, 200, res);
});

exports.logOut = (req, res, next) => {
  // createSendToken(req.user, 200, res, true);
  res.cookie('jwt', 'youareloggigngout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) GETTING TOKEN AND CHECK IF IT'S THERE
  let token;
  if (
    req.headers.authorization && // the and condition is for if there is req.headers.authorization but it doesn't start with Bearer
    req.headers.authorization.startsWith('Bearer') // if there is a token in header then we will split it and get the token
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    //if there is a cookie in browser
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in..! please log in to get access.', 401)
    );
  }
  // 2) VERIFICATION OF TOKEN
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);// this will verify the token and decode it

  // 3) CHECK IF USER STILL EXISTS
  const currentUser = await User.findById(decoded.id);// this will check if the user still exists in database if exists then it will give the user data else it will give error
  if (!currentUser) {
    return next(
      new AppError('the user belonging to this token is no longer exists.', 401)
    );
  }
  // 4) CHECK IF USER PASSWORD CHANGED AFTER THE TOKEN WAS ISSUED
  if (currentUser.changedPasswordAfter(decoded.iat)) { // this will check if the user changed the password after the token was issued if yes then it means that the user is not logged in
    return next(
      new AppError('you recently changed password! Please log in again...', 401)
    );
  }

  req.user = currentUser;
  
  //PASSING DATA TO PUG TEMPLATE
  res.locals.user = currentUser;

  //IF ERROR IN CODE THEN GOTO ERROR HANDLER ELSE GIVE ACCESS TO RUN OTHER MIDDLEWARE, GRANT ACCESS TO PROTECTED ROUTE
  next();
});

//FOR RENDERING PAGES ONLY
exports.isLoggedIn = async (req, res, next) => {
  // 1) GETTING TOKEN AND CHECK IF IT'S THERE IS LOGGED IN USERS
  if (req.cookies.jwt) {
    //if there is a cookie in browser
    // 2) VERIFICATION OF TOKEN
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3) CHECK IF USER STILL EXISTS
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      // 4) CHECK IF USER PASSWORD CHANGED AFTER THE TOKEN WAS ISSUED
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //THERE IS A LOGGED IN USER, PASSING DATA TO PUG TEMPLATE
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };

exports.forgotPassword = async (req, res, next) => {
  // 1) GET USER BASED ON POSTED EMAIL
  const user = await User.findOne({ email: req.body.email });

  // 2) GENERATE RANDOM RESET TOKEN
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) SEND IT TO USER'S EMAIL ADDRESS

  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'token sent to email!',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email, Try again after sometime!',
        500
      )
    );
  }
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired ', 400));
  }

  // 2)if token isn't expired and there is user , set the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // 3) updte changedPasswordAt property for the user
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user from collection
  // console.log('😘😘😘😘', req.body);
  const user = await User.findById(req.user.id).select('+password');

  // // 2) check if POSTed current password is correct
  // console.log('❌', req.body.oldPassword, '🫠', user.password);
  // console.log('🧔‍♂️', user);

  if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
    return next(new AppError('Your old password is wrong...', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate() will not work here because we ahve to validate using save function

  // 3) log user in , send JWT
  createSendToken(user, 200, res);
});
