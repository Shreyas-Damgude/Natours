// Handler functions for views
const Tour = require(`${__dirname}/../models/tourModel`);
const User = require(`${__dirname}/../models/userModel`);
const AppError = require(`${__dirname}/../utils/appError`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);

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

// Renders home page
exports.getOverviewTemp = catchAsync(async function (request, response, next) {
  // Get tour data from collection
  const tours = await Tour.find();

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
