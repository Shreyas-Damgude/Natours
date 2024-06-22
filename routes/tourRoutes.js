// Tour Routes
const express = require("express");

const reviewRouter = require(`${__dirname}/reviewRoutes`);
const {
  protect,
  restrictTo,
} = require(`${__dirname}/../controllers/authController`);
const {
  getTour,
  createTour,
  deleteTour,
  updateTour,
  getAllTours,
  getDistances,
  getTourStats,
  aliasTopTours,
  getMonthlyPlan,
  getToursWithin,
  uploadTourImages,
  resizeTourImages,
} = require(`${__dirname}/../controllers/tourController`);

// Router
const router = express.Router();

// Nested route
router.use("/:tourId/reviews", reviewRouter);

// Route for tour statistics
router.route("/tour-stats").get(getTourStats);

// Route for top 5 cheap tours
router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

// Route for monthly plan
router
  .route("/monthly-plan/:year")
  .get(protect, restrictTo("admin", "lead-role", "guide"), getMonthlyPlan);

// Route for tours within radius
router.route("/distances/:latlng/unit/:unit").get(getDistances);

// Route for distances of tour from a location
router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(getToursWithin);

// Routes for CRUD operations
router
  .route("/")
  .get(getAllTours)
  .post(protect, restrictTo("admin", "lead-guide"), createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(
    protect,
    restrictTo("admin", "lead-guide"),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;
