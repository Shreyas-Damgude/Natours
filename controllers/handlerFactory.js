// Functions for all controllers using database models
const AppError = require(`${__dirname}/../utils/appError`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const APIFeatures = require(`${__dirname}/../utils/apiFeatures`);

// Creates a document
exports.createOne = function (Model) {
  return catchAsync(async function (request, response, next) {
    const newDoc = await Model.create(request.body);

    response.status(201).json({
      status: "success",
      data: { data: newDoc },
    });
  });
};

// Deletes a document
exports.deleteOne = function (Model) {
  return catchAsync(async function (request, response, next) {
    const doc = await Model.findByIdAndDelete(request.params.id);

    if (!doc) return next(new AppError("No document found with that id", 404));

    response.status(204).json({
      status: "success",
      data: null,
    });
  });
};

// Gets all documents
exports.getAll = function (Model) {
  return catchAsync(async function (request, response, next) {
    // To allow for nested GEt requests on tour
    const filter = request.params.tourId ? { tour: request.params.tourId } : {};

    // Execute query
    const features = new APIFeatures(Model.find(filter), request.query)
      .sort()
      .filter()
      .paginate()
      .limitFields();

    const doc = await features.query;

    // Send Response
    response.status(200).json({
      status: "success",
      results: doc.length,
      data: { data: doc },
    });
  });
};

// Gets a document
exports.getOne = function (Model, populateOptions) {
  return catchAsync(async function (request, response, next) {
    let query = Model.findById(request.params.id);

    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) return next(new AppError("No document found with that id", 404));

    response.status(200).json({
      status: "success",
      data: { data: doc },
    });
  });
};

// Updates a document
exports.updateOne = function (Model) {
  return catchAsync(async function (request, response, next) {
    const doc = await Model.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError("No document found with that id", 404));

    response.status(200).json({
      status: "success",
      data: { doc },
    });
  });
};
