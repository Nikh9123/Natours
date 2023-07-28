const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide your name !'],
    match: [/^[a-zA-Z\s]+$/, '{VALUE} is not valid. Please use only letters'],
    maxLength: [20, 'A user name must not be greater than 20 characters'],
    minLength: [5, 'A user name must have more or equal then 5 chars'],
  },
  email: {
    type: String,
    required: [true, 'A user must have his email id'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  photo: {
    type: String,
    default: 'default.jpg ',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    maxLength: [20, 'passowrd must not be greater than 20 characters'],
    minLength: [6, 'passowrd must be greater than 6 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    trim: true,
    required: [true, 'Please confirm your password'],
    validate: {
      //this only works on create and save !!!
      validator: function (el) {
        return el === this.password; //abc === abc
      },
      message: 'please check your password again',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //ONLY RUN FUNCTION IF PASSWORD ACTUALLY MODIFIED
  if (!this.isModified('password')) return next();

  //HASH PASSWORD WITH COST
  this.password = await bcrypt.hash(this.password, 14);

  //DELETE PASSWORD CONFIRm
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  //sometime databse updation becomes slow , thats why we are subtracting 1sec to it
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }

  //false = not changed user exists
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //expirs after to 10mins
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
