const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.deleteOne = Model => catchAsync( async(req,res,next)=>{
 
  const doc = await Model.deleteOne({_id : req.params.id})
  console.log(doc.deletedCount)
  if (doc.deletedCount === 0) {
        return next(new AppError('no document found with that id', 404));
      }
    
      res.status(204).json({
        status: 'success',
        data:null
      });

})

exports.updateOne = Model =>catchAsync( async (req,res,next)=>{
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError('No document found with that id 🥹', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      doc,
    },
})
});

exports.createOne = Model => (catchAsync( async( req,res,next)=>{
  const newTour = await Model.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });  
}))

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   const Id = req.params.id;
//   const tour = await Tour.deleteOne({ _id: Id });

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