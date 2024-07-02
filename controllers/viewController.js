// Handler functions for views
const Tour = require(`${__dirname}/../models/tourModel`);
const User = require(`${__dirname}/../models/userModel`);
const AppError = require(`${__dirname}/../utils/appError`);
const Booking = require(`${__dirname}/../models/bookingModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const APIFeatures = require(`${__dirname}/../utils/apiFeatures`);

// Renders the tour page
exports.getTourTemp = catchAsync(async function (request, response, next) {
  // Get tour data from collection
  const tour = await Tour.findOne({ slug: request.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  // If there is no tour
  if (!tour) return next(new AppError("There is no tour with that name", 404));

  // Render that template using tour data from above
  response.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

// Renders the bookings page
exports.getBookingsTemp = catchAsync(async function (request, response, next) {
  const features = new APIFeatures(
    Booking.find({ user: request.user.id }),
    request.query
  )
    .sort()
    .filter()
    .paginate()
    .limitFields();

  // Get tour data from collection
  const bookings = await features.query;
  const tourIds = [];
  bookings.forEach((booking) => tourIds.push(booking.tour.id));
  const tours = await Tour.find({ _id: { $in: tourIds } });

  // Render that template using tour data from above
  response.status(200).render("overview", {
    title: "My Bookings",
    tours,
  });
});

// Renders home page
exports.getOverviewTemp = catchAsync(async function (request, response, next) {
  const features = new APIFeatures(Tour.find(), request.query)
    .sort()
    .filter()
    .paginate()
    .limitFields();

  // Get tour data from collection
  const tours = await features.query;

  // Render that template using tour data from above
  response.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

// Renders login page
exports.getLoginTemp = function (request, response) {
  response.status(200).render("login", {
    title: "Log into your account",
  });
};

// Renders signup page
exports.getSignupTemp = function (request, response) {
  response.status(200).render("signup", {
    title: "Create your new account",
  });
};

// Renders user account page
exports.getAccountTemp = function (request, response) {
  response.status(200).render("account", {
    title: "Your Account",
  });
};

// Renders forgot password page
exports.getForgotPasswordTemp = function (request, response) {
  response.status(200).render("forgotPassword", {
    title: "Forgot Password",
  });
};

// Renders reset password page
exports.getResetPasswordTemp = function (request, response) {
  response.status(200).render("resetPassword", {
    title: "Reset Password",
  });
};

// Updates the user details(name and email)
exports.updateUserData = catchAsync(async function (request, response, next) {
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    {
      name: request.body.name,
      email: request.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  response.status(200).render("account", {
    title: "Your Account",
    user: updatedUser,
  });
});
