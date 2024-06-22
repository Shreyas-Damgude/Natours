// User Routes
const express = require("express");

const {
  login,
  signup,
  logout,
  protect,
  restrictTo,
  resetPassword,
  forgotPassword,
  updatePassword,
} = require(`${__dirname}/../controllers/authController`);
const {
  getMe,
  getUser,
  deleteMe,
  updateMe,
  createUser,
  deleteUser,
  updateUser,
  getAllUsers,
  resizeUserPhoto,
  uploadUserPhoto,
} = require(`${__dirname}/../controllers/userController`);

// Router
const router = express.Router();

// Routes for authentication
router.post("/login", login);
router.get("/logout", logout);
router.post("/signup", signup);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

// Protect all routes after this middleware
router.use(protect);

router.get("/me", getMe, getUser);
router.delete("/deleteMe", deleteMe);
router.patch("/updatePassword", updatePassword);
router.patch("/updateMe", uploadUserPhoto, resizeUserPhoto, updateMe);

// Restrict the CRUD operations to admin only
router.use(restrictTo("admin"));

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
