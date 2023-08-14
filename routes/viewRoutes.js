const express = require('express');
const viewController = require('../controllers/viewsController');
// const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();
router.get('/signup', authController.isLoggedIn, viewController.getSignUp);

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get(
  '/tour/:tourName',
  authController.isLoggedIn,
  viewController.getTour
);
//LogIn route
router.get('/login', authController.isLoggedIn, viewController.getLogIn);
router.get('/me', authController.protect, viewController.getAccount);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);
module.exports = router;
