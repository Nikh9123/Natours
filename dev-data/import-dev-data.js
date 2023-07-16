const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('../models/tourModel');
const Review = require('../models/reviewModel');

dotenv.config({ path: '../config.env' });
const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Db connection successful !!!');
  });

//READ JSON FILE
const fileData = JSON.parse(
  fs.readFileSync('./data/tours.json', 'utf-8', (err) => {
    console.log(err);
  })
);

//IMPORT TO DATABASE
const importData = async () => {
  try {
    await Tour.create(fileData);
    console.log('data saved to database successfully !!!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const importReviewData = async () =>{
  try{
    await Review.create(fileData);
    console.log('data saved to database successfully !!!')
    process.exit()
  }
  catch(err){
    console.log(err)
  }
}

const deleteReviewData = async ()=>{
  try{
await Review.deleteMany();
console.log('reviews are deleted from databse succefully !!!👍👍👍')
process.exit()
  }catch(err){
console.log("❌",err)
  }
}

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data deleted successfully !!!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// console.log(process.argv)
if (process.argv[2] === '--importTour') {
  importData();
} else if (process.argv[2] === '--deleteTour') {
  deleteData();
}


if(process.argv[2] === '--importReview')
{
  importReviewData();
}
else if(process.argv[2] === '--deleteReview')
{
  deleteReviewData();
}