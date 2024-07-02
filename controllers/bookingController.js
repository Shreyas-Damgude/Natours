const slugify = require("slugify");

const Booking = require(`${__dirname}/../models/bookingModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const {
  getAll,
  getOne,
  createOne,
  deleteOne,
  updateOne,
} = require(`${__dirname}/handlerFactory`);

exports.isBooked = catchAsync(async function (request, response, next) {
  const bookings = await Booking.find({ user: request.user.id });

  const booked = bookings.some(
    (booking) =>
      slugify(booking.tour.name, { lower: true }) === request.params.slug
  );

  response.locals.booked = booked;

  next();
});

// CRUD Operations
exports.getBooking = getOne(Booking);
exports.getAllBookings = getAll(Booking);
exports.createBooking = createOne(Booking);
exports.deleteBooking = deleteOne(Booking);
exports.updateBooking = updateOne(Booking);
