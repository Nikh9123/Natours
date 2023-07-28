const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      trim: true,
      unique: true,
      maxLength: [60, 'A tour name must have less or equal then 40 chars'],
      minLength: [5, 'A tour name must have more or equal then 5 chars'],
      // validate:[ validator.isAlphanumeric , 'tour name only contains alpha numeric value']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, `A tour must have it's duration`],
    },
    maxGroupSize: {
      type: Number,
      required: [true, `A tour must have it's group size`],
    },
    difficulty: {
      type: String,
      required: [
        true,
        'A tour must have difficulty level from easy , medium , hard',
      ],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'the difficulty should be choosen from easy , medium , hard',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be given between 1 to 5'],
      max: [5, 'rating must not be greater then 5'],
      set: val => Math.round(val * 10)/10 
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    priceDiscount: {
      type: String,
      validate: {
        validator: function (val) {
          const value = val.replace('%', '') * 1;
          //this points to current doc
          const discountMoney = (value * this.price) / 100;
          console.log(' 🌋🌋🌋🌋', discountMoney);
          return discountMoney <= this.price;
        },
        message:
          'the discount value ({VALUE}) should be less than regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, `A tour must have it's summary`],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, `A tour must have a image`],
    },
    images: [String],
    createdAT: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GEOLOCATION
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//*INDEXING TO MAKE DATABASE QUERY FASTER    
// tourSchema.index({price:1 })
tourSchema.index({price:1 , ratingsAverage:-1 });
tourSchema.index({slug : 1});
tourSchema.index({startLocation : '2dsphere'})



//*virtual fields
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//* VIRTUAL POPULATE 
tourSchema.virtual('reviews', {
  ref:'Review' ,
  foreignField:'tour',

  localField:'_id'
})


//* DOCUMENT MIDDLEWARE RUNS BEFORE .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { upper: true });
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));

//   this.guides = await Promise.all(guidesPromise);

//   next();
// });
// tourSchema.pre('save',
// function (next){
// console.log('will save the document');
// next();

// })

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//* QUERY MIDDLEWARE RUNS BEFORE .find() etc

tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides' ,
    select: '-__v -passwordChangedAt',
  })
  next();
});


//* QUERY MIDDLEWARE RUNS BEFORE AND POST .find() etc
tourSchema.post(/^find/, function (docs, next) {
  console.log('Query took ', Date.now() - this.start, 'ms');
  next();
});

//* AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
