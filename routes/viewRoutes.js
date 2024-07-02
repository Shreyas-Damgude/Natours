// View Routes
const express = require("express");

const { isBooked } = require(`${__dirname}/../controllers/bookingController`);
const {
  isLoggedIn,
  protect,
} = require(`${__dirname}/../controllers/authController`);
const {
  getTourTemp,
  getLoginTemp,
  getSignupTemp,
  getAccountTemp,
  updateUserData,
  getBookingsTemp,
  getOverviewTemp,
  getResetPasswordTemp,
  getForgotPasswordTemp,
} = require(`${__dirname}/../controllers/viewController`);

// Router
const router = express.Router();

// Routes
router.get("/me", protect, getAccountTemp);
router.get("/", isLoggedIn, getOverviewTemp);
router.get("/login", isLoggedIn, getLoginTemp);
router.get("/signup", isLoggedIn, getSignupTemp);
router.get("/forgot-password", getForgotPasswordTemp);
router.post("/submit-user-data", protect, updateUserData);
router.get("/reset-password/:resetToken", getResetPasswordTemp);
router.get("/my-bookings", protect, isLoggedIn, getBookingsTemp);
router.get("/tour/:slug", protect, isLoggedIn, isBooked, getTourTemp);

module.exports = router;
