const express = require("express");

const {
  protect,
  restrictTo,
} = require(`${__dirname}/../controllers/authController`);
const {
  getBooking,
  createBooking,
  deleteBooking,
  updateBooking,
  getAllBookings,
} = require(`${__dirname}/../controllers/bookingController`);

const router = express.Router();

router.use(protect, restrictTo("admin", "lead-guide"));

router.route("/").get(getAllBookings).post(createBooking);

router.route("/:id").get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
