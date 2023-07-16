const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide your name !'],
    match: [
      new RegExp(/^[a-zA-Z\s]+$/),
      '{VALUE} is not valid. Please use only letters'
    ],
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
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    maxLength: [20, 'passowrd must not be greater than 20 characters'],
    minLength: [6, 'passowrd must be greater than 6 characters'],
    unique: true,
    select: false,
  },
  passwordConfirm: {
    type: String,
    trim:true,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'please check your password again',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active :{
    type:Boolean ,
    default: true,
    select : false,
  }
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

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next){
  this.find({active:{$ne:false}})
  next();
})

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
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
