// Global error handler function
const AppError = require(`${__dirname}/../utils/appError`);

// Handles Cast Errors
function handleCastErrorDB(error) {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
}

// Handles Duplicate Field Errors
function handleDuplicateFieldDB(error) {
  const { name: value } = error.keyValue;
  const message = `Duplicate field value: ${value}, Please use another value`;
  return new AppError(message, 400);
}

// Handles Validation Errors
function handleValidationErrorDB(error) {
  const errors = Object.values(error.errors)
    .map((ele) => ele.message)
    .join(", ");
  const message = `Invalid input data: ${errors}`;
  return new AppError(message, 400);
}

// Handles Token Error
function handleTokenError() {
  return new AppError("Invalid token, Please log in again", 401);
}

// Handles Expired Token Errors
function handleTokenExpiredError() {
  return new AppError("Your token has expired! Please login again", 401);
}

// Sends error if app is running in development
function sendErrorDev(error, request, response) {
  // API
  if (request.originalUrl.startsWith("/api")) {
    return response.status(error.statusCode).json({
      status: error.status,
      error,
      message: error.message,
      stack: error.stack,
    });
  }

  // Rendered Website
  console.error(error);

  return response.status(error.statusCode).render("error", {
    title: "Something went wrong!",
    msg: error.message,
  });
}

// Sends error if app is running in production
function sendErrorProd(error, request, response) {
  // API
  if (request.originalUrl.startsWith("/api")) {
    // Operational Error
    if (error.isOperational) {
      return response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }

    // Programming Error
    console.error(error);

    return response.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }

  // Rendered website
  // Operational Error
  if (error.isOperational) {
    return response
      .status(error.statusCode)
      .render("error", { title: "Something went wrong", msg: error.message });
  } else {
    // Programming Error
    console.error(error);

    return response.status(error.statusCode).render("error", {
      title: "Something went wrong",
      msg: "Please try again later",
    });
  }
}

// Handles the error
module.exports = function (error, request, response, next) {
  error.statusCode ||= 500;
  error.status ||= "error";

  // Development
  if (process.env.NODE_ENV === "development")
    sendErrorDev(error, request, response);

  // Production
  if (process.env.NODE_ENV === "production") {
    let err = Object.create(error);
    if (error.code === 11000) err = handleDuplicateFieldDB(error);
    if (error.name === "CastError") err = handleCastErrorDB(error);
    if (error.name === "JsonWebTokenError") err = handleTokenError();
    if (error.name === "TokenExpiredError") err = handleTokenExpiredError();
    if (error.name === "ValidationError") err = handleValidationErrorDB(error);

    sendErrorProd(err, request, response);
  }
};
