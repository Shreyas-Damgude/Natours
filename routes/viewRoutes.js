// View Routes
const express = require("express");

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
router.get("/tour/:slug", isLoggedIn, getTourTemp);
router.get("/forgot-password", getForgotPasswordTemp);
router.post("/submit-user-data", protect, updateUserData);
router.get("/reset-password/:resetToken", getResetPasswordTemp);

module.exports = router;
