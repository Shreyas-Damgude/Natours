// Handler functions for reviews
const Review = require(`${__dirname}/../models/reviewModel`);
const {
  getAll,
  getOne,
  createOne,
  deleteOne,
  updateOne,
} = require(`${__dirname}/handlerFactory`);

// Sets tour ID
exports.setTourId = function (request, response, next) {
  if (!request.body.tour) request.body.tour = request.params.tourId;
  if (!request.body.user) request.body.user = request.user.id;
  next();
};

// CRUD Operations
exports.getReview = getOne(Review);
exports.getAllReviews = getAll(Review);
exports.createReview = createOne(Review);
exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);
