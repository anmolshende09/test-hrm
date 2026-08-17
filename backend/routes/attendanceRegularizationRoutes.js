const express = require("express");
const router = express.Router();
const {
  createRegularization,
  getRegularizations,
  reviewRegularization,
} = require("../controllers/attendanceRegularizationController");
const { protect, authorize } = require("../middleware/auth");
const {
  createRegularizationRules,
  reviewRegularizationRules,
  validate,
} = require("../validators/attendanceRegularizationValidator");

router.use(protect);

router
  .route("/")
  .get(getRegularizations)
  .post(authorize("admin", "hr_manager", "employee"), createRegularizationRules, validate, createRegularization);

router.put(
  "/:id/review",
  authorize("admin", "hr_manager"),
  reviewRegularizationRules,
  validate,
  reviewRegularization
);

module.exports = router;
