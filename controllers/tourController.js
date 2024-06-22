// Handler functions for tours
const sharp = require("sharp");
const multer = require("multer");

const Tour = require(`${__dirname}/../models/tourModel`);
const AppError = require(`${__dirname}/../utils/appError`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const {
  getAll,
  getOne,
  createOne,
  deleteOne,
  updateOne,
} = require(`${__dirname}/handlerFactory`);

// Creates storage for images to be uploaded
const multerStorage = multer.memoryStorage();

// Creates filter
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

// Uploads and processes the uploaded images
exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

// Resizes the uploaded images
exports.resizeTourImages = catchAsync(async function (request, response, next) {
  if (!request.files.imageCover || !request.files.images) return next();

  // Sets new name of the uploaded image in the request body
  request.body.imageCover = `tour-${
    request.params.id
  }-${Date.now()}-cover.jpeg`;

  // Processes the uploaded image cover and stores them into the folder
  await sharp(request.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${request.body.imageCover}`);

  // Processes the uploaded images and stores them into the folder
  await Promise.all(
    request.files.images.map(async (file, i) => {
      request.body.images = [];
      const filename = `tour-${request.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      request.body.images.push(filename);
    })
  );

  next();
});

// Fetch Top 5 Cheap Tours
exports.aliasTopTours = function (request, response, next) {
  request.query.limit = "5";
  request.query.sort = "-ratingsAverage,price";
  request.query.fields = "name,price,ratingAverage,summary,difficulty";
  next();
};

// Fetches Tour Statistics
exports.getTourStats = catchAsync(async function (request, response, next) {
  const stats = await Tour.aggregate([
    { $match: { ratingAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        numRating: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);

  response.status(200).json({
    status: "success",
    results: stats.length,
    data: { stats },
  });
});

// Fetches Monthly Plan
exports.getMonthlyPlan = catchAsync(async function (request, response, next) {
  const year = +request.params.year;

  const plan = await Tour.aggregate([
    { $unwind: "$startDates" },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    { $addFields: { month: "$_id" } },
    { $project: { _id: 0 } },
    { $sort: { numTourStarts: -1 } },
  ]);

  response.status(200).json({
    status: "success",
    results: plan.length,
    data: { plan },
  });
});

// Fetches tours within the given radius
exports.getToursWithin = catchAsync(async function (request, response, next) {
  const { distance, latlng, unit } = request.params;
  const [lat, lng] = latlng.split(",");
  const radius = distance / (unit === "mi" ? 3963.2 : 6378.1);

  if (!lat || !lng)
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng",
        400
      )
    );

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  response.status(200).json({
    status: "success",
    results: tours.length,
    data: { data: tours },
  });
});

// Gets distances of all tours from the given location
exports.getDistances = catchAsync(async function (request, response, next) {
  const { latlng, unit } = request.params;
  const [lat, lng] = latlng.split(",");
  const distanceMultiplier = unit === "km" ? 0.001 : 0.001 / 1.6;

  if (!lat || !lng)
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng",
        400
      )
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [+lng, +lat],
        },
        distanceField: "distance",
        distanceMultiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  response.status(200).json({
    status: "success",
    data: { data: distances },
  });
});

// CRUD Operations
exports.getAllTours = getAll(Tour);
exports.createTour = createOne(Tour);
exports.deleteTour = deleteOne(Tour);
exports.updateTour = updateOne(Tour);
exports.getTour = getOne(Tour, { path: "reviews" });
