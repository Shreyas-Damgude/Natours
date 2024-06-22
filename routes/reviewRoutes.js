// Review Routes
const express = require("express");

const {
  protect,
  restrictTo,
} = require(`${__dirname}/../controllers/authController`);
const {
  setTourId,
  getReview,
  createReview,
  deleteReview,
  updateReview,
  getAllReviews,
} = require(`${__dirname}/../controllers/reviewController`);

// Router
const router = express.Router({ mergeParams: true });

// Protect middleware
router.use(protect);

// Routes for CRUD operations
router
  .route("/")
  .get(protect, getAllReviews)
  .post(protect, restrictTo("user"), setTourId, createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(restrictTo("user", "admin"), updateReview)
  .delete(restrictTo("user", "admin"), deleteReview);

module.exports = router;
