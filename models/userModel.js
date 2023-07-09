const mongoose = require('mongoose');
// const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcrypt') ;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide your name !'],
    maxLength: [20, 'A user name must not be greater than 20 characters'],
    minLength: [5, 'A user name must have more or equal then 5 chars'],
  },
   email: {
    type: String,
    required: [true, 'A user must have his email id'],
    lowercase:true,
    validate: [
      validator.isEmail,
      'Please provide a valid email',
    ],
    unique: true,
  },
  photo:String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    maxLength: [20, 'passowrd must not be greater than 20 characters'],
    minLength: [6, 'passowrd must be greater than 6 characters'],
    unique: true,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate:{
      validator: function (el){
        return el===this.password;
      },
      message:'please check your password again'
    }
  }
});

userSchema.pre('save' , async function(next){

  //ONLY RUN FUNCTION IF PASSWORD ACTUALLY MODIFIED
  if(!this.isModified('password')) return next();

  //HASH PASSWORD WITH COST
  this.password =  await bcrypt.hash(this.password , 14) ;

  //DELETE PASSWORD CONFIRm
  this.passwordConfirm = undefined ;
  next();

})

const User = mongoose.model('User', userSchema);
module.exports = User;
