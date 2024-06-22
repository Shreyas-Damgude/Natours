// Handler functions for users
const sharp = require("sharp");
const multer = require("multer");

const User = require(`${__dirname}/../models/userModel`);
const AppError = require(`${__dirname}/../utils/appError`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const {
  getAll,
  getOne,
  createOne,
  deleteOne,
  updateOne,
} = require(`${__dirname}/handlerFactory`);

// // Creates storage for images to be uploaded
const multerStorage = multer.memoryStorage();

// Checks if the uploaded file is an image
function multerFilter(request, file, cb) {
  file.mimetype.startsWith("image")
    ? cb(null, true)
    : cb(new AppError("Not an image! Please upload only images", 400), false);
}

// Configuring multer
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Resizes the uploaded image
exports.resizeUserPhoto = catchAsync(async function (request, response, next) {
  if (!request.file) return next();

  request.file.filename = `user-${request.user.id}-${Date.now()}.jpeg`;

  await sharp(request.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${request.file.filename}`);

  next();
});

// Uploades the user image
exports.uploadUserPhoto = upload.single("photo");

// Filters the request body object
function filterObj(obj, ...allowedFields) {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
}

// Gets the details of logged in user
exports.getMe = function (request, response, next) {
  request.params.id = request.user.id;
  next();
};

// Updates the details of logged in user
exports.updateMe = catchAsync(async function (request, response, next) {
  // Create error if user POSTs password
  if (request.body.password || request.body.passwordConfirm)
    return next(
      new AppError(
        "This route is not for password updates, Please use /updateMyPassword",
        400
      )
    );

  // Filtered out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(request.body, "name", "email");
  request.file && (filteredBody.photo = request.file.filename);

  // Update User document
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  response.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// Deletes the logged in user
exports.deleteMe = catchAsync(async function (request, response, next) {
  await User.findByIdAndUpdate(request.user.id, { active: false });

  response.status(204).json({
    status: "success",
    data: null,
  });
});

// CRUD Operations
exports.getUser = getOne(User);
exports.getAllUsers = getAll(User);
exports.createUser = createOne(User);
exports.deleteUser = deleteOne(User);
exports.updateUser = updateOne(User);
