const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
// const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    // payment_method_types: ['card', 'google_pay'], // Add Google Pay to the allowed payment methods
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'inr',
          unit_amount: tour.price * 64,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
    mode: 'payment',
    payment_intent_data: {
      setup_future_usage: 'off_session', // Allow saving card for future off-session payments
    },
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

/**
 * Within the Stripe docs, they provide us with 3 test card numbers that we can use:

To test successful payments use: 4242 4242 4242 4242
To test declined payments use: 4000 0000 0000 0002
To test authorised payments (EU) use:  4000 0000 0000 3220

For all of these card numbers, you can enter any expiry date that is in the future. Also enter any 3 digit security code. You can also put any name in there.

When you submit the payment using one of these test cards, it will show up in your dashboard under payments.
 */

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //this is only temproray , because it is unsecure everyone can book tour if anyone access or know about this url , we will implement this after deploye on server

  const { tour, user, price } = req.query;

  if (!user || !price || !tour) {
    return next();
  }
  await Booking.create({ tour, user, price });

  //hiding url to make process little bit less transparent to user
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
