// Handler functions for authentication
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const User = require(`${__dirname}/../models/userModel`);
const AppError = require(`${__dirname}/../utils/appError`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);

// Signs the JWT
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

// Creates and sends the JWT
function createAndSendToken(user, statusCode, response) {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // Send JWT as a cookie
  response.cookie("jwt", token, cookieOptions);

  // Removes password from the output
  user.password = undefined;

  response.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
}

// Signs up new user
exports.signup = catchAsync(async function (request, response, next) {
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    role: request.body.role,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
  });

  createAndSendToken(newUser, 201, response);
});

// Logs in the user
exports.login = catchAsync(async function (request, response, next) {
  const { email, password } = request.body;

  // Check if email and password exists
  if (!email || !password)
    return next(new AppError("Please provide email and password", 400));

  // Check if the user exists and password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Incorrect email or password", 401));

  // If everything is ok, send token to client
  createAndSendToken(user, 200, response);
});

// Logs out the user
exports.logout = function (request, response) {
  response.cookie("jwt", "Logged Out", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  response.status(200).json({
    status: "success",
  });
};

// Checks if the JWT exists
exports.protect = catchAsync(async function (request, response, next) {
  // Get the token and check if it exists
  let token;

  if (request.headers.authorization?.startsWith("Bearer")) {
    token = request.headers.authorization.split(" ")[1];
  } else if (request.cookies.jwt) {
    token = request.cookies.jwt;
  }

  if (!token || token === "null")
    return next(
      new AppError("You are not logged in! Please login in to get access", 401)
    );

  // Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError("The user belonging to this token does no longer exist", 401)
    );

  // If user changes password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError(
        "User recently changed the password: Please login again",
        401
      )
    );

  request.user = currentUser;
  response.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!, checks if a user is logged in
exports.isLoggedIn = async function (request, response, next) {
  // Get the token and check if it exists
  const token = request.cookies.jwt;

  if (token) {
    try {
      // Verification of token
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      // Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      // If user changes password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) return next();

      // There is a logged in user
      response.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

// Restricts some roles to perform certain actions
exports.restrictTo = function (...roles) {
  return function (request, response, next) {
    if (!roles.includes(request.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

// Provides reset password url
exports.forgotPassword = catchAsync(async function (request, response, next) {
  // Get user based on POSTed email
  const { email } = request.body;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError("No user found with this email", 404));

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send it to user's email
  try {
    const resetURL = `${request.protocol}://${request.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    response.status(200).json({
      status: "success",
      message: "Token sent to email",
      resetURL,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email, Try again later"),
      500
    );
  }
});

// Resets the password
exports.resetPassword = catchAsync(async function (request, response, next) {
  // Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(request.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If token has not expired and there is user set the new password
  if (!user) return next(new AppError("Token is invalid or has expired", 400));

  user.passwordResetToken = undefined;
  user.password = request.body.password;
  user.passwordResetExpires = undefined;
  user.passwordConfirm = request.body.passwordConfirm;
  await user.save();

  // Update changedPasswordAt property for the user: Implemented in User model

  // Log the user in, send JWT
  createAndSendToken(user, 200, response);
});

// Updates the password
exports.updatePassword = catchAsync(async function (request, response, next) {
  // Get user from collection
  const user = await User.findById(request.user.id).select("+password");

  // Check if POSTed current password is correct
  if (
    !(await user.correctPassword(request.body.passwordCurrent, user.password))
  )
    return next(new AppError("Your current password is wrong", 401));

  // If password is correct, update
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  await user.save();

  // Log user in, send JWT
  createAndSendToken(user, 200, response);
});
